import React from 'react';

const TranscriptionDisplay = ({ transcription }) => {
  if (!transcription) return null;

  return (
    <div>
      <h2>Transcription Result:</h2>
      <p>{transcription}</p>
    </div>
  );
};

export default TranscriptionDisplay;
