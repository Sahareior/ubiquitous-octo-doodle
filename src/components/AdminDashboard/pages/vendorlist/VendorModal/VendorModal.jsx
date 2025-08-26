import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { LiaStarSolid } from "react-icons/lia";

const VendorModal = ({ isModalOpen, setIsModalOpen, vendorsData }) => {
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  console.log('this is ven', vendorsData)
  
  const handleOk = () => setIsModalOpen(false);
  const handleCancel = () => setIsModalOpen(false);

  return (
    <>
      {/* Customer Details Modal */}
      <Modal
        open={isModalOpen}
        title={
          <div className='px-12 py-9'>
            <p className='text-2xl popbold'>Vendor Details</p>
          </div>
        }
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={900}
      >
        <div className="bg-[#f9f8f6] rounded-md w-full max-w-3xl pb-10 mx-auto">
          {/* Content */}
          <div className="p-6 bg-white shadow-sm rounded mt-4">
            <h3 className="text-lg popbold text-gray-700 mb-4">Vendor</h3>

            <div className="grid grid-cols-3 gap-y-4 text-sm text-gray-700">
              <div>
                <p className="popmed text-[#666666]">Vendor Name</p>
                <p className="text-[#0F0F0F] flex popreg text-[16px] items-center gap-1">
                  {vendorsData?.vendor || "N/A"}
                </p>
              </div>
              <div>
                <p className="popmed text-[#666666]">Email</p>
                <p className="text-[#666666] popreg text-[16px]">
                  {vendorsData?.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="popmed text-[#666666]">Signup Date</p>
                <p className="text-gray-800 popreg text-[16px]">
                  {vendorsData?.signup_date || "N/A"}
                </p>
              </div>

              <div>
                <p className="popmed text-[#666666]">Vendor ID</p>
                <p className="text-[#0F0F0F] popreg text-[16px]">
                  {vendorsData?.id || "N/A"}
                </p>
              </div>
              <div>
                <p className="popmed text-[#666666]">Product</p>
                <p className="text-gray-800 popreg text-[16px]">
                  {vendorsData?.products || 0}
                </p>
              </div>
              <div>
                <p className="popmed text-[#666666]">Status</p>
                <p className={`popreg text-[16px] font-semibold ${
                  vendorsData?.status === "approved" ? "text-green-600" : "text-red-600"
                }`}>
                  {vendorsData?.status || "N/A"}
                </p>
              </div>

              <div>
                <p className="popmed text-[#666666]">Total Orders</p>
                <p className="text-gray-800 popreg text-[16px]">
                  {vendorsData?.orders || 0}
                </p>
              </div>
              <div>
                <p className="popmed text-[#666666]">Last Activity</p>
                <p className="text-gray-800 popreg text-[16px]">
                  {vendorsData?.last_activity || "No activity yet"}
                </p>
              </div>
              <div>
                <p className="popmed text-[#666666]">Rating</p>
                <button
                  className="text-yellow-600 flex items-center gap-1 underline font-medium"
                  onClick={() => setIsOrderHistoryOpen(true)}
                >
                  <LiaStarSolid size={16} /> 
                  <span className='text-black text-sm popreg'>{vendorsData?.rating || 0}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default VendorModal;