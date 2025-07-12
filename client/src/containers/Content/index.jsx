// src/containers/Content/index.jsx
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Microphone     from './components/Microphone';
import FeedbackPanel  from './components/FeedbackPanel';
import { LeetcodeProvider } from './context/LeetcodeContext';
import { sendAudioToBackend } from '../../api/sendAudio';
import '../../styles/content.scss';
// src/containers/Content/index.jsx

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedback,    setFeedback]    = useState('');
  const [audioUrl,setAudioUrl] = useState(null);

  const handleRecordingComplete = (blob) =>{
      // console.log('App: handleRecordingComplete called', blob);
      sendAudioToBackend(blob);
    setAudioUrl(URL.createObjectURL(blob));
  }
  useEffect(() => {
  if(audioUrl) console.log('App: audioUrl set', audioUrl);
  return () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }
}, [audioUrl]);

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.code === 'Space' && !e.repeat && !sidebarOpen) {
        setIsRecording(true);          // show mic bubble
        // setSidebarOpen(false);         // hide panel while recording
        e.preventDefault();
      }
    };

    const handleKeyUp = e => {
     if (e.code === 'Space' && !sidebarOpen) {
        setIsRecording(false);         // hide mic
        setSidebarOpen(true);          // 👉 open panel
        // TODO: send audio → setFeedback(responseText)
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup',   handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup',   handleKeyUp);
    };
  }, []);

  return (
    <LeetcodeProvider>
      {isRecording && (
        <Microphone onRecordingComplete={handleRecordingComplete}/>
      )}
        {/* {audioUrl && (
          <audio controls src = {audioUrl}/>
        )} */}


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

// console.log('[AlgoSpeak] sending inject-styles');
// chrome.runtime.sendMessage({ type: 'inject-styles' }, res =>
//   console.log('[AlgoSpeak] response', res, chrome.runtime.lastError)
// );

// /* inject the extracted CSS — keep this line */
// chrome.runtime.sendMessage({ type: 'inject-styles' });
