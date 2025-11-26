import React, { useState, useEffect, useRef } from "react";
import { Input, Select, Avatar, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import LeftPannel from "./LeftPannel";
import { useLazyGetMessagesByIdQuery } from "../../../../redux/slices/Apis/customersApi";
import { GoPersonFill } from 'react-icons/go';
import { useWebSocketContext } from "../../../../context/WebSocketContext";

const { Option } = Select;

const AllMessages = () => {
  
  // Use the global WebSocket context
  const { globalMessages, sendMessage, connected, clearConversationMessages, allMessages, userId, setUserId,demosocket } = useWebSocketContext();
  
  const customerData = localStorage.getItem("customerId");
  const customerId = customerData ? JSON.parse(customerData)?.user?.id : null;
  

 

  const [targetedConvo, setTargetedConvo] = useState({});
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

  // Filter messages for the current conversation
const currentConversationMessages = globalMessages.filter(msg => {
  if (!selectedConversation) return false;
  
  // Check if this message belongs to the selected conversation
  const msgSender = msg.sender === "me" ? userId : msg.sender;
  const msgReceiver = msg.data?.user_id || msg.data?.receiver;
  
  return (
    msgSender === selectedConversation ||
    msgReceiver === selectedConversation ||
    (msg.data?.sender === selectedConversation) ||
    (msg.data?.receiver === selectedConversation)
  );
});

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;
      try {
        const userRes = await getMessagesById(selectedConversation).unwrap();
        setPreviousMessages(userRes.results || []);
        
        if (userRes.conversationInfo) {
          setConversationInfo(userRes.conversationInfo);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    
    fetchMessages();
  }, [selectedConversation, getMessagesById]);

  // Merge API messages with WebSocket messages, removing duplicates
const allConversationMessages = selectedConversation
  ? [
      ...previousMessages.map(msg => ({
        id: msg.id || msg._id,
        sender: msg.sender,
        receiver: msg.receiver,
        message: msg.message,
        timestamp: msg.timestamp,
        source: 'api'
      })),
      ...currentConversationMessages
        .filter(msg => msg.status !== 'pending') // Exclude pending messages
        .map(msg => ({
          id: msg.id,
          sender: msg.sender === "me" ? userId : msg.sender,
          receiver: msg.data?.user_id || msg.data?.receiver,
          message: msg.text || msg.data?.message,
          timestamp: msg.timestamp || msg.data?.timestamp || Date.now(),
          source: 'websocket',
          status: msg.status
        }))
    ]
    .filter((msg, index, array) => {
      // Remove duplicates based on ID
      const existingIndex = array.findIndex(m => m.id === msg.id);
      return existingIndex === index;
    })
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  : [];


  // Add this useEffect to debug the AllMessages component
useEffect(() => {

  
  // Log the actual messages for debugging
  if (selectedConversation) {
    console.log('   Current Conversation Messages Details:');
  }
}, [globalMessages, selectedConversation, currentConversationMessages, previousMessages, allConversationMessages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Handle conversation selection
  const handleSelectConversation = (conversationId, convoInfo) => {
    setSelectedConversation(conversationId);
    setTargetedConvo(convoInfo);
  };

  return (
    <div>
      <div className='bg-white p-6 mt-2'></div>

      <div className="flex h-[80vh] bg-white rounded-md border overflow-hidden">
        <div className="w-[30%] border-r border-gray-300">
          <LeftPannel 
            setSelectedConversation={handleSelectConversation} 
            setConversationInfo={setConversationInfo}
            setTargetedConvo={setTargetedConvo}
            connected={connected}
            messages={globalMessages}
          />
        </div>

        <div className="w-[70%] flex flex-col bg-[#FAFAFA]">
          {selectedConversation ? (
            <>
              <div className="flex items-center justify-between border-b px-5 py-3 bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  <Avatar src={targetedConvo?.image} />
                  <div>
                    <div className="text-[16px] font-semibold">{targetedConvo.name || conversationInfo.name}</div>
                    <div className="text-xs text-gray-500">{targetedConvo.email || conversationInfo.email || "N/A"}</div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{conversationInfo.time}</span>
              </div>

<div className="flex-1 flex flex-col gap-4 overflow-y-auto px-5 py-4 bg-[#F7F7F7]">
  {allConversationMessages
    .filter((msg) => msg.status !== 'pending') // exclude pending messages
    .map((msg, index) => {
      const isMe = msg.sender === customerId;
      return (
        <div
          key={msg.id || `${msg.timestamp}-${index}`}
          className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
        >
          {!isMe && (
            <Avatar
              size={35}
              src="https://as2.ftcdn.net/v2/jpg/03/83/25/83/1000_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg"
            />
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
            <div
              className={`text-[11px] mt-1 ${
                isMe ? "text-right text-gray-400" : "text-left text-gray-400"
              }`}
            >
              {formatTime(msg.timestamp)}
              {isMe && msg.status === "delivered" && (
                <span className="ml-2 text-blue-400">✓✓</span>
              )}
            </div>
          </div>
          {isMe && (
            <Avatar
              size={35}
              icon={<GoPersonFill className="text-white" />}
              className="bg-gray-400"
            />
          )}
        </div>
      );
    })}
  <div ref={messagesEndRef} />
</div>


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