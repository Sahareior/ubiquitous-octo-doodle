import React, { useState, useMemo } from 'react';
import { Table } from 'antd';
import TableModal from '../../../AdminDashboard/pages/Overview/_subComponents/TableModal';
import { useVenDorNotificationsQuery } from '../../../../redux/slices/Apis/vendorsApi';
import dayjs from 'dayjs';

const VendorTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: recent, isLoading } = useVenDorNotificationsQuery();

  // Map API data to table format
  const tableData = useMemo(() => {
    if (!recent?.results) return [];

    return recent.results.map((item) => ({
      key: item.id,
      requestDate: dayjs(item.event_time).format('YYYY-MM-DD HH:mm'),
      amount: `$${item.meta_data?.total_amount || '0.00'}`,
      status: item.meta_data?.order_status || 'Pending',
      paymentMethod: item.meta_data?.type === 'order' ? 'Online Payment' : 'N/A',
      transactionId: item.meta_data?.order_id || '-',
      fullName: item.full_name,
      message: item.message,
      seen: item.seen,
    }));
  }, [recent]);

  const columns = [
    {
      title: 'Request Date',
      dataIndex: 'requestDate',
      key: 'requestDate',
    },
    {
      title: 'Customer',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span
          className={`text-sm font-medium ${
            status === 'Delivered'
              ? 'text-green-600'
              : status === 'Pending'
              ? 'text-yellow-600'
              : 'text-red-500'
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={tableData}
        loading={isLoading}
        pagination={{ pageSize: 5 }}
      />
      <TableModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </div>
  );
};

export default VendorTable;
