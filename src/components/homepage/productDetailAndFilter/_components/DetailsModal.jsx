import React, { useState, useRef } from 'react';
import { Button, Modal, Rate, message, Select, Spin, Image, Row, Col } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import { useGetCustomerProductsQuery, useGetReviewsQuery, usePostReviewsMutation } from '../../../../redux/slices/Apis/customersApi';

const { Option } = Select;

const DetailsModal = ({ isModalOpen, setIsModalOpen,id }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const fileInputRef = useRef(null);
  const { data: apiReviews, error, refetch } = useGetReviewsQuery();
  const { data: allProducts, isLoading } = useGetCustomerProductsQuery();
  const [postReviews, { isLoading: isPosting }] = usePostReviewsMutation();

  const MAX_IMAGES = 5;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check if adding these files would exceed the maximum
    if (uploadedImages.length + files.length > MAX_IMAGES) {
      message.error(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.match('image.*')) {
        message.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        message.error(`${file.name} exceeds 5MB size limit`);
        return false;
      }
      return true;
    });

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random(),
    }));

    setUploadedImages(prev => [...prev, ...newImages]);
    e.target.value = '';
  };

  const handleImageRemove = (id) => {
    setUploadedImages(prev => {
      const removedImage = prev.find(img => img.id === id);
      if (removedImage) URL.revokeObjectURL(removedImage.preview);
      return prev.filter(img => img.id !== id);
    });
  };

  const handlePreview = (img) => {
    setPreviewImage(img.preview);
    setPreviewVisible(true);
  };

  const handleUploadClick = () => {
    if (uploadedImages.length >= MAX_IMAGES) {
      message.info(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleOk = async () => {
    // if (!selectedProduct) {
    //   Swal.fire("No Product Selected", "Please select a product before submitting your review.", "warning");
    //   return;
    // }
    if (!review.trim()) {
      Swal.fire("Review Required", "Please write a review before submitting.", "warning");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
     if(id){
        formData.append("product_id", id);
     }
     else{
        formData.append("product_id", selectedProduct);
     }
      formData.append("rating", rating);
      formData.append("comment", review);
      uploadedImages.forEach(image => formData.append("uploaded_images", image.file));

      await postReviews(formData).unwrap();
      refetch(); // Refresh reviews after successful submission
      Swal.fire("Success!", "Your review has been submitted successfully.", "success").then(resetForm);
    } catch (err) {
      console.error("Error submitting review:", err);
      Swal.fire("Error", err?.data?.message || "Failed to submit review. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setReview('');
    setRating(0);
    uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
    setUploadedImages([]);
    setIsModalOpen(false);
  };

  return (
    <>
      <Modal
        title={<p className="text-xl font-semibold px-6 py-4 bg-[#FAF8F2] rounded-t-md">Write a Review</p>}
        open={isModalOpen}
        onCancel={resetForm}
        footer={null}
        centered
        width={700}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
        bodyStyle={{ padding: '2rem' }}
      >
        <div className="space-y-6">
          {/* Product Select */}
{
  !id && (          <div>
            <label className="block text-sm font-medium mb-2">Select Product</label>
            {isLoading ? <Spin /> : (
              <Select
                showSearch
                placeholder="Search and select a product"
                value={selectedProduct}
                onChange={setSelectedProduct}
                className="w-full rounded-md shadow-sm"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {allProducts?.results?.map(prod => (
                  <Option key={prod.id} value={prod.id}>{prod.name}</Option>
                ))}
              </Select>
            )}
          </div>
  )
}

          {/* Review Textarea */}
          <div>
            <label className="block text-sm font-medium mb-2">Your Review</label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm"
              rows={4}
              placeholder="Write your thoughts about the product..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">Your Rating</label>
            <Rate
              onChange={setRating}
              value={rating}
              className="text-[#CBA135] text-xl"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Product Images (Optional)
              <span className="text-xs text-gray-500 ml-2">
                {uploadedImages.length}/{MAX_IMAGES}
              </span>
            </label>
            <div className="mb-3 flex items-center gap-3">
              <Button
                onClick={handleUploadClick}
                icon={<UploadOutlined />}
                className="bg-[#676767] hover:bg-gray-800 text-white shadow"
                disabled={uploadedImages.length >= MAX_IMAGES}
              >
                Choose Files
              </Button>
              <p className="text-xs text-gray-500">Supports multiple images. Max 5MB each.</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
              multiple
            />

            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 font-medium">Preview:</h4>
                <Row gutter={[12, 12]}>
                  {uploadedImages.map(img => (
                    <Col xs={12} sm={8} md={6} key={img.id}>
                      <div className="relative border rounded-md p-1 h-40 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow bg-gray-50">
                        <Image
                          src={img.preview}
                          alt="Preview"
                          className="object-contain h-full w-full rounded"
                          preview={{
                            visible: false,
                            mask: (
                              <div className="flex items-center justify-center">
                                <EyeOutlined className="text-white mr-1" />
                                Preview
                              </div>
                            ),
                          }}
                          onClick={() => handlePreview(img)}
                        />
                        <div className="absolute top-1 right-1 flex flex-col gap-1">
   
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleImageRemove(img.id)}
                            className="bg-red-500 shadow rounded-full hover:bg-red-100"
                          />
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="text-center mt-6">
            <Button
              onClick={handleOk}
              className="bg-[#CBA135] hover:bg-[#b38f29] text-white px-10 py-2 rounded-md shadow-md"
           
              loading={isPosting }
            >
              Submit Review
            </Button>
          </div>
        </div>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        bodyStyle={{ padding: 0, background: 'rgba(0,0,0,0.9)' }}
        width="auto"
        centered
        closable={false}
      >
        <div className="relative">
          <img
            alt="Preview"
            style={{ maxHeight: '80vh', maxWidth: '80vw' }}
            src={previewImage}
          />
          <Button
            type="text"
            icon={<DeleteOutlined className='' />}
            onClick={() => setPreviewVisible(false)}
            className="absolute top-2 right-2 text-white bg-black bg-opacity-50 hover:bg-opacity-70"
            size="large"
          />
        </div>
      </Modal>
    </>
  );
};

export default DetailsModal;