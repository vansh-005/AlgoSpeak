// src/containers/Content/index.jsx
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Microphone     from './components/Microphone';
import FeedbackPanel  from './components/FeedbackPanel';
import { LeetcodeProvider } from './context/LeetcodeContext';
import '../../styles/content.scss';

const App = () => {
  const [isRecording, setIsRecording]   = useState(false);  // == Space down
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [feedback, setFeedback]         = useState('');

  /* ─── Space-bar hold / release ────────────────────────────── */
  useEffect(() => {
    const down = e => {
      if (e.code === 'Space' && !e.repeat) {
        setIsRecording(true);
        e.preventDefault();
      }
    };
    const up = e => {
      if (e.code === 'Space') {
        setIsRecording(false);        // hides mic
        setSidebarOpen(true);         // opens panel
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', down);
    document.addEventListener('keyup',   up);
    return () => { document.removeEventListener('keydown', down);
                   document.removeEventListener('keyup',   up); };
  }, []);

  return (
    <LeetcodeProvider>
      {isRecording && (
        <Microphone
          onRecordingComplete={audioBlob => {
            /* TODO: send audio to backend → setFeedback(response) */
          }}
        />
      )}

      <FeedbackPanel
        isOpen   ={sidebarOpen}
        feedback ={feedback}
        onClose  ={() => setSidebarOpen(false)}
      />
    </LeetcodeProvider>
  );
};

/* mount */
const host = document.createElement('div');
host.id = 'algo-speak-root';
document.body.appendChild(host);
createRoot(host).render(<App />);

console.log('[AlgoSpeak] sending inject-styles');
chrome.runtime.sendMessage({ type: 'inject-styles' }, res =>
  console.log('[AlgoSpeak] response', res, chrome.runtime.lastError)
);

/* inject the extracted CSS — keep this line */
chrome.runtime.sendMessage({ type: 'inject-styles' });
