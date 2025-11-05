import React, { useEffect } from 'react';
import { useGetTermsCustomersQuery } from '../../../redux/slices/Apis/vendorsApi';
import Breadcrumb from '../../others/Breadcrumb';

const TermsAndConditions = () => {
  const { data: updatedTerms, isLoading, isError } = useGetTermsCustomersQuery();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FAF8F2]">
        <div className="text-lg font-semibold text-gray-600">Loading Terms & Conditions...</div>
      </div>
    );
  }

  if (isError || !updatedTerms) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FAF8F2]">
        <div className="text-lg font-semibold text-red-600">Failed to load Terms & Conditions.</div>
      </div>
    );
  }

  const { content, updated_at, title } = updatedTerms;

  return (
    <div className="bg-[#FAF8F2] min-h-screen">
      {/* Breadcrumb */}
      <div className="pl-5">
        <Breadcrumb />
      </div>

      {/* Header Section */}
      <div className="bg-[#696966] py-28">
        <h1 className="text-2xl md:text-5xl popbold font-semibold text-white text-center mb-4">
          {title || 'Terms & Conditions'}
        </h1>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-12 lg:p-16 -mt-20 relative z-10 mb-16">
        <p className="text-sm text-gray-500 text-right mb-8 pb-4 border-b border-gray-200">
          Last updated: {updated_at ? new Date(updated_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'N/A'}
        </p>

     <div
  className="
    text-gray-800 leading-7
    [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-6 [&_h1]:mt-10 [&_h1]:pb-2 [&_h1]:border-b-2 [&_h1]:border-gray-200
    [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:pl-2 [&_h2]:border-l-4 [&_h2]:border-[#696966]
    [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-6 [&_h3]:mb-3
    [&_p]:mb-5 [&_p]:text-lg
    [&_strong]:text-gray-900 [&_strong]:font-semibold
    [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-5
    [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-5
    [&_li]:mb-2 [&_li]:text-lg [&_li]:leading-6
    [&_a]:text-[#696966] [&_a]:underline [&_a]:font-medium hover:[&_a]:text-[#4a4a48]
    [&_blockquote]:border-l-4 [&_blockquote]:border-[#696966] [&_blockquote]:bg-gray-50 [&_blockquote]:p-4 [&_blockquote]:my-6 [&_blockquote]:italic
    [&_.ql-ui]:hidden
  "
  dangerouslySetInnerHTML={{ __html: content }}
/>
      </div>
    </div>
  );
};

export default TermsAndConditions;