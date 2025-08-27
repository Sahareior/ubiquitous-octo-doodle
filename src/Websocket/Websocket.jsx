import { useEffect, useRef, useState, useCallback } from "react";

const useWebSocket = (url) => {
  const ws = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!url) return;
    
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log("✅ WebSocket connected");
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📩 Received:", data);
          setMessages((prev) => [...prev, data]);
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      ws.current.onclose = (event) => {
        console.log("❌ WebSocket closed", event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current += 1;
          setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`);
            connect();
          }, delay);
        }
      };

      ws.current.onerror = (error) => {
        console.error("⚠️ WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
    }
  }, [url]);

  useEffect(() => {
    // Only connect if we have a URL
    if (url) {
      connect();
    }

    return () => {
      if (ws.current) {
        ws.current.close();
        console.log("WebSocket connection cleaned up");
      }
    };
  }, [url, connect]);

  const sendMessage = useCallback((msg) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg));
      return true;
    } else {
      console.warn("WebSocket is not open");
      return false;
    }
  }, []);

  return { messages, sendMessage, isConnected };
};

export default useWebSocket;