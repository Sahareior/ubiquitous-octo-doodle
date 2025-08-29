import React, { useState } from 'react';
import { Table, Select, Popover, Button, Input, message } from 'antd';
import { RiArrowDropDownLine, RiEyeLine } from 'react-icons/ri';
import { usePayoutApproveMutation } from '../../../../../redux/slices/Apis/dashboardApis';

const { Option } = Select;
const { TextArea } = Input;

const PayoutTable = ({ payouts }) => {
  const [pageSize, setPageSize] = useState(10);
  const [payoutApprove] = usePayoutApproveMutation();
  const [currentPayout, setCurrentPayout] = useState(null);
  const [note, setNote] = useState('');
  const [popoverVisible, setPopoverVisible] = useState(false);

  const handleApprove = async (id) => {
    try {
      const data = {
        amount: currentPayout.amount,
        payment_method: currentPayout.payment_method,
        note: note
      };
      await payoutApprove({ id, data }).unwrap();
      message.success('Payout approved successfully');
      setPopoverVisible(false);
      setNote('');
    } catch (error) {
      message.error('Failed to approve payout');
    }
  };

  const handleReject = async (id) => {
    try {
      // You might need a separate reject mutation or adjust the API call
      const data = {
        amount: currentPayout.amount,
        payment_method: currentPayout.payment_method,
        note: note,
        status: 'rejected'
      };
      await payoutApprove({ id, data }).unwrap();
      message.success('Payout rejected successfully');
      setPopoverVisible(false);
      setNote('');
    } catch (error) {
      message.error('Failed to reject payout');
    }
  };

  const popoverContent = (record) => (
    <div className="p-4 w-80">
      <h3 className="font-semibold mb-3">Payout Details</h3>
      <div className="space-y-2 mb-4">
        <p><span className="font-medium">Vendor:</span> {record.vendor}</p>
        <p><span className="font-medium">Amount:</span> ${record.amount}</p>
        <p><span className="font-medium">Method:</span> {record.payment_method}</p>
      </div>
      
      <TextArea
        placeholder="Add a note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        className="mb-4"
      />
      
      <div className="flex space-x-2 justify-end">
        <Button 
          onClick={() => setPopoverVisible(false)}
          className="border border-gray-300"
        >
          Cancel
        </Button>
        <Button 
          onClick={() => handleReject(record.id)}
          danger
          className="bg-red-500 text-white border-red-500"
        >
          Reject
        </Button>
        <Button 
          onClick={() => handleApprove(record.id)}
          type="primary"
          className="bg-blue-500 text-white border-blue-500"
        >
          Approve
        </Button>
      </div>
    </div>
  );

  // Transform API data for table
  const dataSource = payouts?.results?.map((p, index) => ({
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
      render: (text) => <a className="text-[16px] popmed">{text}</a>,
    },
    {
      title: 'Vendor ID',
      dataIndex: 'vendor',
      key: 'vendor',
      render: (text) => <a className="text-[16px] popmed">{text}</a>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text) => <span className="text-[16px] popmed">${text}</span>,
    },
    {
      title: 'Payment Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (text) => <span className="text-[16px] popmed">{text}</span>,
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      render: (text) => <span className="text-[16px] popmed">{text || '-'}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span
          className={`px-3 py-1 rounded-xl text-[16px] font-medium popmed ${
            status === 'approved'
              ? 'bg-green-100 text-green-600'
              : status === 'rejected'
              ? 'bg-red-100 text-red-600'
              : 'bg-yellow-100 text-yellow-600'
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <span className="text-[16px] popmed">
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
        >
          <Button
            icon={<RiEyeLine className="text-blue-500" />}
            className="flex items-center justify-center border-none shadow-none"
          />
        </Popover>
      ),
    },
  ];

  return (
    <div className="bg-white p-4 rounded shadow-md relative">
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