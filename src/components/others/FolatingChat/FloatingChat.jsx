import React, { useState, useEffect, useRef, useMemo } from "react";
import { Avatar, Button, Select } from 'antd';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import useWebSocket from "../../../Websocket/useWebSocket";
// import { useLazyGetMessagesByIdQuery } from "../../../../redux/slices/Apis/customersApi";
import './Floating.css';
import { useLazyGetMessagesByIdQuery } from "../../../redux/slices/Apis/customersApi";

const { Option } = Select;

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const customerData = localStorage.getItem("customerId");
  const customerId = customerData ? JSON.parse(customerData)?.user?.id : null;
  const { messages, sendMessage, connected } = useWebSocket(customerId);
  const [newMessage, setNewMessage] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [previousMessages, setPreviousMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const [getMessagesById] = useLazyGetMessagesByIdQuery();

  // Fetch API messages when conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;
      try {
        const res = await getMessagesById(selectedConversation).unwrap();
        setPreviousMessages(res.results || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [selectedConversation, getMessagesById]);

  // Merge WebSocket + API messages
  const allMessages = useMemo(() => {
    if (!selectedConversation) return [];
    return [
      ...previousMessages.map(msg => ({
        id: msg.id || msg._id,
        sender: msg.sender,
        receiver: msg.receiver,
        text: msg.message,
        timestamp: msg.timestamp
      })),
      ...messages
        .filter(msg =>
          msg.data && 
          (msg.data.sender === selectedConversation || msg.data.receiver === selectedConversation)
        )
        .map(msg => ({
          id: msg.id || Date.now(),
          sender: msg.data.sender,
          receiver: msg.data.receiver,
          text: msg.data.message,
          timestamp: msg.data.timestamp
        }))
    ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [messages, previousMessages, selectedConversation]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handleSend = () => {
    if (!newMessage.trim() || !connected || !selectedConversation) return;
    sendMessage(selectedConversation, newMessage);
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
          {allMessages.length === 0 && <p className="text-gray-400 text-center">No messages yet</p>}
          {allMessages.map(msg => {
            const isMe = msg.sender === customerId;
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
              >
                {!isMe && <Avatar size={30} src="https://as2.ftcdn.net/v2/jpg/03/83/25/83/1000_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg" />}
                <div className="max-w-[70%]">
                  <div className={`px-4 py-2 rounded-2xl shadow-sm ${isMe ? "bg-[#CBA135] text-white rounded-br-none" : "bg-white text-[#0F0F0F] rounded-bl-none"}`}>
                    {msg.text}
                  </div>
                  <div className={`text-[11px] mt-1 ${isMe ? "text-right text-gray-400" : "text-left text-gray-400"}`}>
                    {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMe && <span className="ml-1 text-blue-400">✓✓</span>}
                  </div>
                </div>
                {isMe && <Avatar size={30} src="https://as2.ftcdn.net/v2/jpg/03/83/25/83/1000_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg" />}
              </div>
            );
          })}
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
            disabled={!connected || !selectedConversation}
          />
          <Button
            type="primary"
            icon={<FaPaperPlane size={19} />}
            onClick={handleSend}
            className="bg-pink-500 hover:bg-yellow-600 flex justify-center items-center border-none"
            disabled={!newMessage.trim() || !connected || !selectedConversation}
          />
        </div>
      </div>
    </>
  );
};

export default FloatingChat;
