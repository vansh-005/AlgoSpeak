import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Microphone from './components/Microphone';
import FeedbackPanel from './components/FeedbackPanel';
import { LeetcodeProvider } from './context/LeetcodeContext';
import '../styles/content.scss';

const App = () => {
  const [isActive, setIsActive] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat) {
        setIsActive(true);
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsActive(false);
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <LeetcodeProvider>
      {isActive && (
        <Microphone 
          onRecordingComplete={(audio) => {
            // Handle audio processing
            setSidebarOpen(true);
          }}
        />
      )}
      <FeedbackPanel
        isOpen={isSidebarOpen}
        feedback={feedback}
        onClose={() => setSidebarOpen(false)}
      />
    </LeetcodeProvider>
  );
};

// Inject into LeetCode page
const root = document.createElement('div');
root.id = 'algo-speak-root';
document.body.appendChild(root);
ReactDOM.render(<App />, root);