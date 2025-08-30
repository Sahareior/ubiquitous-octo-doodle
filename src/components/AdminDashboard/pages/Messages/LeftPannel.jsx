import React from "react";
import { Avatar, Badge } from "antd"; // Badge for status indicator
import { useGetAllConversationsidQuery } from "../../../../redux/slices/Apis/dashboardApis";

const LeftPannel = ({ setSelectedConversation, selectedConversation, connected }) => {
  const { data = [] } = useGetAllConversationsidQuery(); // default [] if no data
  const user = JSON.parse(localStorage.getItem('customerId'));
  console.log(user.user.id,'this is user');

  return (
    <div className="p-4 space-y-3">
      <div className="border-r p-4 space-y-4">
        <div className="space-y-2 overflow-y-auto max-h-[75vh] pr-1">
          {data.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-3 rounded hover:bg-gray-100 cursor-pointer border-b border-slate-100 ${
                selectedConversation === conversation.id ? "bg-blue-50" : ""
              }`}
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex gap-3 items-center">
                  {/* Avatar with connection badge */}
    
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
                          connected ? "bg-green-500" : "bg-gray-400"
                        } inline-block`}
                        title={connected ? "Connected" : "Offline"}
                      ></span>
                    </span>
                    <span className="text-xs text-gray-500">{conversation.email}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {data.length === 0 && (
            <p className="text-center text-gray-500 text-sm">No conversations</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftPannel;
