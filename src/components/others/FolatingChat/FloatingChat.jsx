import { useState, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import './Floating.css';
import socket from '../../utils/socket';
import { useDispatch } from 'react-redux';
import { addMessage } from '../../../redux/slices/customerSlice';
// import socket from '../../../utils/socket'; // <-- Same socket file used in VendorMessages

const MAIN_ADMIN_ID = "1"; // Target user ID

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([
    { text: "Hi there! 👋", sender: "bot" },
    { text: "How can I help you today?", sender: "bot" }
  ]);

  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Get logged-in user ID
    const customerData = JSON.parse(localStorage.getItem("customerId"));
    if (customerData?.user?.id) {
      setCurrentUserId(String(customerData.user.id));

      // Register user in socket
      const currentUser = {
        uid: String(customerData.user.id),
        name: customerData.user.first_name,
        email: customerData.user.email,
        isActive: true
      };
      socket.emit("addUser", currentUser);
    }

    // Listen for messages from admin
    socket.on("getMessage", (data) => {
      if (String(data.senderId) === MAIN_ADMIN_ID) {
        setMessages((prev) => [...prev, { text: data.text, sender: "bot" }]);
      }
    });

    return () => {
      socket.off("getMessage");
    };
  }, []);

 const handleSend = () => {
    if (!message.trim() || !currentUserId) return;

    const msgData = {
      senderId: String(currentUserId),
      receiverId: MAIN_ADMIN_ID,
      text: message,
      time: new Date().toLocaleTimeString()
    };

    // Add to local state immediately
    setMessages((prev) => [...prev, { text: message, sender: "user" }]);
    
    // ALSO add to Redux store
    dispatch(addMessage(msgData));

    // Send to socket
    socket.emit("sendMessage", msgData);

    setMessage('');
  };

  return (
    <>
      <div className="floating-chat-button w-56" onClick={() => setIsOpen(!isOpen)}>
        <FaRobot className="floating-chat-button-icon" size={20} />
        <span className='text-[#CBA135]'>Chat Assistant</span>
      </div>

      <div className={`floating-chat-window ${isOpen ? '' : 'hidden'}`}>
        <div className="chat-header">
          <span>Support</span>
          <FaTimes onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }} />
        </div>

        <div className="chat-body">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>

        <div className="chat-footer flex gap-10 items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="chat-input"
          />
          <button onClick={handleSend} className="send-button">
            <FaPaperPlane size={12} />
          </button>
        </div>
      </div>
    </>
  );
};

export default FloatingChat;
