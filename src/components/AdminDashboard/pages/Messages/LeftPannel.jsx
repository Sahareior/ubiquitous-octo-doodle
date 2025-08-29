import React, { useEffect, useState } from "react";
import { useLazyGetMessagesByIdQuery, useLazyGetUserByIdQuery } from "../../../../redux/slices/Apis/customersApi";

const LeftPannel = () => {
  const [conversations, setConversations] = useState([]);
  const [getMessagesById] = useLazyGetMessagesByIdQuery();
  const [getUserById] = useLazyGetUserByIdQuery();

  useEffect(() => {
    const fetchMessages = async () => {
      const ids = Array.from({ length: 20 }, (_, i) => i + 2); // [2..21]
      const results = [];

      for (let id of ids) {
        try {
          // fetch messages
          const res = await getMessagesById(id).unwrap(); 
          if (res?.count > 0) {
            // fetch user info (for example, using id as userId)
            const userRes = await getUserById(id).unwrap(); 

            results.push({
              id,
              user: userRes,                // store user info
              conversations: res.results,   // store messages
            });
          }
        } catch (error) {
          console.error(`Error fetching messages or user for id ${id}`, error);
        }
      }

      setConversations(results);
    };

    fetchMessages();
  }, [getMessagesById, getUserById]);

  const handleClick = (id) => {
    console.log("Clicked conversation id:", id);
  };

  return (
    <div className="p-4 space-y-3">
      {conversations.length === 0 && (
        <p className="text-gray-500">No conversations found</p>
      )}
{conversations.map((c) => (
  <div
    key={c.id}
    onClick={() => handleClick(c.id)}
    className="cursor-pointer rounded-xl border border-gray-300 shadow-md p-4 hover:bg-gray-100 transition flex items-center space-x-3"
  >
    {c.user.profile_image && (
      <img 
        src={c.user.profile_image} 
        alt={c.user.first_name} 
        className="w-10 h-10 rounded-full object-cover"
      />
    )}
    <div>
      <h3 className="font-semibold text-lg">
        {c.user.first_name} {c.user.last_name} ({c.user.email})
      </h3>
      <p className={`text-sm ${c.user.is_online ? 'text-green-500' : 'text-red-500'}`}>
        {c.user.is_online ? 'Online' : 'Offline'}
      </p>
      <p className="text-sm text-gray-600">
        {c.conversations.length} messages
      </p>
    </div>
  </div>
))}

    </div>
  );
};

export default LeftPannel;
