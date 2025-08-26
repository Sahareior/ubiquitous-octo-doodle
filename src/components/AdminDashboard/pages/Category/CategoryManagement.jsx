import React from "react";
import { Table, Tag, Image, Spin, Button, Space, Popconfirm, message } from "antd";
import { useDeleteCategoriesMutation, useGetCategoriesQuery } from "../../../../redux/slices/Apis/customersApi";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Swal from "sweetalert2";

const CategoryManagement = () => {
  const { data: cateGoryData, isLoading, error } = useGetCategoriesQuery();
  const navigate = useNavigate();
  const [deleteCategories] = useDeleteCategoriesMutation()

const handleDelete = async (id) => {
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
        const res = await deleteCategories(id).unwrap();

        Swal.fire("Deleted!", "Category has been deleted.", "success");
      } catch (err) {
        console.error("Delete error:", err);
        Swal.fire("Error!", err.data?.message || "Failed to delete category.", "error");
      }
    }
  });
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
      {/* <h2>Category Management</h2> */}
      <div className="flex justify-end mb-5">
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
