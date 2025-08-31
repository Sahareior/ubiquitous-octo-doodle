import React, { useState, useMemo } from "react";
import {
  Table,
  Tag,
  Image,
  Spin,
  Button,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Input,
  Modal,
  Form,
  Upload,
  message,
  Typography,
  Tooltip,
  Badge,
  Divider
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  UploadOutlined,
  ReloadOutlined,
  FilterOutlined,
  ExportOutlined,
  ImportOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import { useDeleteCategoriesMutation, useGetCategoriesQuery } from "../../../../redux/slices/Apis/customersApi";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(advancedFormat);

const { TextArea } = Input;
const { Title, Text } = Typography;

const CategoryManagement = () => {
  const { data: cateGoryData, isLoading, error, refetch } = useGetCategoriesQuery();
  const navigate = useNavigate();
  const [deleteCategories] = useDeleteCategoriesMutation();
  const [searchText, setSearchText] = useState("");
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(null);
  const [form] = Form.useForm();

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Confirm Deletion",
      text: "This action will permanently remove this category and may affect associated products.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteCategories(id).unwrap();
          Swal.fire("Deleted!", "Category has been deleted.", "success");
        } catch (err) {
          console.error("Delete error:", err);
          Swal.fire("Error!", err.data?.message || "Failed to delete category.", "error");
        }
      }
    });
  };

  const handlePreview = (image) => {
    setPreviewImage(image);
    setPreviewVisible(true);
  };

  const filteredData = useMemo(() => {
    return cateGoryData?.results?.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "withImage" && item.image) ||
        (statusFilter === "withoutImage" && !item.image);
      
      const matchesDate = !dateFilter || dayjs(item.created_at).isSame(dateFilter, 'day');
      
      return matchesSearch && matchesStatus && matchesDate;
    }) || [];
  }, [cateGoryData, searchText, statusFilter, dateFilter]);

  const exportData = () => {
    const dataStr = JSON.stringify(filteredData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `categories-${dayjs().format('YYYY-MM-DD')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      sorter: (a, b) => a.id - b.id,
      fixed: 'left',
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-semibold text-gray-800">{text}</span>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (text) => <Tag color="blue" className="font-mono">{text}</Tag>,
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image, record) =>
        image ? (
          <div className="relative group">
            <Image
              width={60}
              height={60}
              src={image}
              alt="category"
              className="rounded-md border border-gray-200 transition-all duration-300 group-hover:shadow-md object-cover"
              preview={{
                visible: previewVisible,
                src: previewImage,
                onVisibleChange: (value) => {
                  setPreviewVisible(value);
                },
              }}
              placeholder={
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Spin size="small" />
                </div>
              }
            />
            <Tooltip title="Preview image">
              <Button
                type="text"
                icon={<EyeOutlined />}
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-80 rounded-bl-md"
                size="small"
                onClick={() => handlePreview(image)}
              />
            </Tooltip>
          </div>
        ) : (
          <Badge status="error" text="No Image" />
        ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => text || <span className="text-gray-400 italic">No description provided</span>,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (
        <Tooltip title={dayjs(date).format('MMMM Do YYYY, h:mm:ss A')}>
          <div className="text-xs text-gray-500">
            {dayjs(date).format("MMM D, YYYY")}
            <br />
            {dayjs(date).format("h:mm A")}
          </div>
        </Tooltip>
      ),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (date) => (
        <Tooltip title={dayjs(date).format('MMMM Do YYYY, h:mm:ss A')}>
          <div className="text-xs text-gray-500">
            {dayjs(date).format("MMM D, YYYY")}
            <br />
            {dayjs(date).format("h:mm A")}
          </div>
        </Tooltip>
      ),
      sorter: (a, b) => new Date(a.updated_at) - new Date(b.updated_at),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Tag color={record.image ? "green" : "orange"}>
          {record.image ? "Complete" : "Needs Image"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit category">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/admin-dashboard/edit-category/${record.id}`)}
              className="flex items-center"
            >
              Edit
            </Button>
          </Tooltip>
          <Tooltip title="Delete category">
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record.id)}
              className="flex items-center"
            >
              Delete
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <Spin size="large" className="mb-4" />
          <Text type="secondary">Loading categories...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <Card className="text-center border-none shadow-lg">
          <div className="text-red-500 text-xl mb-4">
            <InfoCircleOutlined className="mr-2" />
            Error fetching categories
          </div>
          <Text type="secondary" className="block mb-4">
            There was a problem loading your categories. Please try again.
          </Text>
          <Button type="primary" icon={<ReloadOutlined />} onClick={refetch}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  const statsData = [
    {
      title: 'Total Categories',
      value: cateGoryData?.results?.length || 0,
      color: '#3B82F6',
      prefix: null,
      suffix: null,
    },
    {
      title: 'With Images',
      value: cateGoryData?.results?.filter(item => item.image).length || 0,
      color: '#10B981',
      prefix: null,
      suffix: null,
    },
    {
      title: 'Without Images',
      value: cateGoryData?.results?.filter(item => !item.image).length || 0,
      color: '#EF4444',
      prefix: null,
      suffix: null,
    },
    {
      title: 'Last Updated',
      value: cateGoryData?.results?.length ? 
        dayjs(Math.max(...cateGoryData.results.map(item => new Date(item.updated_at))))?.format('MMM DD') : 'N/A',
      color: '#8B5CF6',
      prefix: null,
      suffix: null,
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Title level={2} className="m-0 text-gray-800">Category Management</Title>
          <Text type="secondary">Manage your product categories and organization</Text>
        </div>
        <div>
          <Button icon={<ReloadOutlined />} onClick={refetch}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card 
              className="rounded-lg border-0 shadow-sm hover:shadow-md transition-shadow duration-300"
              bodyStyle={{ padding: '16px' }}
            >
              <Statistic
                title={stat.title}
                value={stat.value}
                valueStyle={{ color: stat.color, fontSize: '24px' }}
                prefix={stat.prefix}
                suffix={stat.suffix}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Action Bar */}
      <Card className="rounded-lg shadow-sm border-0 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Input
            placeholder="Search categories by name or description..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full md:w-96 rounded-lg"
            allowClear
          />
          
          <div className="flex flex-wrap gap-2">
            <Button 
              icon={<FilterOutlined />} 
              onClick={() => setFilterVisible(!filterVisible)}
            >
              Filters
            </Button>
            
            <Button 
              icon={<ExportOutlined />} 
              onClick={exportData}
            >
              Export
            </Button>
            
            <Link to="/admin-dashboard/create-category">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="flex items-center bg-blue-600 hover:bg-blue-700 border-0"
              >
                Create Category
              </Button>
            </Link>
          </div>
        </div>

        {/* Expandable Filters */}
        {filterVisible && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div>
                  <Text strong className="block mb-2">Image Status</Text>
                  <div className="flex gap-2">
                    <Button 
                      size="small"
                      type={statusFilter === 'all' ? 'primary' : 'default'}
                      onClick={() => setStatusFilter('all')}
                    >
                      All
                    </Button>
                    <Button 
                      size="small"
                      type={statusFilter === 'withImage' ? 'primary' : 'default'}
                      onClick={() => setStatusFilter('withImage')}
                    >
                      With Image
                    </Button>
                    <Button 
                      size="small"
                      type={statusFilter === 'withoutImage' ? 'primary' : 'default'}
                      onClick={() => setStatusFilter('withoutImage')}
                    >
                      Without Image
                    </Button>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <Text strong className="block mb-2">Date Added</Text>
                  <Input 
                    type="date" 
                    onChange={(e) => setDateFilter(e.target.value ? dayjs(e.target.value) : null)}
                    className="w-full"
                  />
                </div>
              </Col>
              <Col span={8} className="flex items-end">
                <Button 
                  type="text" 
                  onClick={() => {
                    setStatusFilter('all');
                    setDateFilter(null);
                  }}
                >
                  Clear Filters
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* Results Count */}
      <div className="mb-4 flex justify-between items-center">
        <Text strong>
          Showing {filteredData.length} of {cateGoryData?.results?.length} categories
        </Text>
        {filteredData.length !== cateGoryData?.results?.length && (
          <Button type="link" onClick={() => {
            setSearchText("");
            setStatusFilter("all");
            setDateFilter(null);
          }}>
            Clear all filters
          </Button>
        )}
      </div>

      {/* Categories Table */}
      <Card className="rounded-lg shadow-sm border-0 overflow-hidden">
        <Table
          rowKey="id"
          dataSource={filteredData}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ['10', '20', '50'],
            className: 'px-4'
          }}
          scroll={{ x: 1200 }}
          loading={isLoading}
          size="middle"
        />
      </Card>

      {/* Image Preview Modal */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={400}
        bodyStyle={{ textAlign: 'center', padding: '20px' }}
        className="preview-modal"
      >
        <Image
          src={previewImage}
          alt="Preview"
          style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }}
        />
      </Modal>
    </div>
  );
};

export default CategoryManagement;