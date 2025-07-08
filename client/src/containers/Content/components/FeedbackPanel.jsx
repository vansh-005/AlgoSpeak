import React, { useState } from 'react';
import Microphone from './Microphone';
import '../../../styles/content.scss';

const FeedbackPanel = ({ isOpen, feedback, onClose }) => {
  const [isListening, setIsListening] = useState(false);

  if (!isOpen) return null;

  return (
    <div className={`feedback-panel ${isOpen ? 'open' : ''}`}>
      <div className="panel-header">
        <h3>AI Feedback</h3>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
      </div>
      
      <div className="feedback-content">
        {feedback ? (
          <p>{feedback}</p>
        ) : (
          <div className="loading-feedback">
            <div className="spinner"></div>
            <p>Analyzing your approach...</p>
          </div>
        )}
      </div>
      
      <div className={`panel-footer ${isListening ? 'listening' : ''}`}>
        <button 
          className="voice-button"
          onClick={() => setIsListening(!isListening)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </button>
        {isListening && <div className="listening-indicator"></div>}
      </div>
    </div>
  );
};

export default FeedbackPanel;

