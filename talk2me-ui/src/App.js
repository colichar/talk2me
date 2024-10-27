import React from 'react';
import AudioUploader from './components/AudioUploader';
import './styles/App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Talk 2 Me</h1>
        <AudioUploader />
      </header>
    </div>
  );
}

export default App;
