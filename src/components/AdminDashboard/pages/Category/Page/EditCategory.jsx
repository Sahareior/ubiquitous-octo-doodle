import React, { useEffect, useState } from "react";
import { Form, Input, Button, Upload, message, Card, Row, Col, Divider, Typography } from "antd";
import { UploadOutlined, ArrowLeftOutlined, SaveOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useEditCategoryMutation, useGetCategoriesQuery } from "../../../../../redux/slices/Apis/customersApi";

const { Title, Text } = Typography;

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: cateGoryData } = useGetCategoriesQuery();
  const [editCategory] = useEditCategoryMutation();
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(null);
  const [file, setFile] = useState(null); // Track the uploaded file
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cateGoryData?.results) {
      const category = cateGoryData.results.find((c) => c.id === Number(id));
      if (category) {
        form.setFieldsValue({
          name: category.name,
          slug: category.slug,
          description: category.description,
        });
        setImageUrl(category.image);
      }
    }
  }, [cateGoryData, id, form]);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("slug", values.slug);
      formData.append("description", values.description);
      
      if (file) {
        formData.append("image", file); // Append the file if it exists
      }

      await editCategory({ id, data: formData }).unwrap();
      message.success("Category updated successfully");
      navigate("/categories");
    } catch (error) {
      message.error("Failed to update category");
      console.error("Update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = ({ file: uploadedFile }) => {
    if (uploadedFile.originFileObj) {
      const fileObj = uploadedFile.originFileObj;
      setFile(fileObj); // Store the file object
      setImageUrl(URL.createObjectURL(fileObj));
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      // Validate file type and size
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    onChange: handleImageUpload,
    maxCount: 1,
    showUploadList: false,
  };

  const removeImage = () => {
    setFile(null);
    setImageUrl(null);
    message.info('Image removed');
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


      {/* Main Card */}
      <Card
        style={{
          borderRadius: "16px",
          boxShadow: "0 12px 30px rgba(94, 71, 44, 0.12)",
          maxWidth: "1000px",
          margin: "auto ",
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
            Edit Category
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }}>
            Update your furniture category details
          </Text>
        </div>

        <div style={{ padding: "32px" }}>
          {/* Form */}
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={32}>
              {/* Left side - Form Fields */}
              <Col xs={24} md={14}>
                <div style={{ marginBottom: "32px" }}>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#5c4033",
                      marginBottom: "20px",
                      paddingBottom: "8px",
                      borderBottom: "2px solid #f0e8df",
                    }}
                  >
                    Category Information
                  </h3>
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
                      placeholder="Describe this category of furniture..."
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #d9c7b3",
                        background: "#fcf9f6",
                        resize: "vertical",
                      }}
                    />
                  </Form.Item>
                </div>
              </Col>

              {/* Right side - Image Upload */}
              <Col xs={24} md={10}>
                <div style={{ marginBottom: "32px" }}>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#5c4033",
                      marginBottom: "20px",
                      paddingBottom: "8px",
                      borderBottom: "2px solid #f0e8df",
                    }}
                  >
                    Category Image
                  </h3>
                  <div style={{ marginBottom: "20px" }}>
                    <Upload {...uploadProps}>
                      {imageUrl ? (
                        <div
                          style={{
                            position: "relative",
                            borderRadius: "12px",
                            overflow: "hidden",
                            boxShadow: "0 4px 12px rgba(94, 71, 44, 0.15)",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                          }}
                          className="image-preview"
                        >
                          <img
                            src={imageUrl}
                            alt="category"
                            style={{ width: "100%", height: "200px", objectFit: "cover" }}
                          />
                          <div
                            className="image-overlay"
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
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
                            height: "200px",
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

                    {imageUrl && (
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={removeImage}
                        style={{
                          width: "100%",
                          marginTop: "12px",
                          color: "#f5222d",
                          borderColor: "#ffccc7",
                          borderRadius: "8px",
                          height: "36px",
                        }}
                      >
                        Remove Image
                      </Button>
                    )}
                  </div>

                  <div
                    style={{
                      background: "#f9f0ff",
                      border: "1px solid #d3adf7",
                      borderRadius: "8px",
                      padding: "16px",
                    }}
                  >
                    <h4
                      style={{
                        color: "#722ed1",
                        marginBottom: "12px",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Image Guidelines
                    </h4>
                    <ul
                      style={{
                        color: "#9254de",
                        fontSize: "13px",
                        paddingLeft: "20px",
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      <li>Use high-quality product images</li>
                      <li>Recommended size: 800×800px</li>
                      <li>Show the category's best items</li>
                    </ul>
                  </div>
                </div>
              </Col>
            </Row>

            <Divider style={{ borderColor: "#e8e0d7", margin: "24px 0" }} />

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
                Save Changes
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

export default EditCategory;