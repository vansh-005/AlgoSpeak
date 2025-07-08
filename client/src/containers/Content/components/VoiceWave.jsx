import React, { useEffect, useRef } from 'react';

const VoiceWave = ({ isActive }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!isActive) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrame;
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const time = Date.now() / 1000;
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#4a90e2';
      
      for (let x = 0; x < width; x++) {
        const y = centerY + Math.sin(x * 0.1 + time * 5) * 
                 Math.sin(x * 0.05 + time * 2) * 10 * 
                 Math.random();
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      animationFrame = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isActive]);
  
  return (
    <div className="voice-wave">
      <canvas 
        ref={canvasRef} 
        width="300" 
        height="50"
      />
    </div>
  );
};

export default VoiceWave;