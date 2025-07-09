// src/containers/Content/components/Microphone.jsx
import React, { useEffect, useRef, useState } from 'react';

const Microphone = ({ onRecordingComplete }) => {
  const [volume, setVolume] = useState(0);          // 0-1
  const mediaRecorder = useRef(null);
  const audioChunks   = useRef([]);

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

  return (
    <button
      className="algo-mic-btn"
      style={{ '--scale': 1 + volume * 0.4 }}
      aria-label="Recording…"
    >
      <svg viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2zM11 21h2v-3h-2v3z"/></svg>
      <span className="pulse-ring"/>
    </button>
  );
};

export default Microphone;
