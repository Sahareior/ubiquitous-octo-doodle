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
 // inside WebSocketProvider
const [userId, setUserId] = useState(() => {
  const customerData = localStorage.getItem("customerId");
  return customerData ? JSON.parse(customerData)?.user?.id : null;
});
 
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [demosocket,setDemosocket] = useState(null)
  const isConnectingRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;


//   if (!userId) {
//   console.error("❌ Cannot send message - userId not set yet");
//   return;
// }


  // Message queue for when connection is down
  const messageQueueRef = useRef([]);

  // Store messages in localStorage for persistence




  const connectWebSocket = useCallback(() => {
    if (isConnectingRef.current) {
      console.log('🔄 WebSocket connection already in progress...');
      return;
    }
    
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.log("❌ No token available for WebSocket connection");
      // Try again in 2 seconds if no token
      setTimeout(connectWebSocket, 2000);
      return;
    }

    // Clear any existing connection
    if (socketRef.current) {
      socketRef.current.close();
    }

    isConnectingRef.current = true;
    reconnectAttemptsRef.current += 1;
    const wsUrl = `${import.meta.env.VITE_WEBSOCKET_URL}chat/?token=${token}`;

    console.log(`🔄 Attempting WebSocket connection (attempt ${reconnectAttemptsRef.current})...`);

    try {
      const socket = new WebSocket(wsUrl);
      setDemosocket(socket)
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("✅ WebSocket connected successfully");
        setConnected(true);
        isConnectingRef.current = false;
        reconnectAttemptsRef.current = 0; // Reset on successful connection

         if (userId) {
    socket.send(JSON.stringify({
      type: "identify",
      userId: userId
    }));
  }
        
        // Send any queued messages
        if (messageQueueRef.current.length > 0) {
          console.log(`📤 Sending ${messageQueueRef.current.length} queued messages`);
          messageQueueRef.current.forEach(msg => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify(msg));
            }
          });
          messageQueueRef.current = [];
        }
      };

// In your WebSocketContext.jsx, replace the onmessage handler:

