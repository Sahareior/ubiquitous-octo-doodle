import React, { useState } from "react";
import { FaEdit } from "react-icons/fa";
import EditSection from "./editor/EditSection";
import { useGetPrivacyPolicyQuery } from "../../../../redux/slices/Apis/dashboardApis";
import { useGetTermsCustomersQuery } from "../../../../redux/slices/Apis/vendorsApi";

const TermsConditions = () => {
  const [clicked, setClicked] = useState(false)
    const { data: privacy,refetch } = useGetPrivacyPolicyQuery();
    const {data:updatedTerms} = useGetTermsCustomersQuery()
    
    console.log(updatedTerms,'this is updated terms')
    // Filter privacy content
    const IsPrivacy = privacy?.results?.filter(items => items.type === 'terms');

     const privacyContent = IsPrivacy?.[0]?.content || '';
  const lastUpdated = IsPrivacy?.[0]?.updated_at || 'N/A';

  return (
    <div className="w-full mx-auto bg-white rounded-lg shadow-md p-6 mt-6">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-4 mb-4">
        <div>
          <h2 className="text-lg popbold text-gray-800">
            Terms & Conditions Document
          </h2>
          <p className="text-sm popreg text-gray-500 mt-1">
            Manage your platform’s terms and conditions that govern user interactions.
          </p>
        </div>
        <div className="text-sm text-gray-500 text-right">
          <p className="text-xs text-[#6B7280] popreg">Last updated</p>
          <p className="popmed">July 18, 2025</p>
        </div>
      </div>

      {/* Display Settings */}
      {/* <div className="mb-6 bg-[#F9FAFB] p-5">
        <p className="popmed text-[#111827] mb-2">Display Settings</p>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm popreg text-gray-700">
            <input type="checkbox" className="accent-[#CBA135] " />
            Show on Registration
          </label>
          <label className="flex items-center gap-2 popreg text-sm text-gray-700">
            <input type="checkbox" className="accent-[#CBA135]" />
            Show on Vendor Onboarding
          </label>
        </div>
      </div> */}

      {/* Content */}
      <div className="relative p-5">
        {/* Edit Icon */}
        <button onClick={()=> setClicked(state => !state)} className="absolute right-5 -top-3 text-yellow-600 hover:text-yellow-700">
          <FaEdit size={22}/>
        </button>

      {clicked ? (
        <EditSection type='terms' data={privacyContent} />
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
    </div>
  );
};

export default TermsConditions;
