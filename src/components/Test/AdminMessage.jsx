// AdminMessage.js
import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import WebSocketDebug from './WebSocketDebug';

const AdminMessage = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const { isConnected, messages, sendMessage, error, reconnect, isLoading } = useWebSocket();

  const ADMIN_ID = 1;
  const CLIENT_ID = 8; // ✅ Fixed client to chat with

  // Filter chat history for only ADMIN ↔ CLIENT_ID
  useEffect(() => {
    const clientMessages = messages.filter(
      (msg) =>
        (msg.sender_id === ADMIN_ID && msg.receiver_id === CLIENT_ID) ||
        (msg.sender_id === CLIENT_ID && msg.receiver_id === ADMIN_ID)
    );
    setChatHistory(clientMessages);
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const messageObj = {
      user_id: CLIENT_ID, // ✅ always send to client 8
      message: message.trim(),
      tempId: Date.now().toString(),
      timestamp: Date.now(),
      sender: ADMIN_ID, // ✅ sender is admin
    };

    if (sendMessage(messageObj)) {
      setMessage('');
    } else {
      alert('Failed to send message. Please check connection.');
    }
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <p>🔄 Connecting to chat server...</p>;
  }

  if (error) {
    return (
      <div>
        <p>Connection error: {error}</p>
        <button onClick={reconnect}>Reconnect</button>
      </div>
    );
  }

  return (
    <div className="admin-chat-container">
      <WebSocketDebug />

      <div className="chat-header">
        <h3>Admin Chat Dashboard</h3>
        <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '● Connected' : '● Disconnected'}
        </span>
      </div>

      <div className="chat-area">
        <div className="chat-with">
          <h4>Chat with Client #{CLIENT_ID}</h4>
          <small>Messages: {chatHistory.length}</small>
        </div>

        <div className="messages-container">
          {chatHistory.length === 0 ? (
            <p>No messages yet. Start the conversation!</p>
          ) : (
            chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender_id === ADMIN_ID ? 'sent' : 'received'}`}
              >
                <div className="message-content">
                  <p>{msg.message}</p>
                  <span className="message-time">{formatMessageTime(msg.timestamp)}</span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="message-form">
          <div className="input-container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isConnected ? 'Type your message...' : 'Connecting...'}
              disabled={!isConnected}
              className="message-input"
            />
            <button
              type="submit"
              disabled={!isConnected || !message.trim()}
              className="send-button"
            >
              {isConnected ? 'Send' : 'Disconnected'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminMessage;
