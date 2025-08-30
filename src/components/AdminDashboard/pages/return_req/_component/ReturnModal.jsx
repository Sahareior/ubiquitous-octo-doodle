import React, { useState } from 'react';
import { Modal, Image, Tag, Tabs, Button } from 'antd';
import { 
  IoCloseOutline, 
  IoPersonOutline, 
  IoDocumentTextOutline,
  IoImagesOutline,
  IoTimeOutline,
  IoCartOutline 
} from 'react-icons/io5';
import { useReturnApproveMutation } from '../../../../../redux/slices/Apis/dashboardApis';

const ReturnRequestModal = ({ isModalOpen, handleCancel, selectedRequest }) => {

  console.log(selectedRequest,'this is selected req')

  const [returnApprove] = useReturnApproveMutation()

  const handleApprove = async (data)=> {
    console.log(data,"a")
    // const res = await returnApprove({id: data.id, data})
  }

  // Tab items for organized content
  const tabItems = [
    {
      key: '1',
      label: (
        <div className="flex items-center gap-2">
          <IoDocumentTextOutline />
          <span>Request Details</span>
        </div>
      ),
      children: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <IoPersonOutline className="text-blue-600" size={18} />
                </div>
                <h4 className="text-sm font-semibold text-gray-700">Return Req Information</h4>
              </div>
              <div className="space-y-2 pl-10">
                <p className="text-sm">
                  <span className="font-medium text-gray-500">Name:</span>{' '}
                  <span className="font-semibold">{selectedRequest?.vendorName}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-500">Email:</span>{' '}
                  <span className="text-blue-600">{selectedRequest?.vendorEmail}</span>
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <IoCartOutline className="text-purple-600" size={18} />
                </div>
                <h4 className="text-sm font-semibold text-gray-700">Order Information</h4>
              </div>
              <div className="space-y-2 pl-10">
                <p className="text-sm">
                  <span className="font-medium text-gray-500">Order Item:</span>{' '}
                  <span className="font-semibold">#{selectedRequest?.orderItem}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-500">Submitted:</span>{' '}
                  <span className="font-semibold">{selectedRequest?.createdAt}</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <IoDocumentTextOutline className="text-amber-600" size={18} />
              </div>
              <h4 className="text-sm font-semibold text-gray-700">Return Description</h4>
            </div>
            <div className="pl-10">
              <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-amber-200">
                {selectedRequest?.description}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div className="flex items-center gap-2">
          <IoImagesOutline />
          <span>Uploaded Images</span>
        </div>
      ),
      children: (
        <div>
          {selectedRequest?.images && selectedRequest?.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedRequest?.images.map((image, index) => (
                <div key={index} className="group relative overflow-hidden rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-lg">
                  <Image
                    src={image.image}
                    alt={image.alt_text || `Return image ${index + 1}`}
                    className="object-cover h-40 w-full transition-transform duration-300 group-hover:scale-105"
                    preview={{
                      mask: (
                        <div className="flex items-center justify-center text-white text-sm bg-black bg-opacity-40 rounded-xl">
                          <span>Click to view</span>
                        </div>
                      )
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-xs text-white truncate">
                      {image.alt_text || `Image ${index + 1}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <IoImagesOutline className="text-gray-400" size={24} />
              </div>
              <p className="text-gray-500">No images uploaded with this return request</p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={900}
      closeIcon={
        <div className="p-1 rounded-full hover:bg-gray-100">
          <IoCloseOutline size={24} className="text-gray-500" />
        </div>
      }
      className="modern-modal"
      styles={{
        body: {
          padding: 0,
          borderRadius: '12px'
        }
      }}
    >
      {selectedRequest && (
        <div className="p-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 p-6 border-b border-gray-100">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Return Request Details
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                  ID: #{selectedRequest?.id}
                </span>
              </h3>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <IoTimeOutline size={14} />
                Submitted on {selectedRequest?.createdAt}
              </p>
            </div>
            <Tag
              color={
                selectedRequest?.status === 'approved' ? 'green' : 
                selectedRequest?.status === 'pending' ? 'orange' : 'red'
              }
              className="rounded-full px-3 py-1 text-xs font-semibold border-0 capitalize"
            >
              {selectedRequest?.status}
            </Tag>
          </div>
          
          {/* Content with Tabs */}
          <div className="p-6">
            <Tabs
              defaultActiveKey="1"
              items={tabItems}
              tabBarStyle={{ marginBottom: 24 }}
            />
          </div>
          
          {/* Footer Actions */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-lg">
            <Button 
              size="large" 
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              Close
            </Button>
            {selectedRequest?.status === 'pending' && (
              <>
                <Button 
                  type="primary" 
                  size="large" 
                  danger
                  className="flex items-center gap-2"
                >
                  Reject Request
                </Button>
<Button 
  onClick={() => {
    console.log("clicked approve");
    handleApprove(selectedRequest);
  }}
  type="primary" 
  size="large" 
  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
>
  Approve Request
</Button>

              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ReturnRequestModal;