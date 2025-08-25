// src/socket.js
import { io } from "socket.io-client";

// Replace with your backend URL
const socket = io("http://localhost:5000", {
  transports: ["websocket"], // force websocket
  reconnection: true,
});

export default socket;