socket.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    console.log('📩 Received WebSocket message:', data);

    // Add to all messages for debugging
    setAllMessages(prev => [...prev, data]);

    setGlobalMessages((prev) => {
      // Check if this is a server confirmation for an optimistic message
      const isServerConfirmation = data.message_id && data.status === 'sent';
      
      if (isServerConfirmation) {
        // Find and update the optimistic message with the real message_id
        const updatedMessages = prev.map(msg => {
          if (msg.tempId && msg.text === data.message && msg.status === 'pending') {
            console.log('🔄 Updating optimistic message with server ID:', data.message_id);
            return {
              ...msg,
              id: data.message_id,
              tempId: null,
              status: 'delivered',
              data: {
                ...msg.data,
                ...data
              }
            };
          }
          return msg;
        });
        
        // If we found and updated a message, return the updated array
        if (updatedMessages.some((msg, index) => msg !== prev[index])) {
          return updatedMessages;
        }
      }

      // Check for duplicates by message_id (prevent actual duplicates)
      const isDuplicate = data.message_id && prev.some((m) => 
        m.data?.message_id === data.message_id
      );
      
      if (isDuplicate) {
        console.log('🔄 Duplicate message detected by message_id, skipping');
        return prev;
      }

      // Check for duplicates by tempId (prevent double processing)
      const isTempDuplicate = data.tempId && prev.some((m) => 
        m.tempId === data.tempId
      );
      
      if (isTempDuplicate) {
        console.log('🔄 Duplicate message detected by tempId, skipping');
        return prev;
      }

      // This is a new message - add it
      console.log('💾 Adding new message to state:', data);
      const newMessage = {
        text: data.message,
        sender: data.sender === userId ? "me" : data.sender,
        data,
        id: data.message_id || data.tempId || `msg-${Date.now()}-${Math.random()}`,
        tempId: data.tempId || null,
        timestamp: data.timestamp || Date.now(),
        status: data.status || "delivered"
      };

      return [...prev, newMessage];
    });
  } catch (err) {
    console.error("📩 Failed parsing message:", err, event.data);
  }
};

      socket.onerror = (err) => {
        console.error("⚠️ WebSocket error:", err);
        setConnected(false);
        isConnectingRef.current = false;
      };

      socket.onclose = (e) => {
        console.log(`❌ WebSocket disconnected: ${e.code} ${e.reason}`);
        setConnected(false);
        isConnectingRef.current = false;
        
        // Clear any existing timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        // Reconnect with exponential backoff, but limit attempts
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const baseDelay = 1000;
          const exponentialDelay = Math.min(baseDelay * Math.pow(2, reconnectAttemptsRef.current), 30000);
          const jitter = Math.random() * 1000; // Add jitter to avoid thundering herd
          const delay = exponentialDelay + jitter;
          
          console.log(`🔄 Reconnecting in ${Math.round(delay/1000)} seconds...`);
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
        } else {
          console.error('🚨 Max reconnection attempts reached. Please refresh the page.');
        }
      };

    } catch (error) {
      console.error("❌ WebSocket connection failed:", error);
      isConnectingRef.current = false;
      setTimeout(connectWebSocket, 5000);
    }
  }, [userId]);

  const sendMessage = useCallback((receiverId, message, tempId = `temp-${Date.now()}-${Math.random()}`) => {
    const messageObj = { 
      user_id: receiverId, 
      message, 
      tempId,
      timestamp: Date.now(),
      sender: userId // Include sender ID for verification
    };

    console.log('📤 Sending message:', messageObj);

    // Always add to optimistic UI immediately
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

    if (socketRef.current?.readyState === WebSocket.OPEN && connected) {
      // Send immediately if connected
      try {
        socketRef.current.send(JSON.stringify(messageObj));
        console.log('✅ Message sent via WebSocket');
      } catch (error) {
        console.error('❌ Error sending message:', error);
        // Fall back to queueing
        messageQueueRef.current.push(messageObj);
      }
    } else {
      // Queue message if not connected
      messageQueueRef.current.push(messageObj);
      console.log("📝 Message queued - WebSocket not connected");
      
      // Try to reconnect if not already connecting
      if (!isConnectingRef.current) {
        connectWebSocket();
      }
    }
    
    return tempId;
  }, [connectWebSocket, connected, userId]);

  // Update message status when confirmed by server
  const updateMessageStatus = useCallback((tempId, messageId, status = "delivered") => {
    setGlobalMessages(prev => prev.map(msg => 
      msg.tempId === tempId 
        ? { ...msg, id: messageId, status, tempId: null }
        : msg
    ));
  }, []);

  // Clear messages for a specific conversation
  const clearConversationMessages = useCallback((conversationId) => {
    setGlobalMessages(prev => prev.filter(msg => 
      msg.data?.user_id !== conversationId && msg.sender !== conversationId
    ));
  }, []);



  // Manual reconnect function
  const manualReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectAttemptsRef.current = 0;
    connectWebSocket();
  }, [connectWebSocket]);

  // Initialize connection when component mounts AND when userId changes
  useEffect(() => {
    if (userId) {
      console.log('👤 User ID set, connecting WebSocket...');
      connectWebSocket();
    }
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      // Don't close WebSocket on cleanup to maintain connection
    };
  }, [connectWebSocket, userId]);

  // Debug: Log connection state changes
  useEffect(() => {
    console.log(`🔌 WebSocket connection state: ${connected ? 'Connected' : 'Disconnected'}`);
  }, [connected]);

  return (
    <WebSocketContext.Provider value={{
      globalMessages,
      sendMessage,
      allMessages,
      connected,
      userId,
      demosocket,
      setUserId,
      clearConversationMessages,
      updateMessageStatus,
     
      manualReconnect,
      reconnectAttempts: reconnectAttemptsRef.current
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};