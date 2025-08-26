import React, { useState } from "react";
import { Form, Input, Button, Upload, message, Card, Row, Col, Divider, Typography } from "antd";
import { UploadOutlined, ArrowLeftOutlined, SaveOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { usePostCategoriesMutation } from "../../../../redux/slices/Apis/customersApi";
import Swal from "sweetalert2";

const { Title, Text } = Typography;

const CreateCategory = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postCategories] = usePostCategoriesMutation();

const handleSubmit = async (values) => {
  if (!file) {
    Swal.fire({
      icon: "error",
      title: "Missing Image",
      text: "Please upload an image before submitting!",
      confirmButtonColor: "#d33",
    });
    return;
  }

  setIsSubmitting(true);

  const formData = new FormData();
  formData.append("name", values.name);
  formData.append("slug", values.slug);
  formData.append("description", values.description || "");
  formData.append("image", file);

  try {
    const res = await postCategories(formData).unwrap();
    console.log("Response:", res);

    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Category created successfully 🎉",
      confirmButtonColor: "#3085d6",
    });

    form.resetFields();
    setPreviewUrl(null);
    setFile(null);
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Failed to create category. Please try again!",
      confirmButtonColor: "#d33",
    });
  } finally {
    setIsSubmitting(false);
  }
};
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleBeforeUpload = async (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return Upload.LIST_IGNORE;
    }

    setFile(file);
    const preview = await getBase64(file);
    setPreviewUrl(preview);

    return false;
  };

  return (
    <div
      style={{
        padding: "24px",
        background: "linear-gradient(135deg, #f9f5f0 0%, #f3ebe2 100%)",
        minHeight: "100vh",
        fontFamily: '"Playfair Display", "Inter", serif',
      }}
    >
      {/* Back Button */}
      <Button
        style={{
          background: "#ffffff",
          border: "1px solid #e8e0d7",
          borderRadius: "8px",
          color: "#7a6a58",
          marginBottom: "24px",
          boxShadow: "0 2px 8px rgba(139, 108, 77, 0.08)",
          height: "40px",
          display: "flex",
          alignItems: "center",
          fontWeight: "500",
        }}
        icon={<ArrowLeftOutlined style={{ color: "#7a6a58" }} />}
        onClick={() => navigate("/categories")}
      >
        Back to Categories
      </Button>

      {/* Main Card */}
      <Card
        style={{
          borderRadius: "16px",
          boxShadow: "0 12px 30px rgba(94, 71, 44, 0.12)",
          maxWidth: "1000px",
          margin: "0 auto",
          background: "#ffffff",
          border: "1px solid #e8e0d7",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div
          style={{
            background: "linear-gradient(90deg, #5c4033 0%, #7a5d48 100%)",
            padding: "24px 32px",
            color: "white",
          }}
        >
          <Title level={2} style={{ color: "white", margin: 0, fontWeight: 600 }}>
            Create New Category
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }}>
            Add a new furniture category to your collection
          </Text>
        </div>

        <div style={{ padding: "32px" }}>
          {/* Form */}
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={32}>
              {/* Left side - Form Fields */}
              <Col xs={24} md={14}>
                <Form.Item
                  name="name"
                  label={
                    <Text strong style={{ color: "#5c4033", fontSize: "15px" }}>
                      Category Name
                    </Text>
                  }
                  rules={[{ required: true, message: "Please enter a category name" }]}
                >
                  <Input
                    size="large"
                    placeholder="e.g., Living Room Furniture"
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #d9c7b3",
                      padding: "10px 12px",
                      background: "#fcf9f6",
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="slug"
                  label={
                    <Text strong style={{ color: "#5c4033", fontSize: "15px" }}>
                      URL Slug
                    </Text>
                  }
                  rules={[{ required: true, message: "Please enter a URL slug" }]}
                >
                  <Input
                    size="large"
                    placeholder="e.g., living-room-furniture"
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #d9c7b3",
                      padding: "10px 12px",
                      background: "#fcf9f6",
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="description"
                  label={
                    <Text strong style={{ color: "#5c4033", fontSize: "15px" }}>
                      Description
                    </Text>
                  }
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Describe this category..."
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #d9c7b3",
                      background: "#fcf9f6",
                      resize: "vertical",
                    }}
                  />
                </Form.Item>
              </Col>

              {/* Right side - Image Upload */}
              <Col xs={24} md={10}>
                <div
                  style={{
                    padding: "20px",
                    background: "#faf7f3",
                    borderRadius: "12px",
                    border: "1px dashed #d9c7b3",
                  }}
                >
                  <Text strong style={{ color: "#5c4033", fontSize: "15px", display: "block", marginBottom: "16px" }}>
                    Category Image
                  </Text>
                  <Upload beforeUpload={handleBeforeUpload} showUploadList={false}>
                    {previewUrl ? (
                      <div
                        style={{
                          position: "relative",
                          borderRadius: "12px",
                          overflow: "hidden",
                          height: "220px",
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(94, 71, 44, 0.15)",
                          transition: "all 0.3s ease",
                        }}
                        className="image-preview"
                      >
                        <img
                          src={previewUrl}
                          alt="category"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div
                          className="image-overlay"
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(92, 64, 51, 0.7)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: 0,
                            transition: "opacity 0.3s",
                            color: "white",
                            fontWeight: "600",
                          }}
                        >
                          <PlusOutlined style={{ fontSize: "20px", marginRight: "8px" }} />
                          Change Image
                        </div>
                      </div>
                    ) : (
                      <div
                        className="upload-placeholder"
                        style={{
                          border: "2px dashed #d9c7b3",
                          borderRadius: "12px",
                          padding: "20px",
                          textAlign: "center",
                          backgroundColor: "#fcf9f6",
                          height: "220px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <div
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            background: "#f0e8df",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "16px",
                          }}
                        >
                          <UploadOutlined style={{ fontSize: "24px", color: "#7a6a58" }} />
                        </div>
                        <Text style={{ color: "#7a6a58", marginBottom: "8px", fontWeight: 500 }}>
                          Click to upload image
                        </Text>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          JPG, PNG or GIF (max 5MB)
                        </Text>
                      </div>
                    )}
                  </Upload>
                </div>
              </Col>
            </Row>

            <Divider style={{ borderColor: "#e8e0d7", margin: "32px 0" }} />

            {/* Buttons */}
            <div style={{ textAlign: "right", marginTop: "8px" }}>
              <Button
                onClick={() => navigate("/categories")}
                style={{
                  marginRight: "12px",
                  borderRadius: "8px",
                  padding: "0 20px",
                  height: "42px",
                  borderColor: "#d9c7b3",
                  color: "#7a6a58",
                  fontWeight: "500",
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={isSubmitting}
                style={{
                  borderRadius: "8px",
                  padding: "0 20px",
                  height: "42px",
                  background: "linear-gradient(90deg, #5c4033 0%, #7a5d48 100%)",
                  border: "none",
                  fontWeight: "500",
                  boxShadow: "0 4px 12px rgba(92, 64, 51, 0.2)",
                }}
              >
                Create Category
              </Button>
            </div>
          </Form>
        </div>
      </Card>

      <style>
        {`
          .upload-placeholder:hover {
            border-color: #5c4033 !important;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(94, 71, 44, 0.12);
          }
          .image-preview:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(94, 71, 44, 0.2);
          }
          .image-overlay:hover {
            opacity: 1 !important;
          }
        `}
      </style>
    </div>
  );
};

export default CreateCategory;