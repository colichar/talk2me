import React, { useState } from 'react';
import AudioUploader from './AudioUploader';
import ResultDisplay from './ResultDisplay';
import '../styles/App.css';

const ListetingPage = () => {
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('transcribe');

  const handleUploadSuccess = (processedResult) => {
    setResult(processedResult.result);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Talk 2 Me</h1>
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
        <AudioUploader onUploadSuccess={handleUploadSuccess} operation={activeTab}/>
        <ResultDisplay result={result} operation={activeTab}/>
      </header>
    </div>
  );
};

export default ListetingPage;
