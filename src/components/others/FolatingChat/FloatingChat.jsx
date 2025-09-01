import React, { useState, useEffect, useRef, useMemo } from "react";
import { Avatar, Button, Select, Tabs, Tooltip } from 'antd';
import { FaRobot, FaTimes, FaPaperPlane, FaHeadset, FaStore, FaUser } from 'react-icons/fa';
import useWebSocket from "../../../Websocket/useWebSocket";
import './Floating.css';
import { useLazyGetMessagesByIdQuery } from "../../../redux/slices/Apis/customersApi";

const { Option } = Select;
const { TabPane } = Tabs;

const FloatingChat = ({ targetedId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const customerData = localStorage.getItem("customerId");
  const customerId = customerData ? JSON.parse(customerData)?.user?.id : null;
  const { messages, sendMessage, connected } = useWebSocket(customerId);
  const [newMessage, setNewMessage] = useState("");
  const [activeReceiver, setActiveReceiver] = useState(targetedId || 1);
  const [previousMessages, setPreviousMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [receivers, setReceivers] = useState(targetedId ? [targetedId] : []);

  const [getMessagesById] = useLazyGetMessagesByIdQuery();

  // Add targetedId to receivers list when it changes
  useEffect(() => {
    if (targetedId && !receivers.includes(targetedId)) {
      setReceivers(prev => [...prev, targetedId]);
      setActiveReceiver(targetedId);
    }
  }, [targetedId, receivers]);

  // Fetch API messages when active receiver changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeReceiver) return;
      try {
        const res = await getMessagesById(activeReceiver).unwrap();
        setPreviousMessages(res.results || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [activeReceiver, getMessagesById]);

  // Filter and merge WebSocket + API messages for the active receiver
  const allMessages = useMemo(() => {
    if (!activeReceiver) return [];
    
    // Filter API messages for the active receiver
    const apiMessages = previousMessages
      .filter(msg => 
        (msg.sender === activeReceiver && msg.receiver === customerId) ||
        (msg.receiver === activeReceiver && msg.sender === customerId)
      )
      .map(msg => ({
        id: msg.id || msg._id,
        sender: msg.sender,
        receiver: msg.receiver,
        text: msg.message,
        timestamp: msg.timestamp,
        isFromApi: true
      }));
    
    // Filter WebSocket messages for the active receiver
    const wsMessages = messages
      .filter(msg => 
        msg.data && 
        ((msg.data.sender === activeReceiver && msg.data.receiver === customerId) ||
         (msg.data.receiver === activeReceiver && msg.data.sender === customerId))
      )
      .map(msg => ({
        id: msg.id || Date.now(),
        sender: msg.data.sender,
        receiver: msg.data.receiver,
        text: msg.data.message,
        timestamp: msg.data.timestamp,
        isFromApi: false
      }));
    
    // Merge and sort messages
    return [...apiMessages, ...wsMessages]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [messages, previousMessages, activeReceiver, customerId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handleSend = () => {
    if (!newMessage.trim() || !connected || !activeReceiver) return;
    sendMessage(activeReceiver, newMessage);
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTabChange = (key) => {
    setActiveReceiver(key === "support" ? 1 : parseInt(key));
  };

  const addNewChat = (receiverId) => {
    if (receiverId && !receivers.includes(receiverId)) {
      setReceivers(prev => [...prev, receiverId]);
      setActiveReceiver(receiverId);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="floating-chat-button md:w-56 flex justify-center items-center gap-3" onClick={() => setIsOpen(!isOpen)}>
        <FaRobot className="floating-chat-button-icon" size={20} />
        <span className='text-[#CBA135] hidden md:block'>Chat Assistant</span>
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

        {/* Receiver Tabs */}
    <div className="receiver-tabs border-b border-gray-700 bg-gray-900 px-2">
          <Tabs
            activeKey={activeReceiver === 1 ? "support" : activeReceiver?.toString()}
            onChange={handleTabChange}
            type="card"
            size="small"
            className="custom-dark-tabs"
            tabBarStyle={{
              marginBottom: 0,
              border: 'none',
            }}
          >
            <TabPane 
              tab={
                <span className="flex items-center text-gray-200">
                  <FaRobot className="mr-1" size={14} />
                  Support
                </span>
              } 
              key="support" 
            />
            {receivers.filter(receiverId => receiverId !== 1).length > 0 && (
              receivers.map(receiverId => (
                receiverId !== 1 && (
                  <TabPane 
                    tab={
                      <span className="flex items-center text-gray-100">
                        <FaUser className="mr-1" size={14} />
                        Vendor
                      </span>
                    } 
                    key={receiverId.toString()} 
                  />
                )
              ))
            )}
          </Tabs>
        </div>

        {/* Chat Body */}
        <div className="chat-body flex flex-col gap-2 overflow-y-auto p-3 max-h-[300px]">
          {allMessages.length === 0 && <p className="text-gray-400 text-center">No messages yet</p>}
          {allMessages.map(msg => {
            const isMe = msg.sender === customerId;
            return (
              <div
                key={`${msg.id}-${msg.isFromApi ? 'api' : 'ws'}`}
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
            disabled={!connected || !activeReceiver}
          />
          <Button
            type="primary"
            icon={<FaPaperPlane size={19} />}
            onClick={handleSend}
            className="bg-pink-500 hover:bg-yellow-600 flex justify-center items-center border-none"
            disabled={!newMessage.trim() || !connected || !activeReceiver}
          />
        </div>
      </div>
    </>
  );
};

export default FloatingChat;