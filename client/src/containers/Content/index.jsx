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
      setInitialAudioReply(result.data.reply);
    } else {
      setSidebarOpen(true);
      setInitialAudioReply('Failed to transcribe audio');
    }
  };

  // --- Toggle-to-talk: Ctrl + Space toggles recording ---
  useEffect(() => {
    let lastToggle = 0;
    const TOGGLE_DELAY = 400; // ms to debounce double tap

    const handleKeyDown = (e) => {
      if (
        e.code === 'Space' &&
        e.ctrlKey &&
        !e.repeat &&
        !isCooldown
      ) {
        const now = Date.now();
        if (now - lastToggle > TOGGLE_DELAY) {
          setIsRecording((prev) => {
            // Open sidebar when stopping recording
            if (prev) setSidebarOpen(true);
            return !prev;
          });
          lastToggle = now;
        }
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCooldown]);

  // --- Clean up audioUrl when unmounting or updating ---
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // --- Reset initialAudioReply when FeedbackPanel is closed or used ---
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
