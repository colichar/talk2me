import React, { useState } from 'react';
import AudioUploader from './components/AudioUploader';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import './styles/App.css';

function App() {
  const [transcription, setTranscription] = useState(null)

  const handleUploadSuccess = (result) => {
    setTranscription(result.transcription);
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Talk 2 Me</h1>
        <AudioUploader onUploadSuccess={handleUploadSuccess}/>
        <TranscriptionDisplay transcription={transcription}/>
      </header>
    </div>
  );
}

export default App;
