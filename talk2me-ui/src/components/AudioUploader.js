import React, { useState } from 'react';

const AudioUploader = ({ onUploadSuccess, operation }) => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL;
  
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
        const response = await fetch(''.concat(REACT_APP_API_URL, 'upload'), {
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
        <p className="heading-secondary">Audio File Upload</p>
        <input type="file" accept="audio/*" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
        <p>{status}</p>
      </div>
    );
  };
  
  export default AudioUploader;