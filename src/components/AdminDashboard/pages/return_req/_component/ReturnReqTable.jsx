import React, { useState } from 'react';
import { Table, Select, Button, Modal, Image, Tag } from 'antd';
import { IoEyeOutline, IoCloseOutline } from 'react-icons/io5';
import { RiArrowDropDownLine } from 'react-icons/ri';
import { useGetRequestReturnsQuery, useReturnApproveMutation } from '../../../../../redux/slices/Apis/dashboardApis';
import Swal from 'sweetalert2';

const { Option } = Select;

const ReturnReqTable = () => {
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const { data: returnReq, isLoading,refetch } = useGetRequestReturnsQuery();


    const [returnApprove] = useReturnApproveMutation()
  
const handleApprove = async (data) => {
  const payload = {
    order_item: data.orderItem,
    uploaded_images: data.images.map(img => img.image), // just the URLs
    description: data.description
  };

  Swal.fire({
    title: "Are you sure?",
    text: "You are about to approve this return request.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#16a34a", // green
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Approve it!"
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await returnApprove({ id: data.id, data: payload });
        refetch();

        Swal.fire({
          title: "Approved!",
          text: "The return request has been approved successfully.",
          icon: "success",
          confirmButtonColor: "#16a34a"
        });

        console.log("Approve response:", res);
      } catch (error) {
        console.error("Approve failed:", error);

        Swal.fire({
          title: "Error!",
          text: "Something went wrong while approving the request.",
          icon: "error",
          confirmButtonColor: "#d33"
        });
      }
    }
  });
};



  // Transform API data for table
  const dataSource = returnReq?.results?.map((request, index) => ({
    key: index + 1,
    id: request.id,
    orderItem: request.order_item,
    vendorName: `${request.vendor_details?.first_name || ''} ${request.vendor_details?.last_name || ''}`.trim(),
    vendorEmail: request.vendor_details?.email,
    description: request.description,
    status: request.status,
    createdAt: new Date(request.created_at).toLocaleDateString(),
    images: request.uploaded_images_list,
  })) || [];

  const showModal = (record) => {
    setSelectedRequest(record);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const columns = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
      render: text => <span className="text-[14px] font-medium">{text}</span>,
    },
    {
      title: 'Order Item',
      dataIndex: 'orderItem',
      key: 'orderItem',
      render: text => <span className="text-[14px]">#{text}</span>,
    },
    {
      title: 'Vendor',
      dataIndex: 'vendorName',
      key: 'vendorName',
      render: (text, record) => (
        <div>
          <div className="text-[14px] font-medium">{text}</div>
          <div className="text-[12px] text-gray-500">{record.vendorEmail}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag
          color={
            status === 'approved' ? 'green' : 
            status === 'pending' ? 'orange' : 'red'
          }
          className="rounded-md px-2 py-1 text-[12px] font-medium"
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Submitted On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: text => <span className="text-[14px]">{text}</span>,
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Button 
            type="text" 
            icon={<IoEyeOutline className="text-blue-500" size={18} />}
            onClick={() => showModal(record)}
            className="flex items-center justify-center"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      {/* Table Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Return Requests</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {dataSource.length} requests
          </span>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        pagination={{
          pageSize,
          total: dataSource.length,
          showTotal: (total, range) =>
            `Showing ${range[0]}-${range[1]} of ${total} requests`,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          position: ['bottomRight'],
        }}
      />
      
      {/* Request Detail Modal */}
<Modal
  open={isModalOpen}
  onCancel={handleCancel}
  footer={null} // We'll create a custom footer
  width={850}
  closeIcon={<IoCloseOutline size={26} className="text-gray-400 hover:text-gray-600" />}
  className="request-detail-modal"
>
  {selectedRequest && (
    <div className="p-9">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Return Request</h2>
          <p className="text-sm text-gray-500">Request ID: #{selectedRequest.id}</p>
        </div>
        <Tag
          color={
            selectedRequest.status === "approved"
              ? "green"
              : selectedRequest.status === "pending"
              ? "orange"
              : "red"
          }
          className="rounded-full px-4 py-1 text-[13px] font-medium tracking-wide"
        >
          {selectedRequest.status.toUpperCase()}
        </Tag>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Vendor */}
        <div className="bg-white border rounded-xl shadow-sm p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Vendor Information</h4>
          <p className="text-base font-medium text-gray-800">{selectedRequest.vendorName}</p>
          <p className="text-sm text-gray-500">{selectedRequest.vendorEmail}</p>
        </div>

        {/* Order */}
        <div className="bg-white border rounded-xl shadow-sm p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Order Information</h4>
          <p className="text-sm">
            Order Item: <span className="font-medium">#{selectedRequest.orderItem}</span>
          </p>
          <p className="text-sm">
            Submitted: <span className="font-medium">{selectedRequest.createdAt}</span>
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Return Description</h4>
        <div className="bg-white border rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-700 leading-relaxed">{selectedRequest.description}</p>
        </div>
      </div>

      {/* Uploaded Images */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Uploaded Images</h4>
        {selectedRequest.images && selectedRequest.images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {selectedRequest.images.map((image, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg shadow-sm border"
              >
                <Image
                  src={image.image}
                  alt={image.alt_text || `Return image ${index + 1}`}
                  className="object-cover h-40 w-full transition-transform duration-300 group-hover:scale-105"
                  preview={{
                    mask: (
                      <div className="flex items-center justify-center text-white text-sm">
                        View
                      </div>
                    ),
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-6 text-center bg-gray-50 rounded-lg">
            No images uploaded with this return request
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 border-t pt-4">
        <Button
          danger
        //   onClick={() => handleReject(selectedRequest.id)}
          className="px-6 py-2 rounded-lg"
        >
          Reject
        </Button>
        <Button
        onClick={()=> handleApprove(selectedRequest)}
          type="primary"
        //   onClick={() => handleAccept(selectedRequest.id)}
          className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700"
        >
          Accept
        </Button>
      </div>
    </div>
  )}
</Modal>
    </div>
  );
};

export default ReturnReqTable;