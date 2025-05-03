import React from 'react';

const ResultDisplay = ({ result, operation }) => {
  if (!result) return null;

  return (
    <div>
      <h2>{operation === 'transcribe' ? 'Transcription' : 'Summary'} Result:</h2>
      <p>{result}</p>
    </div>
  );
};

export default ResultDisplay;
