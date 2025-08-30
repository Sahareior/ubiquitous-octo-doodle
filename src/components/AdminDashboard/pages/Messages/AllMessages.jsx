import React, { useState, useEffect, useRef } from "react";
import useWebSocket from "../../../../Websocket/useWebSocket";
import { Input, Select, Avatar, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import LeftPannel from "./LeftPannel";
import { useLazyGetMessagesByIdQuery } from "../../../../redux/slices/Apis/customersApi";

const { Option } = Select;

const AllMessages = () => {
  const customerData = localStorage.getItem("customerId");
  const customerId = customerData ? JSON.parse(customerData)?.user?.id : null;
  const { messages, sendMessage, connected } = useWebSocket(customerId);
  const [getMessagesById] = useLazyGetMessagesByIdQuery();
  
  const [newMessage, setNewMessage] = useState("");
  const [previousMessages, setPreviousMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationInfo, setConversationInfo] = useState({
    name: "Select a conversation",
    email: "",
    subject: "",
    time: ""
  });

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;
      try {
        const userRes = await getMessagesById(selectedConversation).unwrap();
        setPreviousMessages(userRes.results || []);
        
        // Set conversation info if available in response
        if (userRes.conversationInfo) {
          setConversationInfo(userRes.conversationInfo);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [selectedConversation, getMessagesById]);

  // Filter and merge API + WebSocket messages
  const allConversationMessages = selectedConversation
    ? [
        ...previousMessages.map(msg => ({
          id: msg.id || msg._id,
          sender: msg.sender,
          receiver: msg.receiver,
          message: msg.message,
          timestamp: msg.timestamp
        })),
        ...messages
          .filter(msg => 
            msg.data && 
            (msg.data.sender === selectedConversation || 
             msg.data.receiver === selectedConversation)
          )
          .map(msg => ({
            id: msg.id || Date.now(), // temporary ID for WebSocket messages
            sender: msg.data.sender,
            receiver: msg.data.receiver,
            message: msg.data.message,
            timestamp: msg.data.timestamp
          }))
      ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    : [];

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [allConversationMessages]);

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

  // Format time for display
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div>
      <div className='bg-white p-6 mt-2'> 
        <div className="flex items-center gap-2">
          <Input className='w-[30%]' placeholder="Search messages..." />
          <Select defaultValue="Role" className="w-[120px]">
            <Option value="Customer">Customer</Option>
            <Option value="Seller">Seller</Option>
          </Select>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex h-[80vh] bg-white rounded-md border overflow-hidden">
        {/* Left Panel - Conversations */}
        <div className="w-[30%] border-r border-gray-300">
          <LeftPannel 
            setSelectedConversation={setSelectedConversation} 
            setConversationInfo={setConversationInfo}
            connected={connected}
          />
        </div>

        {/* Right Panel - Chat Detail */}
        <div className="w-[70%] flex flex-col bg-[#FAFAFA]">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b px-5 py-3 bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  <Avatar src="https://as2.ftcdn.net/v2/jpg/03/83/25/83/1000_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg" />
                  <div>
                    <div className="text-[16px] font-semibold">{conversationInfo.name}</div>
                    <div className="text-xs text-gray-500">{conversationInfo.email || "N/A"}</div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{conversationInfo.time}</span>
              </div>

              {/* Subject */}
              <div className="px-5 py-3 border-b">
                <div className="text-[18px] font-bold">{conversationInfo.subject}</div>
                <p className="text-xs text-[#666666] mt-1">Conversation started at {conversationInfo.time}</p>
              </div>

              {/* Conversation */}
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto px-5 py-4 bg-[#F7F7F7]">
                {allConversationMessages.map(msg => {
                  const isMe = msg.sender === customerId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      {!isMe && (
                        <Avatar size={35} src="https://as2.ftcdn.net/v2/jpg/03/83/25/83/1000_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg" />
                      )}
                      <div className={`max-w-[70%] ${isMe ? "text-right" : "text-left"}`}>
                        <div
                          className={`px-4 py-2 rounded-2xl shadow-sm relative ${
                            isMe
                              ? "bg-[#CBA135] text-white rounded-br-none"
                              : "bg-white text-[#0F0F0F] rounded-bl-none"
                          }`}
                        >
                          {msg.message}
                        </div>
                        <div className={`text-[11px] mt-1 ${isMe ? "text-right text-gray-400" : "text-left text-gray-400"}`}>
                          {formatTime(msg.timestamp)}
                          {isMe && (
                            <span className="ml-2 text-blue-400">✓✓</span> // seen indicator
                          )}
                        </div>
                      </div>
                      {isMe && (
                        <Avatar size={35} src="https://as2.ftcdn.net/v2/jpg/03/83/25/83/1000_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg" />
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Box */}
              <div className="border-t bg-white px-4 py-3 flex justify-center items-center gap-2">
                <textarea
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none resize-none"
                  rows={2}
                  placeholder="Type your reply..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!connected}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSend}
                  className="bg-yellow-500 hover:bg-yellow-600 border-none"
                  disabled={!newMessage.trim() || !connected || !selectedConversation}
                >
                  Send
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-lg">
              Select a conversation to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllMessages;