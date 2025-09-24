// context/WebSocketContext.js
import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';

const WebSocketContext = createContext();

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [globalMessages, setGlobalMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [userId, setUserId] = useState(null); // Fixed: removed destructuring
  const socketRef = useRef(null);

  const connectWebSocket = useCallback(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const wsUrl = `ws://10.10.13.16:8000/ws/chat/?token=${token}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      setConnected(true);
      socketRef.current = socket;
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📩 Global WebSocket message:', data);

        setAllMessages(prev => [...prev, data]);

        setGlobalMessages((prev) => {
          if (data.message_id && prev.some((m) => m.data?.message_id === data.message_id)) {
            return prev;
          }

          return [
            ...prev,
            {
              text: data.message,
              sender: data.sender === userId ? "me" : data.sender, // Fixed comparison
              data,
              id: data.message_id || Date.now(),
              tempId: data.tempId || null
            },
          ];
        });
      } catch (err) {
        console.error("📩 Failed parsing message:", err, event.data);
      }
    };

    socket.onerror = (err) => console.error("⚠️ WebSocket error:", err);

    socket.onclose = (e) => {
      console.log("❌ WebSocket disconnected");
      setConnected(false);
      setTimeout(connectWebSocket, 3000);
    };

    return () => {
      socket.close();
    };
  }, [userId]); // Added userId dependency

  const sendMessage = useCallback((receiverId, message, tempId = Date.now()) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const messageObj = { user_id: receiverId, message, tempId };

      // Optimistic UI update
      setGlobalMessages(prev => [
        ...prev,
        {
          id: tempId,
          tempId: tempId,
          text: message,
          sender: "me",
          data: messageObj,
          status: "pending",
          timestamp: Date.now()
        }
      ]);

      socketRef.current.send(JSON.stringify(messageObj));
      return tempId;
    }
    return null;
  }, []);

  // Clear messages for a specific conversation when needed
  const clearConversationMessages = useCallback((conversationId) => {
    setGlobalMessages(prev => prev.filter(msg => 
      msg.data?.user_id !== conversationId && msg.sender !== conversationId
    ));
  }, []);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connectWebSocket]); // Fixed dependency

  return (
    <WebSocketContext.Provider value={{
      globalMessages,
      sendMessage,
      allMessages,
      connected,
      userId, // Added userId to context value
      setUserId,
      clearConversationMessages
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};