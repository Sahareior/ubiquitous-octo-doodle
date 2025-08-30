import React, { useState, useEffect, useRef } from "react";
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import useWebSocket from "../../../Websocket/useWebSocket";
import { Avatar, Button } from 'antd';
import './Floating.css';

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const customerData = localStorage.getItem("customerId");
  const customerId = customerData ? JSON.parse(customerData)?.user?.id : null;
  const { messages, sendMessage, connected } = useWebSocket(customerId);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const receiverId = 1; // static for now

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !connected) return;
    sendMessage(receiverId, newMessage);
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filter duplicates
  const uniqueMessages = messages.reduce((acc, current) => {
    const exists = acc.find(msg =>
      (msg.id && current.id && msg.id === current.id) ||
      (msg.tempId && current.tempId && msg.tempId === current.tempId)
    );
    if (!exists) return acc.concat([current]);
    return acc;
  }, []);

  return (
    <>
      {/* Floating Chat Button */}
      <div className="floating-chat-button w-56" onClick={() => setIsOpen(!isOpen)}>
        <FaRobot className="floating-chat-button-icon" size={20} />
        <span className='text-[#CBA135]'>Chat Assistant</span>
      </div>

      {/* Chat Window */}
      <div className={`floating-chat-window ${isOpen ? '' : 'hidden'}`}>
        {/* Header */}
        <div className="chat-header flex justify-between items-center px-4 py-2 bg-gray-100">
          <div className="flex items-center gap-2">
            <Avatar src="https://as2.ftcdn.net/v2/jpg/03/83/25/83/1000_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg" />
            <span>Support</span>
          </div>
          <FaTimes onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }} />
        </div>

        {/* Chat Body */}
        <div className="chat-body flex flex-col gap-2 overflow-y-auto p-3 max-h-[300px]">
          {uniqueMessages
            .filter(msg => msg.status !== "pending")
            .map(msg => (
              <div
                key={msg.id || msg.tempId}
                className={`flex items-end gap-2 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender !== "me" && (
                  <Avatar size={30} src="https://as2.ftcdn.net/v2/jpg/03/83/25/83/1000_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg" />
                )}
                <div className="max-w-[70%]">
                  <div
                    className={`px-4 py-2 rounded-2xl shadow-sm relative ${
                      msg.sender === "me"
                        ? "bg-[#CBA135] text-white rounded-br-none"
                        : "bg-white text-[#0F0F0F] rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className={`text-[11px] mt-1 ${msg.sender === "me" ? "text-right text-gray-400" : "text-left text-gray-400"}`}>
                    {msg.data?.timestamp && new Date(msg.data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.sender === "me" && <span className="ml-1 text-blue-400">✓✓</span>}
                  </div>
                </div>
                {msg.sender === "me" && (
                  <Avatar size={30} src="https://as2.ftcdn.net/v2/jpg/03/83/25/83/1000_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg" />
                )}
              </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Footer */}
        <div className="chat-footer flex gap-2 items-center p-2 border-t">
          <textarea
            rows={1}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="chat-input flex-1 border rounded px-2 py-1 resize-none"
            disabled={!connected}
          />
          <Button
            type="primary"
            icon={<FaPaperPlane size={19} />}
            onClick={handleSend}
            className="bg-pink-500 hover:bg-yellow-600 flex justify-center items-center border-none"
            disabled={!newMessage.trim() || !connected}
          />
        </div>
      </div>
    </>
  );
};

export default FloatingChat;
