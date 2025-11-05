import { Switch } from 'antd';
import React, { useState, useEffect } from 'react';
import { FaLock } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';
import EditSection from './editor/EditSection';
import { useGetPrivacyPolicyQuery } from '../../../../redux/slices/Apis/dashboardApis';
import { useGetPrivacyCustomersQuery } from '../../../../redux/slices/Apis/vendorsApi';

const PrivacyPolicySettings = () => {
  const [clicked, setClicked] = useState(false);
  const { data: privacy } = useGetPrivacyPolicyQuery();
  
  const {data:updatedPrivacy} = useGetPrivacyCustomersQuery()
  const IsPrivacy = privacy?.results?.filter(items => items.type === 'privacy');
  

  console.log(updatedPrivacy,'this is updated privacy')
  
  const privacyContent = IsPrivacy?.[0]?.content || '';
  const lastUpdated = IsPrivacy?.[0]?.updated_at || 'N/A';

  

  const onChange = (checked) => {
  
  };

  return (
    <div className="bg-[#FAF8F2] shadow rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex bg-white p-5 shadow-sm items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <FaLock className="text-yellow-500" />
          Privacy Policy Settings
        </div>
        <button 
          onClick={() => setClicked((state) => !state)} 
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
        >
          <FiEdit />
          Edit Policy
        </button>
      </div>

   

      {/* Policy Content */}
      {clicked ? (
        <EditSection type='privacy' data={privacyContent} />
      ) : (
        <div className="bg-white border rounded p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="font-medium">Privacy Policy Content</p>
            <p className="text-sm text-gray-500">Last updated: {new Date(lastUpdated).toLocaleDateString()}</p>
          </div>
          <div className="h-[0.7px] bg-black w-full my-3" />
          <div className="space-y-4 text-sm text-gray-700">
            {/* Dynamically render content */}
            <div>
              <p className="font-semibold">1. Introduction</p>
                   <div
          dangerouslySetInnerHTML={{ __html: privacyContent }}
        />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyPolicySettings;
