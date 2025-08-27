
import { useEffect, useRef, useState } from "react";

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
        // console.log("📩 New message from server:", data);

        // Only add if it's not already sent by me
        setMessages((prev) => {
          // Avoid duplicate: don't re-add your own message
          if (data.sender === userId) return prev;
          return [...prev, { text: data.message, sender: "server", data }];
        });
      } catch (err) {
        console.error("📩 Failed parsing message:", err, event.data);
      }
    };

    socket.onerror = (err) => {
      console.error("⚠️ WebSocket error:", err);
    };

    socket.onclose = (e) => {
      console.log(`❌ WebSocket disconnected: ${e.reason}. Retrying in 3s...`);
      setConnected(false);
      setTimeout(connectWebSocket, 3000); // auto-reconnect
    };
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []); // run once

  const sendMessage = (receiverId, message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const messageObj = { user_id: receiverId, message };
      socketRef.current.send(JSON.stringify(messageObj));

      // Immediately update local state for sender UI
      setMessages((prev) => [...prev, { text: message, sender: "me", data: messageObj }]);
    } else {
      console.warn("⚠️ WebSocket not connected yet. Message not sent.");
    }
  };

  return { messages, sendMessage, connected };
};

export default useWebSocket;
