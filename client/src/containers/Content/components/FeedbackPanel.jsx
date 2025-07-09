// src/containers/Content/components/FeedbackPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import Microphone from './Microphone';
import '../../../styles/content.scss';

const FeedbackPanel = ({ isOpen, feedback, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 60 });
  const [size, setSize] = useState({ width: 400, height: 500 });
  const panelRef = useRef(null);
  const resizeHandleRef = useRef(null);
  const isResizing = useRef(false);
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });

  // Sample AI response with code blocks
  const sampleResponse = `
Great job attempting the "Two Sum" problem! Here's how we can optimize your solution:

**Optimization Suggestions:**
1. Use a hash map for O(1) lookups
2. Handle duplicate values
3. Consider edge cases with negative numbers

**Improved Solution:**
\`\`\`cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> numMap;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (numMap.find(complement) != numMap.end()) {
                return {numMap[complement], i};
            }
            numMap[nums[i]] = i;
        }
        return {};
    }
};
\`\`\`

**Test Cases:**
\`\`\`
Case 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]

Case 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Case 3:
Input: nums = [3,3], target = 6
Output: [0,1]
\`\`\`

Let me know if you'd like to practice similar problems!
`;

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          role: 'ai',
          content: "Hello! I'm your LeetCode coach. I'll help analyze your solutions and suggest improvements. 🚀"
        }
      ]);
    }
  }, [isOpen]);

  // Handle AI responses
  useEffect(() => {
    if (feedback) {
      // Simulate AI "typing" effect
      setIsSpeaking(true);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { 
            id: Date.now(), 
            role: 'ai', 
            content: sampleResponse // Replace with actual feedback
          }
        ]);
        setIsSpeaking(false);
      }, 1500);
    }
  }, [feedback]);

  // Handle dragging
  const handleMouseDown = (e) => {
    if (e.target.closest('.resize-handle')) return;
    
    isDragging.current = true;
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y
      });
    } else if (isResizing.current) {
      const newWidth = Math.max(300, startSize.current.width + (e.clientX - dragStartPos.current.x));
      const newHeight = Math.max(300, startSize.current.height + (e.clientY - dragStartPos.current.y));
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Handle resize start
  const handleResizeStart = (e) => {
    e.preventDefault();
    isResizing.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { ...size };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Format message content with code highlighting
  const formatContent = (content) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.replace(/```(\w+)?\n?|\n?```/g, '');
        const language = part.match(/```(\w+)/)?.[1] || 'javascript';
        
        return (
          <pre key={index} className={`code-block language-${language}`}>
            <code>{code}</code>
          </pre>
        );
      }
      return <p key={index}>{part}</p>;
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={panelRef}
      className={`feedback-panel ${isOpen ? 'open' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="panel-header">
        <div className="ai-avatar">
          <div className={`face ${isSpeaking ? 'speaking' : ''}`}>
            <div className="eyes">
              <div className="eye"></div>
              <div className="eye"></div>
            </div>
            <div className="mouth"></div>
          </div>
        </div>
        <h3>LeetCode Coach</h3>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
      </div>
      
      <div className="chat-container">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message ${message.role}`}
          >
            {message.role === 'ai' && (
              <div className="avatar">
                <div className="face-icon">
                  <div className="eye"></div>
                  <div className="eye"></div>
                  <div className="mouth"></div>
                </div>
              </div>
            )}
            <div className="bubble">
              {formatContent(message.content)}
            </div>
          </div>
        ))}
        
        {isSpeaking && (
          <div className="message ai">
            <div className="avatar">
              <div className="face-icon">
                <div className="eye"></div>
                <div className="eye"></div>
                <div className="mouth"></div>
              </div>
            </div>
            <div className="bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className={`panel-footer ${isListening ? 'listening' : ''}`}>
        <Microphone 
          isActive={isListening}
          onRecordingComplete={(blob) => {
            console.log('Audio recording complete', blob);
            setIsListening(false);
            // Add user message to chat
            setMessages(prev => [
              ...prev, 
              { id: Date.now(), role: 'user', content: 'Audio message transcribed...' }
            ]);
          }} 
        />
        <button 
          className="voice-toggle"
          onClick={() => setIsListening(!isListening)}
        >
          {isListening ? 'Stop Listening' : 'Ask Question'}
        </button>
      </div>
      
      <div 
        className="resize-handle"
        ref={resizeHandleRef}
        onMouseDown={handleResizeStart}
      ></div>
    </div>
  );
};

export default FeedbackPanel;