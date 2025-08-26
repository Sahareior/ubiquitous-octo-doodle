import React, { useEffect, useState, useRef } from 'react';
import { Input, Select, Avatar, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, initSocket, setActiveChat } from '../../../../redux/slices/customerSlice';
import socket from '../../../utils/socket';


const { Option } = Select;

const VendorMessages = () => {
  const dispatch = useDispatch();
  const onlineUsers = useSelector((state) => state.customer.onlineUsers);
  const messages = useSelector((state) => state.customer.messages);
  const activeChat = useSelector((state) => state.customer.activeChat);

  const [selectedUser, setSelectedUser] = useState(null);
  const [reply, setReply] = useState('');
  const messagesEndRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  console.log(messages)

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUser]);

  useEffect(() => {
    // Get customer ID from localStorage
    const customerData = JSON.parse(localStorage.getItem("customerId"));
    if (customerData && customerData.user) {
      const userId = customerData.user.id;
      setCurrentUserId(userId);
      
      const currentUser = {
        uid: userId,
        name: customerData.user.first_name,
        email: customerData.user.email,
        isActive: true,
      };
      
      dispatch(initSocket(currentUser));
    }
    
    // Clean up on component unmount
    return () => {
      socket.off('getUsers');
      socket.off('getMessage');
    };
  }, [dispatch]);

  // Set active chat when selecting a user
  useEffect(() => {
    if (selectedUser) {
      dispatch(setActiveChat(selectedUser?.uid));
    }
  }, [selectedUser, dispatch]);

console.log(currentUserId,selectedUser?.uid,'ssaaa')

  const handleSend = () => {
    if (!selectedUser || !reply.trim() || !currentUserId) return;

    const msgData = {
      senderId: currentUserId,
      receiverId: selectedUser.uid,
      text: reply,
      time: new Date().toLocaleTimeString(),
    };

    // Add message to Redux for immediate UI update
    dispatch(addMessage(msgData));
    
    // Emit via socket
    socket.emit('sendMessage', msgData);
    
    setReply('');
  };

  // Filter messages for the selected conversation
  const filteredMessages = messages.filter(message => 
    currentUserId && (
      (message.senderId === selectedUser?.uid && message.receiverId === currentUserId) ||
      (message.receiverId === selectedUser?.uid && message.senderId === currentUserId)
    )
  );

  return (
    <div>
      <div className="bg-white p-6 mt-2">
        <div className="flex items-center gap-2">
          <input
            className="w-[30%] border border-gray-300 rounded-md px-4 py-1 focus:outline-none"
            placeholder="Search messages..."
          />
          <Select defaultValue="Role" className="w-[120px] ">
            <Option value="Customer">Customer</Option>
            <Option value="Seller">Seller</Option>
          </Select>
        </div>
      </div>

      <div className="flex h-[90vh] bg-white rounded-md border overflow-hidden">
        {/* Left Panel - Active Users */}
        <div className="w-[30%] border-r p-4 space-y-4">
          <div className="space-y-2 overflow-y-auto max-h-[75vh] pr-1">
            {onlineUsers.length === 0 && (
              <p className="text-gray-500 text-sm">No active users</p>
            )}

            {onlineUsers.map((user) => (
              <div
                key={user.uid}
                onClick={() => setSelectedUser(user)}
                className={`p-3 rounded cursor-pointer border-b border-slate-100 ${
                  selectedUser?.uid === user.uid ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex gap-3">
                    <Avatar src="https://as2.ftcdn.net/v2/jpg/03/83/25/83/1000_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg" />
                    <div>
                      <span className="popbold text-gray-800">{user.name || 'Unnamed'}</span>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Chat Detail */}
        <div className="w-[70%] flex flex-col justify-between p-5">
          {!selectedUser ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a user to start chatting
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex flex-col mb-3">
                <div className="flex items-center gap-3">
                  <Avatar src="https://as2.ftcdn.net/v2/jpg/03/83/25/83/1000_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg" />
                  <div>
                    <div className="text-[16px] popbold ">{selectedUser.name}</div>
                    <div className="text-xs popreg text-gray-500">{selectedUser.email}</div>
                  </div>
                </div>
                <div className="text-[20px] mt-5 popbold">Conversation</div>
                <p className="popreg text-xs text-[#666666]">Active now</p>
                <div className="h-[0.7px] w-full bg-slate-300 mt-6 px-0" />
              </div>

              {/* Conversation */}
              <div className="flex-1 overflow-y-auto mb-4 px-2">
                {filteredMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMessages.map((m, i) => (
                      <div
                        key={i}
                        className={`flex ${m.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                      >
                        {m.senderId !== currentUserId && (
                          <Avatar
                            size={40}
                            src="https://as2.ftcdn.net/v2/jpg/03/83/25/83/1000_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg"
                            className="mr-2"
                          />
                        )}
                        <div
                          className={`max-w-[70%] ${m.senderId === currentUserId ? 'bg-[#CBA135] text-white' : 'bg-[#ECECEC] text-[#0F0F0F]'} px-4 py-3 rounded-lg shadow-md`}
                        >
                          {m.text}
                          <p className={`text-xs mt-1 ${m.senderId === currentUserId ? 'text-right text-gray-200' : 'text-left text-gray-500'}`}>
                            {m.time}
                          </p>
                        </div>
                        {m.senderId === currentUserId && (
                          <Avatar
                            size={40}
                            src="https://as2.ftcdn.net/v2/jpg/03/83/25/83/1000_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg"
                            className="ml-2"
                          />
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Reply Box */}
              <div className="mt-5">
                <textarea
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none"
                  rows={3}
                  placeholder="Type your reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
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
                  onClick={handleSend}
                  className="mt-2 bg-yellow-500 hover:bg-yellow-600 border-none"
                  disabled={!reply.trim()}
                >
                  Send Reply
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorMessages;