// popup/index.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const Popup = () => {
  const [error, setError] = useState(null);

  const handleMicClick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chrome.runtime.sendMessage({ action: "micApproved", stream });
      window.close();
    } catch (err) {
      setError(
        <div>
          <p>Please ALLOW microphone access:</p>
          <ol>
            <li>Click the <strong>lock icon</strong> in Chrome's address bar</li>
            <li>Select <strong>Site Settings</strong></li>
            <li>Change <strong>Microphone</strong> to "Allow"</li>
          </ol>
          <button 
            onClick={() => chrome.tabs.create({url: 'chrome://settings/content/microphone'})}
            style={{background: '#4285f4', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px'}}
          >
            Open Full Settings
          </button>
        </div>
      );
    }
  };

  return (
    <div style={{ padding: '16px', width: '280px', fontFamily: 'Arial' }}>
      <button 
        onClick={handleMicClick}
        style={{background: '#4285f4', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px'}}
      >
        Enable Microphone
      </button>
      {error && (
        <div style={{ color: '#d32f2f', marginTop: '12px', fontSize: '14px', lineHeight: '1.5' }}>
          {error}
        </div>
      )}
    </div>
  );
};

ReactDOM.render(<Popup />, document.getElementById('root'));