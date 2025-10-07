// USerMessage.js
import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
// import { useWebSocket } from './WebSocketContext';

const USerMessage = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const { isConnected, messages, sendMessage, error, reconnect } = useWebSocket();

  const CLIENT_ID = 8;
  const ADMIN_ID = 1;

  useEffect(() => {
    // Filter and display messages for this client
    const clientMessages = messages.filter(msg => 
      msg.sender_id === CLIENT_ID || msg.receiver_id === CLIENT_ID
    );
    setChatHistory(clientMessages);
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

const handleSendMessage = (e) => {
  e.preventDefault();
  if (!message.trim()) return;

  const messageObj = { 
    user_id: ADMIN_ID,              // ✅ receiver
    message: message.trim(),
    tempId: Date.now().toString(),  // or uuid if you want unique ids
    timestamp: Date.now(),
    sender: CLIENT_ID               // ✅ sender
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
      minute: '2-digit' 
    });
  };

  if (error) {
    return (
      <div className="chat-container">
        <div className="error-message">
          <p>Connection error: {error}</p>
          <button onClick={reconnect} className="reconnect-btn">
            Reconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat with Admin</h3>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '● Connected' : '● Disconnected'}
          </span>
        </div>
      </div>

      <div className="messages-container">
        {chatHistory.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start a conversation with the admin!</p>
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender_id === CLIENT_ID ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <p>{msg.message}</p>
                <span className="message-time">
                  {formatMessageTime(msg.timestamp)}
                </span>
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
            placeholder="Type your message..."
            disabled={!isConnected}
            className="message-input"
          />
          <button 
            type="submit" 
            disabled={!isConnected || !message.trim()}
            className="send-button"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default USerMessage;