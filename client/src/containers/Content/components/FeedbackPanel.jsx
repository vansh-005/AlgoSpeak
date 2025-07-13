import React, { useState, useEffect, useRef, useContext } from 'react';
import '../../../styles/content.scss';
import { LeetcodeContext } from '../context/LeetcodeContext';
import { sendRequestToBackend } from '../../../api/sendRequest.js';

const FeedbackPanel = ({
  isOpen,
  initialAudioReply,
  onClose,
  isCooldown,
  setIsCooldown
}) => {
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 60 });
  const [size, setSize] = useState({ width: 400, height: 500 });
  const [pendingMessage, setPendingMessage] = useState(null);

  const panelRef = useRef(null);
  const chatRef = useRef(null);
  const resizeHandleRef = useRef(null);
  const isResizing = useRef(false);
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });
  const inputRef = useRef(null);

  const logoUrl = chrome.runtime.getURL('assets/logo.png');
  const problemData = useContext(LeetcodeContext);

  // --- ADD AUDIO REPLY WHEN PANEL OPENS ---
  useEffect(() => {
    if (isOpen && initialAudioReply) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          role: 'ai',
          content: initialAudioReply
        }
      ]);
    }
    // Don't re-add if messages change or initialAudioReply changes after panel is open
    // eslint-disable-next-line
  }, [isOpen, initialAudioReply]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (isTyping && inputRef.current) inputRef.current.focus();
  }, [isTyping]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isSpeaking]);

  // -------- DRAG LOGIC --------
  const handleMouseDown = (e) => {
    if (
      resizeHandleRef.current && resizeHandleRef.current.contains(e.target)
    ) return;
    if (e.target.tagName === 'INPUT' || e.target.closest('.input-area')) return;
    isDragging.current = true;
    dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragStartPos.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragStartPos.current.y))
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

  // -------- RESIZE LOGIC --------
  const handleResizeStart = (e) => {
    e.preventDefault();
    isResizing.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { ...size };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // -------- SENDING MESSAGES --------
  const handleSend = async () => {
    if (!inputValue.trim() || isCooldown) return;

    const messageId = Date.now();
    const userMsg = { id: messageId, role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(false);
    setIsCooldown(true);
    setPendingMessage({ id: messageId + 1, role: 'ai', content: 'Processing...' });
    setIsSpeaking(true);

    try {
      const result = await sendRequestToBackend(null, userMsg.content);
      if (result.success) {
        setMessages(prev => [
          ...prev,
          { id: messageId + 1, role: 'ai', content: result.data.reply || 'No response.' }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { id: messageId + 1, role: 'ai', content: 'Error: ' + (result.error || 'Unknown error') }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: messageId + 1, role: 'ai', content: 'Error: ' + err.message }
      ]);
    } finally {
      setIsSpeaking(false);
      setIsCooldown(false);
      setPendingMessage(null);
    }
  };

  // -------- CODE BLOCK FORMATTER --------
  const formatContent = (content) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.replace(/```(\w+)?\n?|\n?```/g, '');
        const language = part.match(/```(\w+)/)?.[1] || 'javascript';
        return (
          <div key={i} className="code-wrapper">
            <pre className={`code-block language-${language}`}>
              <code>{code}</code>
            </pre>
            <div className="code-actions">
              <button onClick={() => navigator.clipboard.writeText(code)}>Copy</button>
              <button
                onClick={() => {
                  try {
                    window.monaco.editor.getModels()[0].setValue(code);
                  } catch (e) {
                    alert('Cannot inject code. Monaco not available.');
                  }
                }}
              >
                Use
              </button>
            </div>
          </div>
        );
      }
      return <p key={i}>{part}</p>;
    });
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className={`feedback-panel${isOpen ? ' open' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        position: 'fixed',
        zIndex: 10010
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="panel-header">
        <img src={logoUrl} className="panel-logo" style={{ width: 32, marginRight: 8 }} alt="Logo" />
        <h3 style={{ flex: 1, margin: 0 }}>
          {problemData?.number ? `Problem ${problemData.number}` : 'LeetCode'}
        </h3>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
      </div>

      <div ref={chatRef} className="chat-container" style={{ overflowY: 'auto', flex: 1 }}>
        {messages.map(message => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="bubble">{formatContent(message.content)}</div>
          </div>
        ))}
        {/* Show processing feedback while waiting */}
        {isSpeaking && pendingMessage && (
          <div className="message ai">
            <div className="bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div style={{ marginTop: 8 }}>{pendingMessage.content}</div>
            </div>
          </div>
        )}
      </div>

      <div className="panel-footer">
        {isTyping ? (
          <div className="input-area">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Type your question..."
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
              }}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              style={{ overflow: 'hidden' }}
              disabled={isCooldown}
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={isCooldown || !inputValue.trim()}
              style={isCooldown ? { opacity: 0.5, pointerEvents: 'none' } : {}}
            >
              {isCooldown ? 'Wait...' : 'Send'}
            </button>
          </div>
        ) : (
          <button className="type-toggle" onClick={() => setIsTyping(true)}>
            Type
          </button>
        )}
      </div>

      <div
        className="resize-handle"
        ref={resizeHandleRef}
        onMouseDown={handleResizeStart}
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 20,
          height: 20,
          cursor: 'nwse-resize',
          zIndex: 10100
        }}
      ></div>
    </div>
  );
};

export default FeedbackPanel;
