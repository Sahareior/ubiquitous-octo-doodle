import React, { useState, useRef } from 'react';
import { Button, Modal, Rate, message, Select, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { usePostReviewsMutation } from '../../../../redux/slices/Apis/customersApi';
import { useGetCustomerProductsQuery } from '../../../../redux/slices/Apis/customersApi';

const { Option } = Select;

const DetailsModal = ({ isModalOpen, setIsModalOpen }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { data: allProducts, isLoading } = useGetCustomerProductsQuery();
  const [postReviews, { isLoading: isPosting }] = usePostReviewsMutation();

  const handleOk = async () => {
    if (!selectedProduct) {
      message.error('Please select a product.');
      return;
    }
    if (!review.trim()) {
      message.error('Please write a review before submitting.');
      return;
    }

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('product', selectedProduct);
    formData.append('rating', rating);
    formData.append('comment', review);
    if (file) {
      formData.append('image', file);
    }

    try {
      await postReviews(formData).unwrap();
      message.success('Review submitted successfully!');
      resetForm();
    } catch (err) {
      console.error('Error submitting review:', err);
      message.error(err.data?.message || 'Failed to submit review.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setReview('');
    setRating(0);
    setFileName('');
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.match('image.*')) {
        message.error('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      // Validate file size (e.g., 5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        message.error('File size must be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
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
          <label className="block text-sm font-medium mb-1">Upload Product Image (Optional)</label>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleUploadClick}
              icon={<UploadOutlined />}
              className="bg-[#676767] text-white"
            >
              Choose File
            </Button>
            <input
              id="uploadFile"
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
            <input
              disabled
              value={fileName || 'No file selected'}
              className="flex-1 border px-3 py-1 rounded-md text-sm text-gray-600 bg-white"
            />
          </div>
          {file && (
            <div className="mt-2">
              <img 
                src={URL.createObjectURL(file)} 
                alt="Preview" 
                className="max-h-20 max-w-full object-contain"
              />
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