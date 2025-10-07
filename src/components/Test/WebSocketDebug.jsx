// WebSocketDebug.js
import React from 'react';
import { useWebSocket } from '../../context/WebSocketContext';

const WebSocketDebug = () => {
  const { isConnected, messages, error, isLoading, reconnect, disconnect } = useWebSocket();

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: '#333', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <h4>WebSocket Debug</h4>
      <p>Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
      <p>Loading: {isLoading ? '🔄 Yes' : '✅ No'}</p>
      <p>Messages: {messages.length}</p>
      <p>Error: {error || 'None'}</p>
      <div style={{ marginTop: '10px' }}>
        <button 
          onClick={reconnect} 
          style={{ marginRight: '5px', padding: '5px' }}
        >
          Reconnect
        </button>
        <button 
          onClick={disconnect}
          style={{ padding: '5px' }}
        >
          Disconnect
        </button>
      </div>
      <div style={{ marginTop: '10px', maxHeight: '100px', overflowY: 'auto' }}>
        {messages.slice(-3).map((msg, idx) => (
          <div key={idx} style={{ borderBottom: '1px solid #555', padding: '2px 0' }}>
            <small>{msg.sender_id} → {msg.receiver_id}: {msg.message}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WebSocketDebug;