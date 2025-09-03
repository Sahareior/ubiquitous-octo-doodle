import React, { useState, useEffect } from 'react';
import { Table, Select, message, Tag } from 'antd';
import { IoEyeOutline } from 'react-icons/io5';
import { RiArrowDropDownLine } from 'react-icons/ri';
import Swal from 'sweetalert2';
import SellsModal from './SellsModal';
import { useBulkSellerApplicationsUpdateMutation } from '../../../../../redux/slices/Apis/dashboardApis';

const { Option } = Select;

const SellersTable = ({ applicants, isLoading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [selectedData, setSelectedData] = useState();

  const [bulkSellerApplicationsUpdate, { isLoading: bulkLoading }] =
    useBulkSellerApplicationsUpdateMutation();

  // Map API applicants to table format
  useEffect(() => {
    if (Array.isArray(applicants)) {
      const mappedData = applicants.map((applicant) => ({
        key: applicant.id,
        id: applicant.id,
        name: applicant.legal_business_name,
        jobTitle: applicant.job_title,
        phone: applicant.phone_number,
        city: applicant.city_town,
        country: applicant.country,
        establishedDate: applicant.established_date,
        businessType: applicant.business_type,
        status: applicant.status,
        documents: {
          nidFront: applicant.nid_front,
          nidBack: applicant.nid_back,
          taxpayerDoc: applicant.taxpayer_doc,
          tradeRegisterDoc: applicant.trade_register_doc,
        },
      }));
      setDataSource(mappedData);
    }
  }, [applicants]);

  // ✅ Handle Bulk Status Update
  const handleBulkAction = async (status) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one row.');
      return;
    }

    try {
      const payload = {
        application_ids: selectedRowKeys,
        status,
      };

      await bulkSellerApplicationsUpdate(payload).unwrap();
      message.success(`Successfully updated ${selectedRowKeys.length} applications to "${status}".`);

      // Update frontend table instantly
      setDataSource((prev) =>
        prev.map((item) =>
          selectedRowKeys.includes(item.key)
            ? { ...item, status }
            : item
        )
      );

      setSelectedRowKeys([]);
    } catch (error) {
      console.error(error);
      message.error('Failed to update applications.');
    }
  };

  const handleView = (data) => {
    setSelectedData(data);
  };

  const statusTag = (status) => {
    const statusMap = {
      approved: { color: 'green', text: 'Approved' },
      pending: { color: 'orange', text: 'Pending' },
      rejected: { color: 'red', text: 'Rejected' },
      archived: { color: 'blue', text: 'Archived' },
    };

    const currentStatus = statusMap[status?.toLowerCase()] || statusMap.pending;

    return <Tag color={currentStatus.color}>{currentStatus.text}</Tag>;
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80, sorter: (a, b) => a.id - b.id },
    { title: 'Business Name', dataIndex: 'name', key: 'name', render: (text) => <span className="font-medium popreg">{text}</span> },
    { title: 'Job Title', dataIndex: 'jobTitle', key: 'jobTitle', render: (text) => <span className="font-medium popreg">{text}</span> },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', render: (text) => <span className="font-medium popreg">{text}</span> },
    { title: 'City', dataIndex: 'city', key: 'city',render: (text) => <span className="font-medium popreg">{text}</span> },
    { title: 'Country', dataIndex: 'country', key: 'country', render: (text) => <span className="font-medium popreg">{text}</span> },
    {
      title: 'Established Date',
      dataIndex: 'establishedDate',
      key: 'establishedDate',
      sorter: (a, b) => new Date(a.establishedDate) - new Date(b.establishedDate),
      render: (date) => new Date(date).toLocaleDateString(),
    },
    { title: 'Business Type', dataIndex: 'businessType', key: 'businessType' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => statusTag(status),
      filters: [
        { text: 'Approved', value: 'approved' },
        { text: 'Pending', value: 'pending' },
        { text: 'Rejected', value: 'rejected' },
        { text: 'Archived', value: 'archived' },
      ],
      onFilter: (value, record) => record.status.toLowerCase() === value,
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <IoEyeOutline
            onClick={() => {
              setIsModalOpen(true);
              handleView(record);
            }}
            className="text-blue-500 cursor-pointer hover:text-blue-700"
            size={18}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      {/* Bulk Action Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Select
            placeholder="Bulk Actions"
            size="middle"
            className="min-w-[160px]"
            onChange={handleBulkAction}
            suffixIcon={<RiArrowDropDownLine />}
            loading={bulkLoading}
          >
            <Option value="pending">Mark as Pending</Option>
            <Option value="approved">Mark as Approved</Option>
            <Option value="rejected">Mark as Rejected</Option>
            <Option value="archived">Mark as Archived</Option>
          </Select>
          <span className="text-sm text-gray-500">{selectedRowKeys.length} selected</span>
        </div>
      </div>

      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
        }}
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        scroll={{ x: 1500 }}
        pagination={{
          pageSize,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => `Total ${total} applications`,
          position: ['bottomRight'],
        }}
      />

      <SellsModal setIsModalOpen={setIsModalOpen} sellerInfo={selectedData} isModalOpen={isModalOpen} />
    </div>
  );
};

export default SellersTable;
