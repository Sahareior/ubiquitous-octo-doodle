import React, { useEffect, useState } from "react";
import { Avatar, Badge, Tag } from "antd";
import { useGetAllConversationsidQuery } from "../../../../redux/slices/Apis/dashboardApis";

import { useLazyGetMessagesByIdQuery } from "../../../../redux/slices/Apis/customersApi";

const LeftPannel = ({ setSelectedConversation, selectedConversation, setTargetedConvo, messages }) => {
  const { data = [], refetch } = useGetAllConversationsidQuery();
  const user = JSON.parse(localStorage.getItem("customerId"));
  
  const [getMessagesById] = useLazyGetMessagesByIdQuery();
  
  // Track unread conversations
  const [unread, setUnread] = useState({});
  // Track newly joined users
  const [newUsers, setNewUsers] = useState({});
  // Track unreplied conversations
  const [unrepliedConvos, setUnrepliedConvos] = useState({});


  useEffect(() => {
    if (!data || data.length === 0) return;

    const fetchConvo = async () => {
      try {
        const conversationById = await Promise.all(
          data.map(convo => getMessagesById(convo.id).unwrap())
        );

        console.log(conversationById);

        // Create unreplied conversations map
        const unrepliedMap = {};
        conversationById.forEach((convo, index) => {
          const conversationId = data[index]?.id;
          if (conversationId) {
            // Check if admin (sender ID 3) has NOT replied
            const isUnreplied = !convo.results.some(msg => msg.sender === 3);
            unrepliedMap[conversationId] = isUnreplied;
          }
        });

        setUnrepliedConvos(unrepliedMap);
      } catch (err) {
        console.log(err);
      }
    };

    fetchConvo();
  }, [data]);

  // filter out current user
  const filtteredData = data?.filter((item) => item.id !== user.user.id) || [];

  useEffect(() => {
    if (!messages || messages?.length === 0) return;

    const latestMsg = messages[messages?.length - 1];
    const senderId = latestMsg?.data?.sender;
    if (!senderId) return;

    const existingIds = new Set(filtteredData?.map((c) => c.id));

    if (!existingIds?.has(senderId)) {
      setNewUsers((prev) => ({ ...prev, [senderId]: true }));
      setUnrepliedConvos((prev) => ({ ...prev, [senderId]: true })); // Mark as unreplied for new users
      refetch();
    } else {
      if (senderId !== selectedConversation) {
        setUnread((prev) => ({ ...prev, [senderId]: true }));
        // If admin hasn't replied yet, keep it as unreplied
        if (!unrepliedConvos[senderId]) {
          setUnrepliedConvos((prev) => ({ ...prev, [senderId]: true }));
        }
      }
    }
  }, [messages, refetch]);

  const sortedData = [...filtteredData]?.sort((a, b) => {
    // Priority 1: New users
    const aNew = newUsers[a.id] ? 1 : 0;
    const bNew = newUsers[b.id] ? 1 : 0;
    if (aNew !== bNew) return bNew - aNew;

    // Priority 2: Unreplied conversations
    const aUnreplied = unrepliedConvos[a.id] ? 1 : 0;
    const bUnreplied = unrepliedConvos[b.id] ? 1 : 0;
    if (aUnreplied !== bUnreplied) return bUnreplied - aUnreplied;

    // Priority 3: Unread messages
    const aUnread = unread[a.id] ? 1 : 0;
    const bUnread = unread[b.id] ? 1 : 0;
    return bUnread - aUnread;
  }) || [];



  return (
    <div className="p-4 space-y-4">
      <div className="space-y-3">
        <div className="overflow-y-auto max-h-[75vh] pr-2 custom-scrollbar">
          {sortedData.map((conversation) => {
            const isUnread = unread[conversation.id];
            const isNewUser = newUsers[conversation.id];
            const isUnreplied = unrepliedConvos[conversation.id];
            const isSelected = selectedConversation === conversation.id;
            
            // Generate initials from name for avatar
            const getInitials = (name) => {
              return name
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
            };
            
            // Generate a color based on the name for consistent avatar background
            const nameToColor = (name) => {
              const colors = [
                'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
                'bg-pink-500', 'bg-orange-500', 'bg-indigo-500',
                'bg-teal-500', 'bg-cyan-500', 'bg-amber-500'
              ];
              const index = name.length % colors.length;
              return colors[index];
            };

            return (
              <div
                key={conversation.id}
                className={`p-4 rounded-xl transition-all mt-2 duration-300 cursor-pointer border-2 ${
                  isSelected
                    ? "bg-blue-50 border-blue-400 shadow-lg transform scale-[1.02]"
                    : isUnreplied 
                    ? "bg-red-50 border-red-200" // Highlight unreplied conversations
                    : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-md"
                }`}
                onClick={() => {
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
                  // Mark as replied when admin selects the conversation
                  setUnrepliedConvos((prev) => ({
                    ...prev,
                    [conversation.id]: false
                  }));
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar with generated initials */}
                    <div className="relative flex-shrink-0">
                      <div className={`flex items-center justify-center h-12 w-12 rounded-full ${nameToColor(conversation.name)} text-white font-semibold text-lg`}>
                        {getInitials(conversation.name)}
                      </div>
                      
                      {/* Status Indicators */}
                      {isNewUser && (
                        <span className="absolute -top-3 -right-[18rem]">
                          <div className="bg-gradient-to-r w-20 text-center from-blue-500 to-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                            New User
                          </div>
                        </span>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 truncate">
                          {conversation.name}
                        </span>
                        
                        {/* Badge for unreplied conversations */}
                        {isUnreplied && (
                          <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
                            Needs Reply
                          </span>
                        )}
                        
                        {/* Badge for new messages (only if not unreplied to avoid duplication) */}
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
                Start a conversation to connect with others
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftPannel;