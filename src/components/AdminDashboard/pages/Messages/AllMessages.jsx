import React, { useState, useEffect } from "react";
import useWebSocket from "../../../../Websocket/useWebSocket";
import { Input, Select, Avatar, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import LeftPannel from "./LeftPannel";

const { Option } = Select;

const AllMessages = () => {
  // Get user ID from localStorage
  const userData = JSON.parse(localStorage.getItem('customerId') || '{"user": {"id": 1}}');
  const userId = userData.user.id;

  const { messages, sendMessage, connected } = useWebSocket(userId);
  const [newMessage, setNewMessage] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(12); // Default conversation ID

  console.log(messages, 'messages from websocket');

  // Sample conversation list
  const conversations = [
    {
      id: 12,
      name: 'Fariha Tasnim',
      subject: 'Payment issue - Urgent',
      time: '2:30 PM',
      email: 'fariha.tasnim@gmail.com',
      preview: "I'm confused. My order #12345 payment isn't showing as complete...",
      status: 'Replied',
    },
    // Add more conversations if needed
  ];

  // Filter messages for the selected conversation
  const conversationMessages = messages.filter(msg =>
    msg.data && 
    (msg.data.sender === selectedConversation || msg.data.receiver === selectedConversation)
  );

  const handleSend = () => {
    if (newMessage.trim()) {
      sendMessage(selectedConversation, newMessage);
      setNewMessage("");
    }
  };

  // Format time for display
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      {/* Search and Filter */}
      <div className='bg-white p-6 mt-2'> 
        <div className="flex items-center gap-2">
          <input 
            className='w-[30%] border border-gray-300 rounded-md px-4 py-1 focus:outline-none' 
            placeholder="Search messages..." 
          />
          <Select defaultValue="Role" className="w-[120px] ">
            <Option value="Customer">Customer</Option>
            <Option value="Seller">Seller</Option>
          </Select>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex h-[90vh] bg-white rounded-md border overflow-hidden">
        {/* Left Panel - Conversations */}
        {/* <div className="w-[30%] border-r p-4 space-y-4">
          <div className="space-y-2 overflow-y-auto max-h-[75vh] pr-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 rounded hover:bg-gray-100 cursor-pointer border-b border-slate-100 ${
                  selectedConversation === conversation.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className='flex items-center justify-between w-full gap-2'>
                  <div className='flex gap-3'>
                    <Avatar src="https://as2.ftcdn.net/v2/jpg/03/83/25/83/1000_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg" />
                    <div className="flex items-center justify-between">
                      <span className="popbold text-gray-800">{conversation.name}</span>
                    </div>
                  </div>
                  <div className='flex gap-2 items-center'>
                    <span
                      className={`mt-1 inline-block text-xs popreg px-2 py-0.5 rounded-full ${
                        conversation.status === 'Unread'
                          ? 'bg-red-100 text-red-600'
                          : conversation.status === 'Read'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {conversation.status}
                    </span>
                    <span className="text-xs popreg text-gray-500">{conversation.time}</span>
                  </div>
                </div>
                <div className='md:pl-11'>
                  <div className="text-[14px] popmed text-gray-700">{conversation.subject}</div>
                  <div className="text-xs popreg mt-1 text-gray-500">
                    {conversation.preview?.slice(0, 45) || ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div> */}
        <LeftPannel />

        {/* Right Panel - Chat Detail */}
        <div className="w-[70%] flex flex-col justify-between p-5">
          {/* Header */}
          <div className="flex flex-col mb-3">
            <div className="flex items-center gap-3">
              <Avatar src="https://as2.ftcdn.net/v2/jpg/03/83/25/83/1000_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg" />
              <div>
                <div className="text-[16px] popbold">Fariha Tasnim</div>
                <div className="text-xs popreg text-gray-500">fariha.tasnim@gmail.com</div>
              </div>
            </div>
            <div className="text-[20px] mt-5 popbold">Payment issue – Urgent</div>
            <p className='popreg text-xs text-[#666666]'>Today at 2:30 PM</p>
            <div className='h-[0.7px] w-full bg-slate-300 mt-6 px-0' />
          </div>
          
          {/* Conversation Messages */}
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[80vh] px-2">
            {conversationMessages.map((msg, index) => {
              const isMe = msg.data.sender === userId;
              return (
                <div key={index} className={`flex gap-3 ${isMe ? "ml-32" : "pl-14"}`}>
                  {!isMe && (
                    <Avatar
                      size={40}
                      src="https://as2.ftcdn.net/v2/jpg/03/83/25/83/1000_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg"
                    />
                  )}
                  <div className="max-w-[85%]">
                    <div 
                      className={`px-4 py-3 rounded-lg text-sm shadow-md ${
                        isMe 
                          ? "bg-[#CBA135] text-white border-l-4 border-yellow-300" 
                          : "bg-[#ECECEC] text-[#0F0F0F]"
                      }`}
                    >
                      {msg.data.message}
                    </div>
                    <p className="text-xs text-right text-gray-500 mt-1">
                      {formatTime(msg.data.timestamp)}
                    </p>
                  </div>
                  {isMe && (
                    <Avatar
                      size={40}
                      src="https://as2.ftcdn.net/v2/jpg/03/83/25/83/1000_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg"
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Reply Box */}
          <div className="mt-5">
            <textarea
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none"
              rows={3}
              placeholder="Type your reply..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              className="mt-2 bg-yellow-500 hover:bg-yellow-600 border-none"
              onClick={handleSend}
              disabled={!connected}
            >
              {connected ? "Send Reply" : "Connecting..."}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllMessages;
