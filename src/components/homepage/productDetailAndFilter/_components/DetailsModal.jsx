import React, { useState, useRef } from 'react';
import { Button, Modal, Rate, message, Select, Spin } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { usePostReviewsMutation, useGetCustomerProductsQuery } from '../../../../redux/slices/Apis/customersApi';
import Swal from 'sweetalert2';

const { Option } = Select;

const DetailsModal = ({ isModalOpen, setIsModalOpen }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [files, setFiles] = useState([]); // multiple files
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { data: allProducts, isLoading } = useGetCustomerProductsQuery();
  const [postReviews, { isLoading: isPosting }] = usePostReviewsMutation();

  const handleOk = async () => {
    if (!selectedProduct) {
      Swal.fire({
        title: "No Product Selected",
        text: "Please select a product before submitting your review.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    if (!review.trim()) {
      Swal.fire({
        title: "Review Required",
        text: "Please write a review before submitting.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("product_id", selectedProduct);
    formData.append("rating", rating);
    formData.append("comment", review);

    if (files.length > 0) {
      files.forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      await postReviews(formData).unwrap();

      Swal.fire({
        title: "Success!",
        text: "Your review has been submitted successfully.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        resetForm();
      });
    } catch (err) {
      console.error("Error submitting review:", err);

      Swal.fire({
        title: "Error",
        text: err?.data?.message || "Failed to submit review. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setReview('');
    setRating(0);
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const validFiles = selectedFiles.filter((file) => {
      if (!file.type.match("image.*")) {
        message.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        message.error(`${file.name} exceeds 5MB size limit`);
        return false;
      }
      return true;
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const removeImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal
      title={<p className="text-xl font-semibold px-6 py-4 bg-[#FAF8F2]">Write a Review</p>}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      centered
      width={600}
    >
      <div className="p-6 space-y-6">
        {/* Product Select */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Product</label>
          {isLoading ? (
            <Spin />
          ) : (
            <Select
              showSearch
              placeholder="Search and select a product"
              optionFilterProp="children"
              value={selectedProduct}
              onChange={setSelectedProduct}
              className="w-full"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {allProducts?.results?.map((prod) => (
                <Option key={prod.id} value={prod.id}>
                  {prod.name}
                </Option>
              ))}
            </Select>
          )}
        </div>

        {/* Review Textarea */}
        <div>
          <label className="block text-sm font-medium mb-1">Your Review</label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
            rows={4}
            placeholder="Write your thoughts about the product..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Upload Product Images (Optional)</label>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleUploadClick}
              icon={<UploadOutlined />}
              className="bg-[#676767] text-white"
            >
              Choose Files
            </Button>
            <input
              id="uploadFile"
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
              multiple
            />
          </div>

          {/* Preview Images */}
          {files.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              {files.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="h-24 w-full object-cover rounded-md border"
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-white shadow rounded-full"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium mb-1">Your Rating</label>
          <Rate
            onChange={setRating}
            value={rating}
            className="text-[#CBA135] text-xl"
          />
        </div>

        {/* Submit Button */}
        <div className="text-center mt-6">
          <Button
            onClick={handleOk}
            className="bg-[#CBA135] text-white px-10"
            disabled={!selectedProduct || !review.trim() || isUploading}
            loading={isPosting || isUploading}
          >
            Submit
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DetailsModal;
