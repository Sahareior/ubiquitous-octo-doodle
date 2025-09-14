import React, { useEffect, useState } from "react";
import { Avatar } from "antd";
import { useGetAllConversationsidQuery } from "../../../../redux/slices/Apis/dashboardApis";

const LeftPannel = ({
  setSelectedConversation,
  selectedConversation,
  setTargetedConvo,
  lastSeen,
  unreadCounts,
}) => {
  const { data = [] } = useGetAllConversationsidQuery(); // default [] if no data
  const user = JSON.parse(localStorage.getItem("customerId"));

  // Local state for unread counts
  const [localUnreadCounts, setLocalUnreadCounts] = useState({});

  // Keep localUnreadCounts in sync with prop
  useEffect(() => {
    setLocalUnreadCounts(unreadCounts);
  }, [unreadCounts]);

  const filtteredData = data.filter((item) => item.id !== user.user.id);

  const handleClick = (conversation) => {
    setSelectedConversation(conversation.id);
    setTargetedConvo({
      name: conversation.name,
      image: conversation.user_image,
      email: conversation.email,
    });

    // Clear unread count for clicked conversation
    setLocalUnreadCounts((prev) => ({
      ...prev,
      [conversation.id]: 0,
    }));
  };

  return (
    <div className="p-4 space-y-3">
      <div className="border-r p-4 space-y-4">
        <div className="space-y-2 overflow-y-auto max-h-[75vh] pr-1">
          {filtteredData.map((conversation) => {
            const isOnline =
              lastSeen[conversation.id] &&
              Date.now() - lastSeen[conversation.id] < 60000;

            const unread = localUnreadCounts[conversation.id] || 0;

            return (
              <div
                key={conversation.id}
                className={`p-3 rounded hover:bg-gray-100 cursor-pointer border-b border-slate-100 ${
                  selectedConversation === conversation.id ? "bg-blue-50" : ""
                }`}
                onClick={() => handleClick(conversation)}
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex gap-3 items-center">
                    <Avatar
                      src={
                        conversation.user_image ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                    />
                    <div className="flex flex-col">
                      <span className="popbold text-gray-800 flex items-center gap-2">
                        {conversation.name}
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isOnline ? "bg-green-500" : "bg-gray-400"
                          } inline-block`}
                          title={isOnline ? "Online" : "Offline"}
                        ></span>
                      </span>
                      <span className="text-xs text-gray-500">
                        {conversation.email}
                      </span>
                      {unread > 0 && (
                        <span className="text-xs text-white bg-red-500 px-2 py-0.5 rounded-full mt-1">
                          {unread} new
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {data.length === 0 && (
            <p className="text-center text-gray-500 text-sm">
              No conversations
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftPannel;
