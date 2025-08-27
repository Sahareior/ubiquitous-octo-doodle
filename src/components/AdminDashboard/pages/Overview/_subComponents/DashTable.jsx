import React, { useState } from 'react';
import { Table } from 'antd';
import TableModal from './TableModal';
import { useGetLatestOrdersQuery, useGetOrdersByIdQuery } from '../../../../../redux/slices/Apis/dashboardApis';
import dayjs from 'dayjs';

const DashTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { data: latestOrders, isLoading } = useGetLatestOrdersQuery();

  // ✅ Fetch order details only when selectedId is set
  const { data: orderDetails, isFetching: isOrderLoading } = useGetOrdersByIdQuery(selectedId, {
    skip: !selectedId,
  });


  const handleSelect = (id) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span
          className={`text-sm font-medium ${
            status.toLowerCase() === 'delivered'
              ? 'text-green-600'
              : status.toLowerCase() === 'pending'
              ? 'text-yellow-600'
              : status.toLowerCase() === 'processing'
              ? 'text-blue-600'
              : 'text-red-500'
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <p
          onClick={() => handleSelect(record.id)}
          className="text-sm popreg text-[#CBA135] hover:cursor-pointer"
        >
          View
        </p>
      ),
    },
  ];

  // ✅ Transform API response to match AntD table
  const data =
    latestOrders?.map((order, index) => ({
      key: index,
      id: order?.id, // ✅ include ID
      orderId: order?.order_id,
      customer: order?.customer_name,
      date: dayjs(order?.order_date).format('YYYY-MM-DD HH:mm'),
      status: order?.order_status,
    })) || [];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={{ pageSize: 5 }}
      />
      {/* ✅ Pass order details to modal */}
      <TableModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        orderDetails={orderDetails}
        isOrderLoading={isOrderLoading}
      />
    </div>
  );
};

export default DashTable;
