import React, { useState, useEffect, useRef } from "react";

// Custom WebSocket hook with duplicate prevention
const useWebSocket = (userId) => {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const token = localStorage.getItem("access_token");

  const connectWebSocket = () => {
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

        setMessages((prev) => {
          // ✅ If message already exists (by message_id), skip
          if (data.message_id && prev.some((m) => m.data?.message_id === data.message_id)) {
            return prev;
          }

          // ✅ If server sent back a message that matches a tempId → update instead of adding
          if (data.tempId) {
            const updated = prev.map((msg) =>
              msg.tempId === data.tempId
                ? {
                    ...msg,
                    sender: data.sender === userId ? "me" : "server",
                    data,
                    status: "sent",
                    id: data.message_id || msg.id
                  }
                : msg
            );
            
            // Check if we actually updated a message
            if (updated.some(msg => msg.tempId === data.tempId && msg.status === "sent")) {
              return updated;
            }
          }

          // ✅ Otherwise, it's a new message
          return [
            ...prev,
            {
              text: data.message,
              sender: data.sender == userId ? "me" : "server", // Use == for loose comparison
              data,
              id: data.message_id || Date.now(), // stable ID from server or fallback
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
      console.log(`❌ WebSocket disconnected: ${e.reason}. Retrying in 3s...`);
      setConnected(false);
      setTimeout(connectWebSocket, 3000);
    };
  };

  useEffect(() => {
    if (userId && token) {
      connectWebSocket();
    }
    return () => socketRef.current?.close();
  }, [userId, token]);

  const sendMessage = (receiverId, message, tempId = Date.now()) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const messageObj = { user_id: receiverId, message, tempId };

      // Send to server
      socketRef.current.send(JSON.stringify(messageObj));

      // Optimistic UI update
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          tempId: tempId,
          text: message,
          sender: "me",
          data: messageObj,
          status: "pending",
        },
      ]);
      
      return tempId; // Return the tempId for potential tracking
    } else {
      console.warn("⚠️ WebSocket not connected yet. Message not sent.");
      return null;
    }
  };

  return { messages, sendMessage, connected };
};

export default useWebSocket;