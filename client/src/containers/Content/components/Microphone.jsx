// src/containers/Content/components/Microphone.jsx
import React, { useEffect, useRef, useState } from 'react';
// import { useCooldown } from '../context/CooldownContext'
// import Lottie from 'react-lottie';
// import animationData from './mic-animation.json';
// animation removed - simple pulse icon instead

const Microphone = ({ onRecordingComplete, className = '', size = 56 }) => {
  const [volume, setVolume] = useState(0);          // 0-1
  const mediaRecorder = useRef(null);
  const audioChunks   = useRef([]);
  // const { isCooldown } = useCooldown();


  /* ─── start recording immediately ───────────────────────── */
  useEffect(() => {
    let analyser, dataArray, raf;
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx    = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      analyser     = ctx.createAnalyser();
      analyser.fftSize = 256;
      dataArray    = new Uint8Array(analyser.frequencyBinCount);
      source.connect(analyser);

      /* MediaRecorder for the final blob */
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = e => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
          console.log('Microphone: onstop, blob:', blob);
        onRecordingComplete?.(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.current.start();

      /* live volume for UI */
      const loop = () => {
        analyser.getByteTimeDomainData(dataArray);
        const rms = Math.sqrt(dataArray.reduce((s, v) => {
          const n = v - 128; return s + n*n;
        }, 0) / dataArray.length);
        setVolume(Math.min(rms / 50, 1));  
        raf = requestAnimationFrame(loop);
      };
      loop();
    })();

    return () => {
      cancelAnimationFrame(raf);
      mediaRecorder.current?.stop();   
    };
  }, []);

  useEffect(() => {
  const handleMessage = (request) => {
    if (request.stream) {
      const stream = request.stream;
    }
  };

  chrome.runtime.onMessage.addListener(handleMessage);
  return () => chrome.runtime.onMessage.removeListener(handleMessage);
}, []);

  return (
    <button
      className={`algo-mic-btn ${className}`}
      style={{ '--scale': 1 + volume * 0.4, '--size': `${size}px` }}
      aria-label="Recording…"
    >
      {/* <Lottie
        options={{ animationData, loop: true, autoplay: true }}
        height={size - 10}
        width={size - 10}
      /> */}
            <span className="mic-icon" />

      <span className="pulse-ring" />
    </button>
  );
};

export default Microphone;