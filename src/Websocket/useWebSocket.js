import React, { useState, useEffect, useRef } from "react";
import { useGetAllConversationsidQuery } from "../redux/slices/Apis/dashboardApis";

// Custom WebSocket hook with duplicate prevention
const useWebSocket = (userId) => {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [lastSeen, setLastSeen] = useState({}); // { userId: timestamp }
    const { data = [],refetch } = useGetAllConversationsidQuery(); 
  const [connected, setConnected] = useState(false);
  const token = localStorage.getItem("access_token");

  const connectWebSocket = () => {
    const wsUrl = ``;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      setConnected(true);
      socketRef.current = socket;
    };

  socket.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
console.log(data,'dadadaaaaa')
    if (data.sender) {
      // record when this user was last active
      setLastSeen(prev => ({ ...prev, [data.sender]: Date.now() }));
    }

    // ✅ existing message handling code...
    setMessages((prev) => {
      if (data.message_id && prev.some((m) => m.data?.message_id === data.message_id)) {
        return prev;
      }

      return [
        ...prev,
        {
          text: data.message,
          sender: data.sender == userId ? "me" : "server",
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
      // console.log(`❌ WebSocket disconnected: ${e.reason}. Retrying in 3s...`);
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
      console.log(messageObj,'this is message obj')
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
      refetch()
      return tempId; // Return the tempId for potential tracking
    } else {
      console.warn("⚠️ WebSocket not connected yet. Message not sent.");
      return null;
    }
  };

  return { messages, sendMessage, connected, lastSeen };

};

export default useWebSocket;