import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const Popup = () => {
  const [error, setError] = useState(null);
  const [isTestingMic, setIsTestingMic] = useState(false);

  const testMicrophone = async () => {
    setIsTestingMic(true);
    try {
      // This will force Chrome to show the prompt
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Immediately stop and cleanup
      stream.getTracks().forEach(track => track.stop());
      
      // If we get here, permission was granted
      chrome.runtime.sendMessage({ action: "micApproved" });
      window.close();
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError(
          <div style={{ marginTop: '10px' }}>
            <p>Microphone blocked. Please:</p>
            <ol style={{ paddingLeft: '20px', margin: '5px 0' }}>
              <li>Click <a href="#" onClick={() => chrome.tabs.create({ 
                  url: 'chrome://settings/content/microphone' 
                })}>here</a> to open settings</li>
              <li>Find <strong>leetcode.com</strong></li>
              <li>Set to <strong>"Allow"</strong></li>
              <li>Refresh this page and try again</li>
            </ol>
          </div>
        );
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsTestingMic(false);
    }
  };

  return (
    <div style={{
      padding: '16px',
      width: '300px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <button
        onClick={testMicrophone}
        disabled={isTestingMic}
        style={{
          background: isTestingMic ? '#cccccc' : '#4285f4',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {isTestingMic ? 'Checking...' : 'Enable Microphone'}
      </button>
      {error && (
        <div style={{
          color: '#d32f2f',
          marginTop: '12px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

ReactDOM.render(<Popup />, document.getElementById('root'));