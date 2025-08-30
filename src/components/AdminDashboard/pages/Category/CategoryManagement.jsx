import React, { useState } from "react";
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
  message
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  UploadOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { useDeleteCategoriesMutation, useGetCategoriesQuery } from "../../../../redux/slices/Apis/customersApi";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Swal from "sweetalert2";

const { TextArea } = Input;

const CategoryManagement = () => {
  const { data: cateGoryData, isLoading, error, refetch } = useGetCategoriesQuery();
  const navigate = useNavigate();
  const [deleteCategories] = useDeleteCategoriesMutation();
  const [searchText, setSearchText] = useState("");
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [form] = Form.useForm();

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
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

  const filteredData = cateGoryData?.results?.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.description.toLowerCase().includes(searchText.toLowerCase())
  ) || [];

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      sorter: (a, b) => a.id - b.id,
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
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image) =>
        image ? (
          <div className="relative group">
            <Image
              width={60}
              src={image}
              alt="category"
              className="rounded-md border border-gray-200 transition-all duration-300 group-hover:shadow-md"
              preview={{
                visible: previewVisible,
                src: previewImage,
                onVisibleChange: (value) => {
                  setPreviewVisible(value);
                },
              }}
            />
            <Button
              type="text"
              icon={<EyeOutlined />}
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-80 rounded-bl-md"
              size="small"
              onClick={() => handlePreview(image)}
            />
          </div>
        ) : (
          <Tag color="red" icon={<UploadOutlined />}>No Image</Tag>
        ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => text || <span className="text-gray-400">No description</span>,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (
        <div className="text-xs text-gray-500">
          {dayjs(date).format("MMM D, YYYY")}
          <br />
          {dayjs(date).format("h:mm A")}
        </div>
      ),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (date) => (
        <div className="text-xs text-gray-500">
          {dayjs(date).format("MMM D, YYYY")}
          <br />
          {dayjs(date).format("h:mm A")}
        </div>
      ),
      sorter: (a, b) => new Date(a.updated_at) - new Date(b.updated_at),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigate(`/admin-dashboard/edit-category/${record.id}`)}
            className="flex items-center"
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
            className="flex items-center"
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <Card className="text-center">
          <div className="text-red-500 text-xl mb-4">Error fetching categories</div>
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
      color: '#3B82F6'
    },
    {
      title: 'With Images',
      value: cateGoryData?.results?.filter(item => item.image).length || 0,
      color: '#10B981'
    },
    {
      title: 'Without Images',
      value: cateGoryData?.results?.filter(item => !item.image).length || 0,
      color: '#EF4444'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
        <p className="text-gray-500">Manage your product categories and organization</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        {statsData.map((stat, index) => (
          <Col span={8} key={index}>
            <Card className="rounded-lg shadow-sm border-0">
              <Statistic
                title={stat.title}
                value={stat.value}
                valueStyle={{ color: stat.color }}
                className="text-center"
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
          
          <div className="flex gap-2">
  
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
      </Card>

      {/* Categories Table */}
      <Card className="rounded-lg shadow-sm border-0 overflow-hidden">
        <Table
          rowKey="id"
          dataSource={filteredData}
          columns={columns}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 1000 }}
          loading={isLoading}
        />
      </Card>

      {/* Image Preview Modal */}
      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={400}
        bodyStyle={{ textAlign: 'center' }}
      >
        <Image
          src={previewImage}
          alt="Preview"
          style={{ maxWidth: '100%', maxHeight: '400px' }}
        />
      </Modal>
    </div>
  );
};

export default CategoryManagement;