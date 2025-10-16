import React, { useEffect, useState, useRef } from "react";
import { Avatar, Badge, Tag } from "antd";
import { useGetAllConversationsidQuery } from "../../../../redux/slices/Apis/dashboardApis";
import { useLazyGetMessagesByIdQuery } from "../../../../redux/slices/Apis/customersApi";

const LeftPannel = ({ 
  setSelectedConversation, 
  selectedConversation, 
  setTargetedConvo, 
  messages,
  sentMessages 
}) => {
  const { data = [], refetch, isLoading } = useGetAllConversationsidQuery();
  const user = JSON.parse(localStorage.getItem("customerId"));
  
  const [getMessagesById] = useLazyGetMessagesByIdQuery();
  
  // Track unread conversations
  const [unread, setUnread] = useState({});
  // Track newly joined users
  const [newUsers, setNewUsers] = useState({});
  // Track unreplied conversations
  const [unrepliedConvos, setUnrepliedConvos] = useState({});

  // Use ref for previous data to avoid re-renders
  const previousDataRef = useRef([]);
  const isFirstRender = useRef(true);

  // Fetch unreplied conversations - FIXED: Only run when data changes
  useEffect(() => {
    if (!data || data.length === 0) return;

    const fetchConvo = async () => {
      try {
        const conversationById = await Promise.all(
          data.map(convo => getMessagesById(convo.id).unwrap())
        );

        // Create unreplied conversations map based on LAST MESSAGE
        const unrepliedMap = {};
        conversationById.forEach((convo, index) => {
          const conversationId = data[index]?.id;
          if (conversationId && convo.results && convo.results.length > 0) {
            const lastMessage = convo.results[convo.results.length - 1];
            const isUnreplied = lastMessage.sender !== 1;
            unrepliedMap[conversationId] = isUnreplied;
          } else {
            unrepliedMap[conversationId] = true;
          }
        });

        setUnrepliedConvos(unrepliedMap);
      } catch (err) {
        console.log(err);
      }
    };

    fetchConvo();
  }, [data]); // Removed getMessagesById from dependencies since it's stable

  const filtteredData = data?.filter((item) => item.id !== user.user.id) || [];

  // Detect new conversations - FIXED: Using ref to avoid state updates
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousDataRef.current = data;
      return;
    }

    if (data.length > previousDataRef.current.length) {
      const newConversations = data.filter(conv => 
        !previousDataRef.current.some(prevConv => prevConv.id === conv.id)
      );
      
      if (newConversations.length > 0) {
        newConversations.forEach(conv => {
          setNewUsers(prev => ({ ...prev, [conv.id]: true }));
          setUnrepliedConvos(prev => ({ ...prev, [conv.id]: true }));
        });
      }
    }
    
    // Update ref without causing re-render
    previousDataRef.current = data;
  }, [data]);

  // Handle new messages and detect new users - FIXED: Added proper dependencies
  useEffect(() => {
    if (!messages || messages?.length === 0) return;

    const latestMsg = messages[messages?.length - 1];
    const senderId = latestMsg?.data?.sender;
    if (!senderId) return;

    // Check if this sender exists in our conversations
    const senderExists = filtteredData.some(conv => conv.id === senderId);
    
    if (!senderExists) {
      // New user - trigger refetch to get updated conversation list
      refetch();
    } else {
      // Existing user - mark as unread if not selected
      if (senderId !== selectedConversation) {
        setUnread((prev) => ({ ...prev, [senderId]: true }));
      }
      
      // Update unreplied status based on last message sender
      if (latestMsg?.data?.sender !== 1) {
        setUnrepliedConvos(prev => ({ ...prev, [senderId]: true }));
      } else {
        setUnrepliedConvos(prev => ({ ...prev, [senderId]: false }));
      }
    }
  }, [messages, selectedConversation, filtteredData, refetch]);

  // Handle sent messages - FIXED: Simplified
  useEffect(() => {
    if (!sentMessages || sentMessages.length === 0) return;

    const latestSentMsg = sentMessages[sentMessages.length - 1];
    
    if (latestSentMsg?.sender === 1 && selectedConversation) {
      setUnrepliedConvos(prev => ({
        ...prev,
        [selectedConversation]: false
      }));
      
      setUnread(prev => {
        const updated = { ...prev };
        delete updated[selectedConversation];
        return updated;
      });
    }
  }, [sentMessages, selectedConversation]);

  // Auto-refresh conversations - FIXED: Added cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch]);

  const displayData = filtteredData || [];

  // Generate initials from name for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const nameToColor = (name) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-orange-500', 'bg-indigo-500',
      'bg-teal-500', 'bg-cyan-500', 'bg-amber-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation.id);
    setTargetedConvo({
      name: conversation.name,
      image: conversation.user_image,
      email: conversation.email,
    });

    setUnread((prev) => {
      const updated = { ...prev };
      delete updated[conversation.id];
      return updated;
    });
    
    setNewUsers((prev) => {
      const updated = { ...prev };
      delete updated[conversation.id];
      return updated;
    });
    
    setUnrepliedConvos(prev => ({
      ...prev,
      [conversation.id]: false
    }));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-3">
        {/* Refresh indicator */}
        {isLoading && (
          <div className="text-center py-2">
            <div className="inline-flex items-center gap-2 text-sm text-blue-600">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating conversations...
            </div>
          </div>
        )}
        
        <div className="overflow-y-auto max-h-[75vh] pr-2 custom-scrollbar">
          {displayData.map((conversation) => {
            const isUnread = unread[conversation.id];
            const isNewUser = newUsers[conversation.id];
            const isUnreplied = unrepliedConvos[conversation.id];
            const isSelected = selectedConversation === conversation.id;

            return (
              <div
                key={conversation.id}
                className={`p-4 rounded-xl transition-all mt-2 duration-300 cursor-pointer border-2 ${
                  isSelected
                    ? "bg-blue-50 border-blue-400 shadow-lg"
                    : isUnreplied 
                    ? "bg-red-50 border-red-200"
                    : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-md"
                }`}
                onClick={() => handleConversationClick(conversation)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar with generated initials */}
                    <div className="relative flex-shrink-0">
                      <div className={`flex items-center justify-center h-12 w-12 rounded-full ${nameToColor(conversation.name)} text-white font-semibold text-lg`}>
                        {getInitials(conversation.name)}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 truncate">
                          {conversation.name}
                        </span>
                        
                        {/* Badge for unreplied conversations */}
                        {isUnreplied && !isSelected && (
                          <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
                            Needs Reply
                          </span>
                        )}
                        
                        {/* Badge for new messages */}
                        {isUnread && !isNewUser && !isUnreplied && (
                          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                            New Message
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 truncate">
                        {conversation.email}
                      </span>
                    </div>
                  </div>

                  {/* Selected Indicator and Unreplied Badge */}
                  <div className="flex items-center gap-2">
                    {/* Unreplied indicator dot */}
                    {isUnreplied && !isSelected && (
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                    
                    {isSelected && (
                      <div className="text-blue-500 ml-2 animate-fade-in">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {data.length === 0 && (
            <div className="text-center py-12 px-4 rounded-xl bg-gray-50 border border-dashed border-gray-200">
              <div className="mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-gray-600 text-lg font-semibold mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                New conversations will appear here automatically
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftPannel;