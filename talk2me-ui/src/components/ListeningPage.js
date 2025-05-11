import React, { useState } from 'react';
import AudioUploader from './AudioUploader';
import ResultDisplay from './ResultDisplay';
import AudioRecorder from './AudioRecorder';
import '../styles/App.css';
import { ReactComponent as Logo } from '../assets/logo_listening.svg';

const ListeningPage = () => {
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('transcribe');

  const handleUploadSuccess = (processedResult) => {
    setResult(processedResult.result);
  };

  const handleRecordingComplete = (recordingResult) => {
    setResult(recordingResult);
  }

  return (
    <div className="centered-container App">
      <header className="App-header">
        <Logo style={{ width: '50%', height: 'auto' }}/>
        <h1 className="heading-primary">Talk 2 Me</h1>
        <div className="tabs">
          <button 
            onClick={() => setActiveTab('transcribe')}
            className={activeTab === 'transcribe' ? 'active' : ''}
          >
            Transcribe
          </button>
          <button 
            onClick={() => setActiveTab('summarize')}
            className={activeTab === 'summarize' ? 'active' : ''}
          >
            Summarize
          </button>
        </div>
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            operation={activeTab}
          />

        <AudioUploader onUploadSuccess={handleUploadSuccess} operation={activeTab}/>
        <ResultDisplay result={result} operation={activeTab}/>
      </header>
    </div>
  );
};

export default ListeningPage;
