import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import LiveAudioVisualizer from './LiveAudioVisualizer';
import '../styles/AudioRecorder.css';

const AudioRecorder = ( {onRecordingComplete, operation }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    // recordedChunks can be kept if needed for other UI reactivity during recording.
    // For this simplification, we'll rely on the ref for blob creation.
    // const [recordedChunks, setRecordedChunks] = useState([]);

    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        // Cleanup: if component unmounts while recording, stop the mediaRecorder
        return () => {
            if (mediaRecorderRef.current) {
                const recorder = mediaRecorderRef.current;
                if (recorder.state === "recording") {
                    recorder.stop(); // This will trigger onstop
                }
                if (recorder.stream) {
                    recorder.stream.getTracks().forEach(track => track.stop());
                    console.log('AudioRecorder: Stream tracks stopped on unmount.');
                }
            }
        };
    }, []);

    const startRecording = async () => {
        if (isRecording) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            mediaRecorderRef.current = recorder;
            recordedChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                    // Optionally update state if you need to react to chunks during recording,
                    // but for final blob, ref is safer for onstop.
                    // setRecordedChunks((prev) => [...prev, event.data]);
                }
            };

            recorder.onstop = async () => {
                console.log('Recording stopped, processing audio.');
                const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
                // Reset for next recording, do this after blob creation
                recordedChunksRef.current = [];


                if (audioBlob.size === 0) {
                    console.warn("Audio blob is empty, not uploading.");
                    if (onRecordingComplete) onRecordingComplete(null);
                    return;
                }

                const formData = new FormData();
                formData.append('audio_file', audioBlob, 'recording.webm');
                formData.append('operation', operation);

                try {
                    console.log(`Uploading audio...${REACT_APP_API_URL}/upload`);
                    const response = await fetch(`${REACT_APP_API_URL}/upload`, {
                        method: 'POST',
                        body: formData,
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log('Upload successful.');
                        if (onRecordingComplete) onRecordingComplete(data.result.result);
                    } else {
                        const errorText = await response.text();
                        console.error('Upload failed:', response.status, errorText);
                        if (onRecordingComplete) onRecordingComplete(null);
                    }
                } catch (error) {
                    console.error('Error uploading audio:', error);
                    if (onRecordingComplete) onRecordingComplete(null); // Or handle error
                }
            };

            recorder.start();
            setMediaRecorder(recorder); // Update state to pass to LiveAudioVisualizer
            setIsRecording(true);
            console.log('Started recording');
        } catch (error) {
            console.error("Error accessing microphone: ", error);
            // Ensure states are reset on error
            if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
                 mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }
            setIsRecording(false);
            setMediaRecorder(null);
            mediaRecorderRef.current = null;
        }
    };

    const stopRecording = () => {
        if (!isRecording || !mediaRecorderRef.current) return;
        console.log('Requesting stop recording');

        const recorder = mediaRecorderRef.current;

        if (recorder.state === "recording" || recorder.state === "paused") {
            mediaRecorderRef.current.stop(); // This will trigger onstop handlr
        }

        // Stop the stream tracks as we are done with this recording instance.
        if (recorder.stream) {
            recorder.stream.getTracks().forEach(track => track.stop());
            console.log('AudioRecorder: Stream tracks stopped.');
        }

        setIsRecording(false);
        // The LiveAudioVisualizer's useEffect will see mediaRecorder.state change to 'inactive'
        // and then when mediaRecorder prop becomes null (or recorder instance changes), it will cleanup.
        setMediaRecorder(null); // This signals LiveAudioVisualizer to stop/cleanup
        // mediaRecorderRef.current will be replaced on next startRecording or nulled on unmount.
    };

    return (
        <div>
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`recording-button ${isRecording ? "stop-recording" : ""}`}
                    aria-label={isRecording ? "Stop recording" : "Start recording"}
               >
                    <FontAwesomeIcon icon={faMicrophone} className="microphone-icon" />
                </button>
            {/* Conditionally render your custom visualizer */}
            {mediaRecorder && isRecording && ( // Only show when we have a recorder AND are actively recording
                <LiveAudioVisualizer
                    mediaRecorder={mediaRecorder}
                    width={400}
                    height={75}
                    barWidth={10}
                    barColor="dodgerblue"
                />
            )}
        </div>
    );
};

export default AudioRecorder;