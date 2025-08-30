import { useEffect, useRef, useState } from "react";

const useNotificationSocket = () => {
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const token = localStorage.getItem("access_token");

  // Load saved notifications on mount
  useEffect(() => {
    const saved = localStorage.getItem("notifications");
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const wsUrl = `ws://10.10.13.16:8000/ws/notification/?token=${token}`;
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log(" WebSocket connected ");
      setConnected(true);
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("New notification received:", data);

        setNotifications((prev) => {
          const updated = [...prev, data];
          localStorage.setItem("notifications", JSON.stringify(updated)); // persist
          return updated;
        });
      } catch (err) {
        console.error("Error parsing notification:", err, event.data);
      }
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [token]);

  // Clear all notifications when user has seen them
  const markAllAsRead = () => {
    setNotifications([]);
    localStorage.removeItem("notifications");
  };

  return { notifications, connected, markAllAsRead };
};

export default useNotificationSocket;
