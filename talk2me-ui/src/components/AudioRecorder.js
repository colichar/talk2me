import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import '../styles/AudioRecorder.css';

const AudioRecorder = ( {onRecordingComplete, operation }) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const [recordedChunks, setRecordedChunks] = useState([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio:true})
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    setRecordedChunks((prev) => [...prev, event.data]);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone: ", error);
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        setIsRecording(false);

        mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append('audio_file', audioBlob);
            formData.append('operation', operation);

            try {
                const response = await fetch('http://localhost:8000/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    onRecordingComplete(data.result);
                } else {
                    console.error('Upload failed');
                }
            } catch (error) {
                console.error('Error uploading audio:', error);
            } finally {
                setRecordedChunks([]);
            }
        };
    };

    return (
        <div className="audio-recorder">
            {isRecording ? (
                <button onClick={stopRecording} className="recording-button stop-recording">
                <FontAwesomeIcon icon={faMicrophone} className="microphone-icon" />
            </button>
            ) : (
                <button onClick={startRecording} className="recording-button">
                    <FontAwesomeIcon icon={faMicrophone} className="microphone-icon" />
                </button>
            )}
        </div>
    );
};

export default AudioRecorder;