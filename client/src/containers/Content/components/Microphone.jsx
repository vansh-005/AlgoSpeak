import React, { useState, useEffect, useRef } from 'react';
import VoiceWave from './VoiceWave';
import '../../styles/content.scss';

const Microphone = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);
        
        mediaRecorder.current.ondataavailable = (e) => {
          audioChunks.current.push(e.data);
        };
        
        mediaRecorder.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          onRecordingComplete(audioBlob);
          audioChunks.current = [];
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Microphone access error:', err);
      }
    };
    
    startRecording();
    
    return () => {
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.stop();
      }
    };
  }, []);

  return (
    <div className="microphone-container">
      <div className="voice-visualization">
        <VoiceWave isActive={isRecording} />
      </div>
      <div className="microphone-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
        <div className={`pulse-ring ${isRecording ? 'active' : ''}`}></div>
      </div>
      <p className="instruction">Release spacebar to analyze your approach</p>
    </div>
  );
};

export default Microphone;