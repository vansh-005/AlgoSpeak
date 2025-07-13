// src/containers/Content/index.jsx
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Microphone from './components/Microphone';
import FeedbackPanel from './components/FeedbackPanel';
import { LeetcodeProvider } from './context/LeetcodeContext';
import { sendRequestToBackend } from '../../api/sendRequest';
import '../../styles/content.scss';

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedback, setFeedback] = useState(''); // Not strictly needed, but kept for legacy use
  const [audioUrl, setAudioUrl] = useState(null);
  const [isCooldown, setIsCooldown] = useState(false);
  const [initialAudioReply, setInitialAudioReply] = useState(null); // New

  const handleRecordingComplete = async (blob) => {
    setAudioUrl(URL.createObjectURL(blob));
    setIsCooldown(true);
    const result = await sendRequestToBackend(blob, '');
    setIsCooldown(false);

    if (result.success && result.data.reply) {
      setSidebarOpen(true);
      // This triggers FeedbackPanel to inject the AI reply as an initial message
      setInitialAudioReply(result.data.reply);
    } else {
      setSidebarOpen(true);
      setInitialAudioReply('Failed to transcribe audio');
    }
  };

  useEffect(() => {
    // if (audioUrl) console.log('App: audioUrl set', audioUrl);
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    }
  }, [audioUrl]);

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.code === 'Space' && !e.repeat && !isCooldown) {
        setIsRecording(true);
        e.preventDefault();
      }
    };

    const handleKeyUp = e => {
      if (e.code === 'Space' && !isCooldown) {
        setIsRecording(false);
        setSidebarOpen(true);
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isCooldown]);

  // Reset initialAudioReply once FeedbackPanel is closed or used
  const handlePanelClose = () => {
    setSidebarOpen(false);
    setInitialAudioReply(null);
  };

  return (
    <LeetcodeProvider>
      {isRecording && !isCooldown && (
        <Microphone onRecordingComplete={handleRecordingComplete} />
      )}

      <FeedbackPanel
        isOpen={sidebarOpen}
        initialAudioReply={initialAudioReply}
        onClose={handlePanelClose}
        isCooldown={isCooldown}
        setIsCooldown={setIsCooldown}
      />
    </LeetcodeProvider>
  );
};

const host = document.createElement('div');
host.id = 'algo-speak-root';
document.body.appendChild(host);
createRoot(host).render(<App />);
