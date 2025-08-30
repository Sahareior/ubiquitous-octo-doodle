import React, { useEffect, useState } from 'react';
import { Table, Select, message } from 'antd';
import { IoEyeOutline } from 'react-icons/io5';
import { MdDelete } from 'react-icons/md';
import { RiArrowDropDownLine } from 'react-icons/ri';
import CustomerModal from './CustomerModal/CustomerModal';
import Swal from 'sweetalert2';
import { useDeleteCustomersMutation, useDeleteUsersMutation, useGetAllCustomersQuery } from '../../../../redux/slices/Apis/dashboardApis';
import { handleDelete } from '../../../utils/deleteHandler';

const { Option } = Select;

const CustomerTable = () => {
  const { data: customerList,refetch } = useGetAllCustomersQuery();
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteCustomers] = useDeleteCustomersMutation()
  const [deleteUsers] = useDeleteUsersMutation()

  console.log(customerList,'this is customer list')

  useEffect(()=>{
    fetch("http://10.10.13.16:15000/api/admin/customers/13/view")
    .then(res => res.json())
    .then(data=> console.log(data))
  },[])

  // Transform API data for table
  const dataSource =
    customerList?.results?.map((c, index) => ({
      key: index + 1,
      id: c.user_id,
      customer: c.customer_name,
      status: c.payment_status, // N/A, completed, etc.
      signupDate: c.signup_date,
      lastActivity: c.last_activity || '—',
      actions: c.actions,
    })) || [];

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: text => <a className="popmed text-[16px]">{text}</a>,
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      render: text => (
        <div>
          <a className="popmed text-[16px]">{text}</a>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <span
          className={`px-3 py-1 popmed rounded-xl text-[16px] font-medium ${
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
      render: text => (
        <div>
          <a className="popmed text-[16px]">{text}</a>
        </div>
      ),
    },
    {
      title: 'Last Activity',
      dataIndex: 'lastActivity',
      key: 'lastActivity',
      render: text => (
        <div>
          <a className="popmed text-[16px]">{text}</a>
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <IoEyeOutline
            onClick={() => setIsModalOpen(true)}
            className="text-gray-400 cursor-pointer"
            size={20}
          />
          <MdDelete
            className="text-red-400 cursor-pointer"
            size={20}
            onClick={() => handleDelete([record.key])}
          />
        </div>
      ),
    },
  ];

  const handleBulkAction = (action) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one row.');
      return;
    }

    if (action === 'delete') {
      handleDelete(selectedRowKeys);
    } else if (action === 'edit') {
      message.info('Bulk edit not implemented in this example.');
    }
  };

  // http://10.10.13.16:15000/api/admin/customers/4/delete  /admin/customers/2/delete

const handleDelete = async (keys) => {
  console.log(keys[0],'users keys')
  // const url = keys?.actions?.delete_url; // "/admin/vendors/17/delete"
  // const id = url.split("/")[3]; // "17"

  Swal.fire({
    title: "Are you sure?",
    text: "You won’t be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await deleteUsers(keys[0]); // call your API
        console.log("Extracted ID:", keys[0], "Response:", res);
        refetch()

        Swal.fire("Deleted!", "The user has been deleted.", "success");
      } catch (error) {
        console.error("Delete failed:", error);
        Swal.fire("Error!", "Failed to delete the user.", "error");
      }
    }
  });
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
      <CustomerModal setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} />
    </div>
  );
};

export default CustomerTable;
