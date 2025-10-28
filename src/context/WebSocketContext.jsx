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
  const [incoming, setIncoming] = useState(false);
  const [clientmsg, setClientmsg] = useState({});
  const [add,setAdd] = useState(false)
  
  // inside WebSocketProvider
  const [userId, setUserId] = useState(() => {
    const customerData = localStorage.getItem("customerId");
    return customerData ? JSON.parse(customerData)?.user?.id : 1;
  });

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [demosocket, setDemosocket] = useState(null);
  const isConnectingRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  // Message queue for when connection is down
  const messageQueueRef = useRef([]);

  const connectWebSocket = useCallback(() => {
    if (isConnectingRef.current) {
      console.log('🔄 WebSocket connection already in progress...');
      return;
    }
    
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.log("❌ No token available for WebSocket connection");
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
      setDemosocket(socket);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("✅ WebSocket connected successfully");
        setConnected(true);
        isConnectingRef.current = false;
        reconnectAttemptsRef.current = 0;

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

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📩 Received WebSocket message:', data);
          
          // Set clientmsg first
          setClientmsg(data);
          
          // Handle different message types
          if (data.error === 'user_id and message required') {
            setIncoming(false);
            console.log('⚠️ Server error - missing user_id or message');
            return;
          }
          
          if (data.type === 'status' && data.status === 'connected') {
            setIncoming(true);
            console.log('✅ Connection confirmed by server');
            return;
          }
          
          // Only process actual chat messages
          if (data.message && (data.sender || data.receiver)) {
            setIncoming(true);
            
            setGlobalMessages((prev) => {
              // Check for duplicates by message_id
              const isDuplicate = data.message_id && prev.some((m) => 
                m.data?.message_id === data.message_id
              );
              
              if (isDuplicate) {
                console.log('🔄 Duplicate message detected by message_id, skipping');
                return prev;
              }

              // Check for duplicates by tempId
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
          } else {
            console.log('📨 Non-chat message received, skipping state update:', data);
          }
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
          const jitter = Math.random() * 1000;
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
  }, [userId]); // ✅ FIXED: Added userId dependency

  const sendMessage = useCallback((receiverId, message, tempId = `temp-${Date.now()}-${Math.random()}`) => {
    if (!userId) {
      console.error("❌ Cannot send message - userId not set yet");
      return;
    }

    const messageObj = { 
      user_id: receiverId, 
      message, 
      tempId,
      timestamp: Date.now(),
      sender: userId
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
      try {
        socketRef.current.send(JSON.stringify(messageObj));
        console.log('✅ Message sent via WebSocket');
      } catch (error) {
        console.error('❌ Error sending message:', error);
        messageQueueRef.current.push(messageObj);
      }
    } else {
      messageQueueRef.current.push(messageObj);
      console.log("📝 Message queued - WebSocket not connected");
      
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

  // ✅ FIXED: Single connection useEffect
  useEffect(() => {
    // Only connect if we have a userId and aren't already connected/connecting
    if (userId && !connected && !isConnectingRef.current) {
      console.log('👤 User ID available, connecting WebSocket...');
      connectWebSocket();
    }
    
    return () => {
      // Cleanup on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [userId]); // ✅ FIXED: Remove connected and connectWebSocket from dependencies

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
      add,
      setAdd,
      userId,
      demosocket,
      setUserId,
      clearConversationMessages,
      updateMessageStatus,
      incoming,
      setIncoming,
      clientmsg,
      manualReconnect,
      reconnectAttempts: reconnectAttemptsRef.current
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};