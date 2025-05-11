// Inspired by https://www.npmjs.com/package/react-audio-visualize

import React, { useEffect, useRef } from 'react';

// Helper function to calculate bar data
const calculateBarData = (frequencyData, width, barWidth, barGap) => {
    // Calculate how many bars can fit
    // Allow for a gap after the last bar for consistent spacing calculation
    let units = width / (barWidth + barGap);
    let step = Math.floor(frequencyData.length / units);

    if  (units > frequencyData.length) {
        units = frequencyData.length;
        step = 1;
    }

    const dataPoints = [];
    for (let i = 0; i < units; i++) {
        let sum = 0;
        for (let j = 0; j < step && i * step + j < frequencyData.length; j++) {
            sum += frequencyData[i * step + j];
        }
        dataPoints.push(sum / step);
    }
    return dataPoints;
};



// Helper function to draw the visualization
const drawVisualization = (dataPoints, canvas, barWidth, barGap, backgroundColor, barColor) => {
    if (!canvas) return;
    const amp = canvas.height / 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    dataPoints.forEach((point, index) => {
        ctx.fillStyle = barColor;
        const x = index * (barWidth + barGap);
        const y = amp - point / 2;
        const width = barWidth;
        const height = point || 1;
        ctx.beginPath();
        if (ctx.roundRect) {
          // making sure roundRect is supported by the browser
            ctx.roundRect(x, y, width, height, 10);
            ctx.fill();
        } else {
            // fallback for browsers that do not support roundRects
            ctx.fillRect(x, y, width, height);
        }
    });
};


const LiveAudioVisualizer = ({
    mediaRecorder,
    width = 200,
    height = 75,
    barWidth = 2,
    barGap = 1,
    backgroundColor = "transparent",
    barColor = "rgb(160, 198, 255)",
    fftSize = 1024,
    smoothingTimeConstant = 0.6, // Default from original: 0.4. Lower = faster, more jittery. Higher = smoother.
    minDecibels = -90,
    maxDecibels = -10,
}) => {
    const canvasRef = useRef(null);
    const animationFrameIdRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);

    useEffect(() => {
        const currentCanvas = canvasRef.current;
        if (!currentCanvas) return;

        // Function to draw an empty/default state
        const drawEmptyState = () => {
            const emptyDataPoints = calculateBarData([], currentCanvas.width, barWidth, barGap);
            drawVisualization(emptyDataPoints, currentCanvas, barWidth, barGap, backgroundColor, barColor);
        };

        // Guard: Exit if MediaRecorder or its stream is not available/active
        if (!mediaRecorder || !mediaRecorder.stream || !mediaRecorder.stream.active) {
            // Cleanup previous resources if they exist
            if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
            if (sourceRef.current) sourceRef.current.disconnect();
            // Analyser is implicitly disconnected if source is and context is closed
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(e => console.warn("Visualizer: Error closing AudioContext on invalid stream:", e));
            }
            // Reset refs
            animationFrameIdRef.current = null;
            sourceRef.current = null;
            analyserRef.current = null;
            audioContextRef.current = null;

            // Clear canvas to a blank state
            drawEmptyState();
            return;
        }

        // --- Setup AudioContext and Nodes ---
        // These are created fresh if mediaRecorder instance changes, or stream changes.
        const localAudioContext = new AudioContext();
        audioContextRef.current = localAudioContext;

        const localAnalyser = localAudioContext.createAnalyser();
        analyserRef.current = localAnalyser;
        localAnalyser.fftSize = fftSize;
        localAnalyser.smoothingTimeConstant = smoothingTimeConstant;
        localAnalyser.minDecibels = minDecibels;
        localAnalyser.maxDecibels = maxDecibels;

        const localSource = localAudioContext.createMediaStreamSource(mediaRecorder.stream);
        sourceRef.current = localSource;
        localSource.connect(localAnalyser);


        const renderFrame = () => {
            // Ensure all critical components are still valid and recording is active
            if (!analyserRef.current || !currentCanvas || !mediaRecorder ||
                mediaRecorder.state !== "recording" ||
                audioContextRef.current.state === 'closed') {

                if (animationFrameIdRef.current) {
                    cancelAnimationFrame(animationFrameIdRef.current);
                    animationFrameIdRef.current = null;
                }
                // Draw empty if state changed or resources are gone
                drawEmptyState();
                return;
            }

            // Create a new Uint8Array for frequency data each frame
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);

            const dataPoints = calculateBarData(dataArray, currentCanvas.width, barWidth, barGap);
            drawVisualization(dataPoints, currentCanvas, barWidth, barGap, backgroundColor, barColor);

            animationFrameIdRef.current = requestAnimationFrame(renderFrame);
        };

        if (mediaRecorder.state === "recording") {
            renderFrame();
        } else {
            // If not recording (e.g., paused or initialized but not started), draw an empty state
            if (currentCanvas) {
                const emptyDataPoints = calculateBarData([], currentCanvas.width, barWidth, barGap);
                drawVisualization(emptyDataPoints, currentCanvas, barWidth, barGap, backgroundColor, barColor);
            }
        }

        // --- Cleanup function for this effect ---
        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
                animationFrameIdRef.current = null;
            }
            if (sourceRef.current) {
                sourceRef.current.disconnect();
                sourceRef.current = null;
            }
            // No explicit disconnect needed for analyser if source is gone & context closes
            analyserRef.current = null;

            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close()
                    .then(() => console.log(/*"Visualizer: AudioContext closed cleanly."*/))
                    .catch(e => console.warn("Visualizer: Error closing AudioContext:", e));
                audioContextRef.current = null;
            }
        };
    // Dependencies: Re-run effect if any of these change.
    // mediaRecorder.stream is key for reacting to the actual audio source.
    // mediaRecorder.state is key for starting/stopping animation.
    }, [mediaRecorder, mediaRecorder?.stream, mediaRecorder?.state,
        width, height, barWidth, barGap, backgroundColor, barColor,
        fftSize, smoothingTimeConstant, minDecibels, maxDecibels])

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{ display: 'block' }} // Ensures canvas takes up its block space
        />
    );
};

export default LiveAudioVisualizer;