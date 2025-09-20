import { Switch } from 'antd';
import React, { useState, useEffect } from 'react';
import { FaLock } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';
import EditSection from './editor/EditSection';
import { useGetPrivacyPolicyQuery } from '../../../../redux/slices/Apis/dashboardApis';

const PrivacyPolicySettings = () => {
  const [clicked, setClicked] = useState(false);
  const { data: privacy } = useGetPrivacyPolicyQuery();
  

  const IsPrivacy = privacy?.results?.filter(items => items.type === 'privacy');
  
  
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

      {/* Toggle List */}
      <div className="space-y-4 bg-white p-5 shadow-sm">
        <div className="flex justify-between items-center border-b pb-2">
          <div>
            <p className="font-medium">Registration Page</p>
            <p className="text-sm text-gray-500">Show privacy policy link on user registration</p>
          </div>
          <Switch defaultChecked onChange={onChange} />
        </div>

        <div className="flex justify-between items-center border-b pb-2">
          <div>
            <p className="font-medium">Checkout Page</p>
            <p className="text-sm text-gray-500">Display privacy policy during checkout process</p>
          </div>
          <Switch defaultChecked onChange={onChange} />
        </div>

        <div className="flex justify-between items-center border-b pb-2">
          <div>
            <p className="font-medium">Vendor Signup Form</p>
            <p className="text-sm text-gray-500">Include privacy policy in vendor registration</p>
          </div>
          <Switch defaultChecked onChange={onChange} />
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">Require Acceptance</p>
            <p className="text-sm text-gray-500">Users must accept privacy policy before account creation</p>
          </div>
          <Switch defaultChecked onChange={onChange} />
        </div>
      </div>

      {/* Policy Content */}
      {clicked ? (
        <EditSection type='privacy' data={privacyContent} />
      ) : (
        <div className="bg-[#F9FAFB] border rounded p-4">
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
