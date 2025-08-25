import React from "react";
import { Table, Tag, Image, Spin, Button, Space, Popconfirm, message } from "antd";
import { useGetCategoriesQuery } from "../../../../redux/slices/Apis/customersApi";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const CategoryManagement = () => {
  const { data: cateGoryData, isLoading, error } = useGetCategoriesQuery();
  const navigate = useNavigate();

  const handleDelete = (id) => {
    // TODO: call delete mutation
    console.log("Delete category with id:", id);
    message.success(`Category ${id} deleted (mock)`);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image) =>
        image ? (
          <Image width={60} src={image} alt="category" />
        ) : (
          <Tag color="red">No Image</Tag>
        ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => navigate(`/admin-dashboard/edit-category/${record.id}`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isLoading) return <Spin size="large" />;
  if (error) return <p>Error fetching categories</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Category Management</h2>
      <div>
        <Link to='/admin-dashboard/create-category'>
        <Button>Create Category</Button>
        </Link>
      </div>
      <Table
        rowKey="id"
        dataSource={cateGoryData?.results || []}
        columns={columns}
        bordered
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default CategoryManagement;
