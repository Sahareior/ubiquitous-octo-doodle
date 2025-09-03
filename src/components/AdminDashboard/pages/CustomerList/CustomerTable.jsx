import React, { useEffect, useState } from 'react';
import { Table, Select, message } from 'antd';
import { IoEyeOutline } from 'react-icons/io5';
import { MdDelete } from 'react-icons/md';
import { RiArrowDropDownLine } from 'react-icons/ri';
import CustomerModal from './CustomerModal/CustomerModal';
import Swal from 'sweetalert2';
import {
  useDeleteBulkUsersMutation,
  useDeleteCustomersMutation,
  useDeleteUsersMutation,
  useGetAllCustomersQuery,
} from '../../../../redux/slices/Apis/dashboardApis';

const { Option } = Select;

const CustomerTable = ({ customerList }) => {
  const { refetch } = useGetAllCustomersQuery();
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [deleteUsers] = useDeleteUsersMutation();
  const [deleteBulkUsers] = useDeleteBulkUsersMutation();

  // Handle both cases: array or { results: [...] }
  const sourceArray = Array.isArray(customerList)
    ? customerList
    : customerList?.results || [];

  const dataSource = sourceArray.map((c, index) => ({
    key: c.id ?? index + 1, // unique key
    ...c,
    id: c.id,
    customer: c.customer_name,
    status: c.payment_status,
    signupDate: c.signup_date,
    lastActivity: c.last_activity || '—',
  }));

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <a className="popreg text-[16px]">{text}</a>,
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      render: (text) => <a className="popreg text-[16px]">{text}</a>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span
          className={`px-3 py-1 popreg rounded-xl text-[16px] font-medium ${
            status === 'completed'
              ? 'bg-green-100 text-green-600'
              : status === 'N/A'
              ? 'bg-gray-100 text-gray-600'
              : 'bg-yellow-100 text-yellow-600'
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: 'Signup Date',
      dataIndex: 'signupDate',
      key: 'signupDate',
      render: (text) => <span className="font-medium popreg">{text}</span>
    },
    {
      title: 'Last Activity',
      dataIndex: 'lastActivity',
      key: 'lastActivity',
      render: (text) => <span className="font-medium popreg">{text}</span>
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <IoEyeOutline
            onClick={() => {
              setIsModalOpen(true);
              setSelectedCustomer(record);
            }}
            className="text-gray-400 cursor-pointer"
            size={20}
          />
          <MdDelete
            className="text-red-400 cursor-pointer"
            size={20}
            onClick={() => handleSingleDelete(record.id)}
          />
        </div>
      ),
    },
  ];

  // ✅ Single delete
  const handleSingleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won’t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteUsers(id).unwrap();
          refetch();
          Swal.fire('Deleted!', 'The user has been deleted.', 'success');
        } catch (error) {
          console.error('Delete failed:', error);
          Swal.fire('Error!', 'Failed to delete the user.', 'error');
        }
      }
    });
  };

  // ✅ Bulk delete
  const handleBulkDelete = async (ids) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are deleting ${ids.length} users!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete them!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteBulkUsers({ user_ids: ids }).unwrap();
          refetch();
          setSelectedRowKeys([]);
          Swal.fire('Deleted!', `${ids.length} users have been deleted.`, 'success');
        } catch (error) {
          console.error('Bulk delete failed:', error);
          Swal.fire('Error!', 'Failed to delete users.', 'error');
        }
      }
    });
  };

  const handleBulkAction = (action) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one row.');
      return;
    }

    if (action === 'delete') {
      handleBulkDelete(selectedRowKeys);
    }
  };

  return (
    <div className="bg-white p-4 rounded relative shadow-md">
      {/* Bulk Actions Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Select
            placeholder="Bulk Actions"
            size="small"
            className="min-w-[140px]"
            onChange={handleBulkAction}
            suffixIcon={<RiArrowDropDownLine />}
          >
            <Option value="delete">Delete Selected</Option>
          </Select>
          <span className="text-sm text-gray-500">
            {selectedRowKeys.length} selected
          </span>
        </div>
      </div>

      {/* Table */}
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
        }}
        columns={columns}
        dataSource={dataSource}
        pagination={{
          pageSize,
          total: dataSource.length,
          showTotal: (total, range) =>
            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
          showSizeChanger: false,
          itemRender: (current, type, originalElement) => originalElement,
          position: ['bottomRight'],
        }}
        footer={() => (
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center relative gap-2 text-sm">
              <span>Show</span>
              <Select
                value={pageSize}
                onChange={(value) => setPageSize(value)}
                size="small"
                style={{ width: 70 }}
                suffixIcon={<RiArrowDropDownLine />}
              >
                {[10, 20, 50].map((size) => (
                  <Option key={size} value={size}>
                    {size}
                  </Option>
                ))}
              </Select>
              <span>entries</span>
            </div>
          </div>
        )}
      />

      <CustomerModal
        setIsModalOpen={setIsModalOpen}
        selectedCustomer={selectedCustomer}
        isModalOpen={isModalOpen}
      />
    </div>
  );
};

export default CustomerTable;
