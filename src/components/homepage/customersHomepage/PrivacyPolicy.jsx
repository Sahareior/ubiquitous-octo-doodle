import React, { useEffect } from 'react';
import { useGetPrivacyPolicyQuery } from '../../../redux/slices/Apis/dashboardApis';

const PrivacyPolicy = () => {
  const { data: privacy } = useGetPrivacyPolicyQuery();
  

    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
  // Filter privacy content
  const IsPrivacy = privacy?.results?.filter(items => items.type === 'privacy');
  const privacyContent = IsPrivacy?.[0]?.content || '';
  const lastUpdated = IsPrivacy?.[0]?.updated_at || 'N/A';

  return (
    <div className="bg-[#FAF8F2] min-h-screen">
      <div className='bg-[#696966] py-28'>
        <h1 className="text-2xl md:text-5xl popbold font-semibold text-white text-center mb-4">
          Privacy Policy
        </h1>
      </div>

      <div className="w-full mx-auto bg-white rounded-lg shadow-md p-6 md:p-20">
        <p className="text-sm text-gray-500 text-right mb-4">
          Last updated: {new Date(lastUpdated).toLocaleDateString()}
        </p>

        <div 
          className="prose max-w-none text-gray-800" 
          dangerouslySetInnerHTML={{ __html: privacyContent }}
        />
      </div>
    </div>
  );
};

export default PrivacyPolicy;
