
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Avatar, Button, Select, Tabs, Tooltip } from 'antd';
import { FaRobot, FaTimes, FaPaperPlane, FaHeadset, FaStore, FaUser } from 'react-icons/fa';

import './Floating.css';
import { useLazyGetMessagesByIdQuery } from "../../../redux/slices/Apis/customersApi";
import image from "../../../assets/icon.png"
import { useWebSocketContext } from "../../../context/WebSocketContext";

const { Option } = Select;
const { TabPane } = Tabs;

const FloatingChat = ({ targetedId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { globalMessages, sendMessage, connected,setUserId } = useWebSocketContext();
  const customerData = localStorage.getItem("customerId");
  const customerId = customerData ? JSON.parse(customerData)?.user?.id : null;
  const [newMessage, setNewMessage] = useState("");
  const [activeReceiver, setActiveReceiver] = useState(targetedId ||1);
  const [previousMessages, setPreviousMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [receivers, setReceivers] = useState(targetedId ? [targetedId] : []);
   const customerPhoto = customerData ? JSON.parse(customerData)?.user?.profile_image : null;
  const [getMessagesById] = useLazyGetMessagesByIdQuery();

  // Add targetedId to receivers list when it changes
  useEffect(() => {
    if (targetedId && !receivers.includes(targetedId)) {
      setReceivers(prev => [...prev, targetedId]);
      setActiveReceiver(targetedId);
    }
  }, [targetedId, receivers]);

  setUserId(customerId)
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


  console.log(globalMessages,'this is global mesaagae')

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
    const wsMessages = globalMessages
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
  }, [globalMessages, previousMessages, activeReceiver, customerId]);

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
  
  const imaga= `http://10.10.13.16:8000${customerPhoto}`

  return (
    <>
      {/* Floating Chat Button */}
      <div className="floating-chat-button md:w-48 flex rounded-full justify-center items-center gap-1" onClick={() => setIsOpen(!isOpen)}>
     
        <img src={image} alt="" />
        <p className="text-yellow-500">Contact Us</p>
     
      </div>

   
      <div className={`floating-chat-window ${isOpen ? '' : 'hidden'}`}>
    
        <div className="chat-header flex justify-between items-center px-4 py-3 bg-gray-900 border-b border-[#CBA135]/30">
          <div className="flex items-center gap-2">
            <Avatar src="https://as2.ftcdn.net/v2/jpg/03/83/25/83/1000_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg" />
            <span className="text-[#CBA135] font-medium">Support</span>
          </div>
          <FaTimes 
            onClick={() => setIsOpen(false)} 
            className="text-gray-400 hover:text-[#CBA135] transition-colors cursor-pointer" 
          />
        </div>

       
        <div className="receiver-tabs bg-gray-900 px-2 pt-3">
          <Tabs
            activeKey={activeReceiver === 1 ? "support" : activeReceiver?.toString()}
            onChange={handleTabChange}
            type="card"
            size="small"
            className="custom-tabs"
            tabBarStyle={{
              marginBottom: 0,
              border: 'none',
            }}
          >
            <TabPane 
              tab={
                <Tooltip title="Chat with Support">
                  <span className="flex items-center gap-1 px-2 py-1 rounded-md transition-all">
                    <FaRobot className="text-[#CBA135]" size={14} />
                    <span className="text-gray-200">Support</span>
                  </span>
                </Tooltip>
              } 
              key="support" 
            />
            {receivers.filter(receiverId => receiverId !==1).length > 0 && (
              receivers.map(receiverId => (
                receiverId !==1 && (
                  <TabPane 
                    tab={
                      <Tooltip title="Chat with Vendor">
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md transition-all">
                          <FaUser className="text-[#00ffff]" size={14} />
                          <span className="text-gray-200">Chat with Vendor</span>
                        </span>
                      </Tooltip>
                    } 
                    key={receiverId.toString()} 
                  />
                )
              ))
            )}
          </Tabs>
        </div>

        {/* Chat Body */}
        <div className="chat-body  flex-col gap-3 overflow-y-auto p-4 h-[400px] hidden bg-gray-900/50">
          {allMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FaPaperPlane size={24} className="mb-2 opacity-50" />
              <p>No messages yet</p>
              <p className="text-xs mt-1">Start a conversation!</p>
            </div>
          )}
          {allMessages.map(msg => {
            const isMe = msg.sender === customerId;
            return (
              <div
                key={`${msg.id}-${msg.isFromApi ? 'api' : 'ws'}`}
                className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
              >
                {!isMe && (
                  <Avatar 
                    size={32} 
                    src="https://as2.ftcdn.net/v2/jpg/03/83/25/83/1000_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg" 
                    className="border border-[#CBA135]/30"
                  />
                )}
                <div className="max-w-[75%]">
                  <div className={`px-4 py-2 rounded-2xl shadow-sm ${isMe ? "bg-gradient-to-r from-[#CBA135] to-[#d4b65e] text-white rounded-br-none" : "bg-gray-800 text-white rounded-bl-none border border-gray-700"}`}>
                    {msg.text}
                  </div>
                  <div className={`text-xs mt-1 ${isMe ? "text-right text-gray-400" : "text-left text-gray-400"}`}>
                    {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMe && <span className="ml-1 text-blue-400">✓✓</span>}
                  </div>
                </div>
{isMe && (
  <Avatar
    size={32}
    src={
      customerPhoto
        ? `${imaga}`
        : "https://cdn-icons-png.flaticon.com/512/149/149071.png" // fallback image
    }
    className="border border-[#CBA135]/30"
  />
)}

              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Footer */}
        <div className="chat-footer flex gap-2 items-center p-3 border-t border-gray-700 bg-gray-900">
          <textarea
            rows={1}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="chat-input flex-1 border rounded-lg px-3 py-2 resize-none bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#CBA135]/50 focus:border-[#CBA135]/50"
            disabled={!connected || !activeReceiver}
          />
          <Button
            type="primary"
            icon={<FaPaperPlane size={16} />}
            onClick={handleSend}
            className="bg-gradient-to-r from-[#CBA135] to-[#d4b65e] hover:from-[#b8912e] hover:to-[#c9a74d] flex justify-center items-center border-none h-10 w-10 rounded-lg transition-all shadow-md hover:shadow-lg"
            disabled={ !connected || !activeReceiver}
          />
        </div>
      </div>
    </>
  );
};

export default FloatingChat;