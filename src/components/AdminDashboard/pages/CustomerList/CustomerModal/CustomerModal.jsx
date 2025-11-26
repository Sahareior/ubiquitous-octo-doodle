import React, { useState } from 'react';
import { Button, Modal, Tag } from 'antd';
import OrderHistory from './OrderHistory';
import { useGetAllUsersQuery } from '../../../../../redux/slices/Apis/dashboardApis';

const CustomerModal = ({ isModalOpen, setIsModalOpen, selectedCustomer }) => {
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);



  const handleOk = () => setIsModalOpen(false);
  const handleCancel = () => setIsModalOpen(false);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate last activity text
  const getLastActivityText = (lastActivity) => {
    if (!lastActivity || lastActivity === '—') return 'No activity yet';
    
    // If it's a date string, calculate time ago
    if (typeof lastActivity === 'string' && lastActivity.includes('-')) {
      const activityDate = new Date(lastActivity);
      const now = new Date();
      const diffTime = Math.abs(now - activityDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      return `${Math.ceil(diffDays / 30)} months ago`;
    }
    
    return lastActivity;
  };

  return (
    <>
      {/* Customer Details Modal */}
      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={900}
      >
        <div className="bg-[#f9f8f6] rounded-md pb-12 pt-5 w-full border-[#E5E7EB] p-4 mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center border-b-2 border-[#E5E7EB] px-4 pb-5">
            <h2 className="text-2xl popbold text-gray-900">Customer Details</h2>
          </div>

          {/* Content */}
          <div className="p-6 bg-white shadow-sm rounded mt-4">
            <h3 className="text-lg popbold popmed mb-4">Customer Information</h3>

            <div className="grid grid-cols-3 gap-y-4 text-sm text-gray-700">
              <div>
                <p className="text-[#666666] popmed">Customer Name</p>
                <p className="text-gray-800 flex items-center gap-1">
                  <span className={`text-${selectedCustomer?.is_active ? 'green' : 'red'}-500 text-lg`}>●</span> 
                  {selectedCustomer?.customer_name || selectedCustomer?.customer || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[#666666] popmed">Email</p>
                <p className="text-gray-800">{selectedCustomer?.customer_email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[#666666] popmed">Signup Date</p>
                <p className="text-gray-800">{formatDate(selectedCustomer?.signup_date || selectedCustomer?.signupDate)}</p>
              </div>

              <div>
                <p className="text-[#666666] popmed">Customer ID</p>
                <p className="text-blue-600">{selectedCustomer?.id || selectedCustomer?.user_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[#666666] popmed">Last activity</p>
                <p className="text-gray-800">{getLastActivityText(selectedCustomer?.last_activity || selectedCustomer?.lastActivity)}</p>
              </div>
              <div>
                <p className="text-[#666666] popmed">Status</p>
                <p className={selectedCustomer?.is_active ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {selectedCustomer?.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>

              <div>
                <p className="text-[#666666] popmed">Total Orders</p>
                <p className="text-gray-800">{selectedCustomer?.total_orders || 0}</p>
              </div>
              <div>
                <p className="text-[#666666] popmed">Total Spend</p>
                <p className="text-gray-800">{formatCurrency(selectedCustomer?.total_spend)}</p>
              </div>
              <div>
                <p className="text-[#666666] popmed">Payment Status</p>
                <Tag color={selectedCustomer?.payment_status === 'Paid' ? 'green' : 'default'}>
                  {selectedCustomer?.payment_status || 'N/A'}
                </Tag>
              </div>
            </div>

            {/* Order History Button */}
            <div className="mt-6 text-center">
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                onClick={() => setIsOrderHistoryOpen(true)}
              >
                View Order History
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Order History Modal */}
      <Modal
        open={isOrderHistoryOpen}
        onCancel={() => setIsOrderHistoryOpen(false)}
        footer={null}
        width={800}
      >
        <OrderHistory customerId={selectedCustomer?.id || selectedCustomer?.user_id} />
      </Modal>
    </>
  );
};

export default CustomerModal;