import React, { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import Breadcrumb from "../../others/Breadcrumb";
import Swal from "sweetalert2";
import { Select } from "antd";
import { useGetDeleveredOrdersQuery, useReturnProductMutation } from "../../../redux/slices/Apis/customersApi";

const ReturnExchangeForm = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reason, setReason] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [images, setImages] = useState([]);
  const [returnProduct] = useReturnProductMutation();
  const { data: getDeleveryedProduct, isLoading } = useGetDeleveredOrdersQuery();

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages([...images, ...newImages]);
  };

  const handleImageRemove = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (!selectedOrder || !selectedProduct) {
      Swal.fire("Select an order & product!", "Please choose a product to return.", "warning");
      return;
    }
    if (!reason.trim()) {
      Swal.fire("Enter a reason!", "Please provide a reason for return.", "warning");
      return;
    }

    // Create FormData object
    const formData = new FormData();
    
    // Use the correct order_item ID from the delivered product
    formData.append("order_item", selectedProduct.id);
    formData.append("description", additionalInfo || reason);
    images.forEach((img) => {
      formData.append("uploaded_images", img.file);
    });

    try {
      const res = await returnProduct(formData); 
      console.log("Response:", res);
      
      if (res.error) {
        Swal.fire("Error!", res.error.data?.message || "Something went wrong.", "error");
        return;
      }
      
      Swal.fire("Success!", "Return request submitted.", "success");

      // Reset form
      setSelectedOrder(null);
      setSelectedProduct(null);
      setReason("");
      setAdditionalInfo("");
      setImages([]);
    } catch (error) {
      console.error("Submission error:", error);
      Swal.fire("Error!", "Something went wrong.", "error");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-[#FAF8F2] min-h-screen">
      <div className="px-6">
        <Breadcrumb />
      </div>
      <div className="flex items-center justify-center max-w-3xl mx-auto pb-11 px-4">
        <div className="bg-[#EAE7E1] w-full py-12 p-6 rounded-md">
          <h2 className="text-center popbold text-xl md:text-2xl font-semibold text-gray-800 mb-6">
            Return / Exchange Request
          </h2>

          <div className="w-full rounded-md p-5 space-y-4">
            {/* Order Select */}
            <div className="bg-white p-5 rounded-md">
              <label className="flex items-center gap-2 text-gray-800 font-medium mb-1">
                <span className="bg-[#CBA135] text-white w-5 h-5 flex items-center justify-center rounded-full text-sm">
                  1
                </span>
                Select Order
              </label>
              <Select
                showSearch
                placeholder="Search and select order"
                value={selectedOrder?.id}
                onChange={(value) => {
                  const order = getDeleveryedProduct.results.find((o) => o.id === value);
                  setSelectedOrder(order);
                  setSelectedProduct(null); // Reset product when order changes
                }}
                options={getDeleveryedProduct?.results?.map((o) => ({
                  value: o.id,
                  label: `Order Item #${o.id} - ${o.product.name}`,
                }))}
                className="w-full"
              />
            </div>

            {/* Display selected order details */}
            {selectedOrder && (
              <div className="bg-white p-5 rounded-md">
                <h3 className="font-medium mb-2">Order Details:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Order Item ID:</p>
                    <p className="font-medium">#{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Product:</p>
                    <p className="font-medium">{selectedOrder.product.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Quantity:</p>
                    <p className="font-medium">{selectedOrder.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Price:</p>
                    <p className="font-medium">${selectedOrder.price}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Product Select (depends on selected order) */}
            {selectedOrder && (
              <div className="bg-white p-5 rounded-md">
                <label className="flex items-center gap-2 text-gray-800 font-medium mb-1">
                  <span className="bg-[#CBA135] text-white w-5 h-5 flex items-center justify-center rounded-full text-sm">
                    2
                  </span>
                  Select Product from Order
                </label>
                <Select
                  showSearch
                  placeholder="Search and select product"
                  value={selectedProduct?.id}
                  onChange={(value) => {
                    // Since we're using delivered products, each "order" is actually an order item with a product
                    const product = getDeleveryedProduct.results.find((item) => item.id === Number(value));
                    setSelectedProduct(product);
                  }}
                  options={
                    getDeleveryedProduct?.results?.map((item) => ({
                      value: item.id,
                      label: item.product.name,
                    })) || []
                  }
                  className="w-full"
                />
              </div>
            )}

            {/* Display selected product details */}
            {selectedProduct && (
              <div className="bg-white p-5 rounded-md">
                <h3 className="font-medium mb-2">Selected Product Details:</h3>
                <div className="flex items-center gap-3">
                  {selectedProduct.product.images && selectedProduct.product.images.length > 0 && (
                    <img 
                      src={selectedProduct.product.images[0].image} 
                      alt={selectedProduct.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium">{selectedProduct.product.name}</p>
                    <p className="text-sm">Quantity: {selectedProduct.quantity}</p>
                    <p className="text-sm">Price: ${selectedProduct.price}</p>
                    <p className="text-sm">SKU: {selectedProduct.product.sku}</p>
                    <p className="text-sm">Vendor: {selectedProduct.product.vendor_details.first_name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reason Input */}
            <div className="bg-white p-5 rounded-md">
              <label className="flex items-center gap-2 text-gray-800 font-medium mb-1">
                <span className="bg-[#CBA135] text-white w-5 h-5 flex items-center justify-center rounded-full text-sm">
                  3
                </span>
                Reason for Return
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter a reason..."
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none"
              />
            </div>

            {/* Additional Details - Renamed to Description */}
            <div className="bg-white p-5 rounded-md">
              <label className="flex items-center gap-2 text-gray-800 font-medium mb-1">
                <span className="bg-[#CBA135] text-white w-5 h-5 flex items-center justify-center rounded-full text-sm">
                  4
                </span>
                Description (Required)
              </label>
              <textarea
                rows={5}
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Please describe the issue in detail..."
                className="w-full px-4 py-2 border rounded-md resize-none border-[#E5E7EB]"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This field is required. Please provide a detailed description of why you're returning this product.
              </p>
            </div>

            {/* Upload Photos */}
            <div className="bg-white p-5 rounded-md">
              <label className="flex items-center gap-2 text-gray-800 font-medium mb-1">
                <span className="bg-[#CBA135] text-white w-5 h-5 flex items-center justify-center rounded-full text-sm">
                  5
                </span>
                Upload Photos (Optional)
              </label>
              <div
                className="border-2 border-dashed flex flex-col justify-center border-gray-300 rounded-md p-4 text-center py-10 text-sm text-gray-500 bg-white cursor-pointer hover:border-yellow-400 transition"
                onClick={() => document.getElementById("fileInput").click()}
              >
                <FaCloudUploadAlt size={35} className="mx-auto mb-2" />
                <p>Drag and drop images here, or click to browse</p>
                <p className="text-xs mt-1 text-gray-400">PNG, JPG up to 7MB</p>
              </div>
              <input
                id="fileInput"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

              <div className="flex gap-2 mt-2 flex-wrap">
                {images.map((img, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <img
                      src={img.preview}
                      alt="preview"
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      onClick={() => handleImageRemove(index)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={!selectedOrder || !selectedProduct || !reason.trim() || !additionalInfo.trim()}
                className="w-96 bg-[#CBA135] mx-auto text-white font-semibold py-2 rounded hover:bg-yellow-500 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Submit Return Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnExchangeForm;