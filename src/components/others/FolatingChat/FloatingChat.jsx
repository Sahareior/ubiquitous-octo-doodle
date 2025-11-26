import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Avatar, Button, Select, Tabs, Tooltip } from 'antd';
import { FaRobot, FaTimes, FaPaperPlane, FaHeadset, FaStore, FaUser } from 'react-icons/fa';

import './Floating.css';
import { useGetProfileQuery, useLazyGetMessagesByIdQuery } from "../../../redux/slices/Apis/customersApi";
import image from "../../../assets/icon.png"
import { useWebSocketContext } from "../../../context/WebSocketContext";
import { useLocation } from "react-router-dom";

const { Option } = Select;
const { TabPane } = Tabs;

const FloatingChat = ({ targetedId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    globalMessages, 
    sendMessage, 
    connected, 
    setUserId, 
    setIncoming, 
    incoming, 
    clientmsg 
  } = useWebSocketContext();
  
  const customerData = useMemo(() => localStorage.getItem("customerId"), []);
  const customerId = useMemo(() => 
    customerData ? JSON.parse(customerData)?.user?.id : null, 
    [customerData]
  );

  
  
  const [newMessage, setNewMessage] = useState("");
  const [activeReceiver, setActiveReceiver] = useState(targetedId || 1);
  const [previousMessages, setPreviousMessages] = useState([]);
  
  const { data: profileData } = useGetProfileQuery();
  const messagesEndRef = useRef(null);
  const [receivers, setReceivers] = useState(targetedId ? [targetedId] : []);
  
  const customerPhoto = useMemo(() => 
    customerData ? JSON.parse(customerData)?.user?.profile_image : null, 
    [customerData]
  );
  
  const [getMessagesById] = useLazyGetMessagesByIdQuery();
  const location = useLocation();
  const isDetailsPage = location.pathname === "/details";

  // Set userId only once when component mounts
  useEffect(() => {
    if (customerId) {
     
      setUserId(customerId);
    }
  }, [customerId, setUserId]);

  // Add targetedId to receivers list when it changes
  useEffect(() => {
    if (targetedId && !receivers.includes(targetedId)) {
      setReceivers(prev => [...prev, targetedId]);
      setActiveReceiver(targetedId);
    }
  }, [targetedId]);

  // Reset messages when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPreviousMessages([]);
    }
  }, [isOpen]);

  // Fetch previous messages with cleanup
  useEffect(() => {
    let isMounted = true;
    
    const fetchMessages = async () => {
      if (!activeReceiver || !customerId || !isOpen) return;
      
      try {
        const res = await getMessagesById(activeReceiver).unwrap();
        if (isMounted) {
          setPreviousMessages(res.results || []);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };
    
    if (isOpen) {
      fetchMessages();
    }
    
    return () => {
      isMounted = false;
    };
  }, [activeReceiver, customerId, getMessagesById, isOpen]);

  // Optimized message filtering with duplicate prevention
  const allMessages = useMemo(() => {
    if (!activeReceiver || !customerId) return [];

    const seenMessageIds = new Set();

    const apiMessages = (previousMessages || [])
      .filter(msg => 
        msg && 
        ((msg.sender === activeReceiver && msg.receiver === customerId) ||
         (msg.receiver === activeReceiver && msg.sender === customerId)) &&
        !seenMessageIds.has(msg.id || msg._id)
      )
      .map(msg => {
        seenMessageIds.add(msg.id || msg._id);
        return {
          id: msg.id || msg._id,
          sender: msg.sender,
          receiver: msg.receiver,
          text: msg.message,
          timestamp: msg.timestamp,
          isFromApi: true
        };
      });

    const wsMessages = (globalMessages || [])
      .filter(msg => 
        msg?.data && 
        msg.data.message &&
        ((msg.data.sender === activeReceiver && msg.data.receiver === customerId) ||
         (msg.data.receiver === activeReceiver && msg.data.sender === customerId)) &&
        !seenMessageIds.has(msg.id || `ws-${msg.data.timestamp}`)
      )
      .map(msg => {
        const messageId = msg.id || `ws-${msg.data.timestamp}`;
        seenMessageIds.add(messageId);
        return {
          id: messageId,
          sender: msg.data.sender,
          receiver: msg.data.receiver,
          text: msg.data.message,
          timestamp: msg.data.timestamp,
          isFromApi: false
        };
      });
    
    // Merge and sort messages
    const mergedMessages = [...apiMessages, ...wsMessages]
      .filter(msg => msg.text && msg.text.trim())
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    
    return mergedMessages;
  }, [globalMessages, previousMessages, activeReceiver, customerId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [allMessages, isOpen]);

  const handleSend = useCallback(() => {
    if (!newMessage.trim() || !connected || !activeReceiver || !customerId) {
      
      return;
    }
    
    
    sendMessage(activeReceiver, newMessage);
    setNewMessage("");
  }, [newMessage, connected, activeReceiver, customerId, sendMessage]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleTabChange = useCallback((key) => {
    setActiveReceiver(key === "support" ? 1 : parseInt(key));
  }, []);

  const addNewChat = useCallback((receiverId) => {
    if (receiverId && !receivers.includes(receiverId)) {
      setReceivers(prev => [...prev, receiverId]);
      setActiveReceiver(receiverId);
    }
  }, [receivers]);

  const annomalyImage = "/image/ann.png";
  const profileImage = profileData?.profile_image || annomalyImage;




  return (
    <>
      {/* Floating Chat Button */}
<div
  className="floating-chat-button w-16 md:w-48 flex rounded-full relative justify-center items-center gap-1 cursor-pointer"
  
  onClick={() => {
    setIsOpen(!isOpen);
    setIncoming(false);
  }}
>
  <img src={image} alt="chat" className="w-8 h-8 rounded-full" />
  <p className="text-yellow-500 hidden md:block font-medium">Contact Us</p>

  {/* Notification Badge */}
  {clientmsg.receiver === customerId && !isOpen && (
    <span className="absolute -top-1 -right-1 flex h-4 w-4">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
    </span>
  )}
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
      profileImage
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
           
          />
        </div>
      </div>
    </>
  );
};

export default FloatingChat;