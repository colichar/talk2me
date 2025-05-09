import React, { useState } from 'react';

const AudioUploader = ({ onUploadSuccess, operation }) => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');
  
    const handleFileChange = (event) => {
      setFile(event.target.files[0]);
    };
  
    const handleUpload = async () => {
      if (!file) {
        setStatus('Please select a file first.');
        return;
      }
  
      const formData = new FormData();
      formData.append('audio_file', file);
      formData.append('operation', operation)
  
      try {
        setStatus('Uploading...');
        const response = await fetch('http://localhost:8000/upload', {
          method: 'POST',
          body: formData,
        });
  
        if (response.ok) {
          const data = await response.json();
          setStatus('File uploaded and processed successfully!');
          onUploadSuccess(data.result)
        } else {
          setStatus('Upload failed. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        setStatus('An error occurred. Please try again.');
      }
    };
  
    return (
      <div>
        <h2>Audio File Upload</h2>
        <input type="file" accept="audio/*" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
        <p>{status}</p>
      </div>
    );
  };
  
  export default AudioUploader;