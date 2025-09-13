import React, { useState } from 'react';
import { Table, Select, Popover, Button, Input, message, Divider, Tag } from 'antd';
import { RiArrowDropDownLine, RiEyeLine, RiBankCardLine, RiUserLine, RiMoneyDollarCircleLine } from 'react-icons/ri';
import { useGetAllPayoutsQuery, usePayoutApproveMutation } from '../../../../../redux/slices/Apis/dashboardApis';

const { Option } = Select;
const { TextArea } = Input;

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);


const PayoutTable = ({ payouts }) => {
  const [pageSize, setPageSize] = useState(10);
  const [payoutApprove] = usePayoutApproveMutation();
  const [currentPayout, setCurrentPayout] = useState(null);
  const [note, setNote] = useState('');
    const { data, refetch } = useGetAllPayoutsQuery();
  const [popoverVisible, setPopoverVisible] = useState(false);

const handleApprove = async (id) => {
  try {
    const data = {
      amount: currentPayout.amount,
      payment_method: currentPayout.payment_method,
      note: note
    };
    await payoutApprove({ id, data }).unwrap();
    refetch();
    setPopoverVisible(false);
    setNote("");

    MySwal.fire({
      title: "✅ Payout Approved",
      text: `The payout of $${currentPayout.amount} has been approved.`,
      icon: "success",
      confirmButtonColor: "#2563eb"
    });
  } catch (error) {
    MySwal.fire({
      title: "❌ Approval Failed",
      text: "Something went wrong. Please try again.",
      icon: "error",
      confirmButtonColor: "#dc2626"
    });
  }
};

const handleReject = async (id) => {
  try {
    const data = {
      amount: currentPayout.amount,
      payment_method: currentPayout.payment_method,
      note: note,
      status: "rejected"
    };
    await payoutApprove({ id, data }).unwrap();
    refetch();
    setPopoverVisible(false);
    setNote("");

    MySwal.fire({
      title: "⚠️ Payout Rejected",
      text: `The payout of $${currentPayout.amount} has been rejected.`,
      icon: "warning",
      confirmButtonColor: "#f97316"
    });
  } catch (error) {
    MySwal.fire({
      title: "❌ Rejection Failed",
      text: "Something went wrong. Please try again.",
      icon: "error",
      confirmButtonColor: "#dc2626"
    });
  }
};


const popoverContent = (record) => (
  <div className="p-5 w-96">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Payout Details</h3>
      <Tag
        color={
          record.status === "approved"
            ? "green"
            : record.status === "rejected"
            ? "red"
            : "orange"
        }
      >
        {record.status?.toUpperCase()}
      </Tag>
    </div>

    <Divider className="my-4" />

    <div className="space-y-4 mb-5">
      <div className="flex items-center">
        <div className="bg-blue-100 p-2 rounded-full mr-3">
          <RiUserLine className="text-blue-600 text-lg" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Vendor ID</p>
          <p className="font-medium text-gray-800">{record.vendor}</p>
        </div>
      </div>

      <div className="flex items-center">
        <div className="bg-green-100 p-2 rounded-full mr-3">
          <RiMoneyDollarCircleLine className="text-green-600 text-lg" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Amount</p>
          <p className="font-medium text-gray-800">${record.amount}</p>
        </div>
      </div>

      <div className="flex items-center">
        <div className="bg-purple-100 p-2 rounded-full mr-3">
          <RiBankCardLine className="text-purple-600 text-lg" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Payment Method</p>
          <p className="font-medium text-gray-800 capitalize">
            {record.payment_method}
          </p>
        </div>
      </div>

      {record.note && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-500">Existing Note</p>
          <p className="text-gray-700">{record.note}</p>
        </div>
      )}
    </div>

    <Divider className="my-4" />

    {record.status === "pending" && (
      <div className="flex space-x-3 justify-end">
        <Button
          onClick={() => setPopoverVisible(false)}
          className="border-gray-300 text-gray-600 hover:bg-gray-50 rounded-md px-4 py-2 transition-colors"
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleReject(record.id)}
          className="bg-red-500 hover:bg-red-600 text-white border-red-500 rounded-md px-4 py-2 transition-colors shadow-sm hover:shadow-md"
        >
          Reject
        </Button>
        <Button
          onClick={() => handleApprove(record.id)}
          type="primary"
          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 rounded-md px-4 py-2 transition-colors shadow-sm hover:shadow-md"
        >
          Approve
        </Button>
      </div>
    )}
  </div>
);



  // Transform API data for table
  const dataSource = payouts?.map((p, index) => ({
    key: index + 1,
    id: p.id,
    vendor: p.vendor,
    amount: p.amount,
    payment_method: p.payment_method,
    note: p.note,
    status: p.status,
    created_at: p.created_at,
  })) || [];

  const columns = [
    {
      title: 'Order',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <span className="text-[16px] font-medium text-gray-700">{text}</span>,
    },
    {
      title: 'Vendor ID',
      dataIndex: 'vendor',
      key: 'vendor',
      render: (text) => <span className="text-[16px] text-gray-600">{text}</span>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text) => <span className="text-[16px] font-medium text-green-600">${text}</span>,
    },
    {
      title: 'Payment Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (text) => <span className="text-[16px] text-gray-600 capitalize">{text}</span>,
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      render: (text) => <span className="text-[16px] text-gray-500">{text || '-'}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span
          className={`px-3 py-1.5 rounded-full text-[14px] font-medium ${
            status === 'approved'
              ? 'bg-green-100 text-green-700'
              : status === 'rejected'
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </span>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <span className="text-[16px] text-gray-500">
          {new Date(date).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popover
          content={popoverContent(record)}
          trigger="click"
          visible={popoverVisible && currentPayout?.id === record.id}
          onVisibleChange={(visible) => {
            setPopoverVisible(visible);
            if (visible) {
              setCurrentPayout(record);
            } else {
              setCurrentPayout(null);
              setNote('');
            }
          }}
          placement="left"
          overlayClassName="payout-popover"
          overlayStyle={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)' }}
        >
          <Button
            icon={<RiEyeLine className="text-blue-600" />}
            className="flex items-center justify-center border-none bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            size="middle"
          />
        </Popover>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 relative">
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={{
          pageSize,
          total: dataSource.length,
          showTotal: (total, range) =>
            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          onShowSizeChange: (_, size) => setPageSize(size),
          position: ['bottomRight'],
        }}
      />
    </div>
  );
};

export default PayoutTable;

<style jsx>{`
  :global(.payout-popover .ant-popover-inner) {
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  }
  
  :global(.payout-popover .ant-popover-arrow) {
    display: none;
  }
`}</style>