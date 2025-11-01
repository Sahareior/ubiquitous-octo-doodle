import React, { useEffect, useState } from "react";
import { FaCloudUploadAlt, FaInfoCircle, FaStar, FaBox, FaShippingFast, FaUndo } from "react-icons/fa";
import { MdDiscount, MdPayment } from "react-icons/md";
import imageCompression from "browser-image-compression";
import Breadcrumb from "../../others/Breadcrumb";
import Swal from "sweetalert2";
import { Select, Collapse, Spin } from "antd";
import { useGetDeleveredOrdersQuery, useReturnProductMutation } from "../../../redux/slices/Apis/customersApi";
import { useAllOrdersQuery } from "../../../redux/slices/apiSlice";
import { useNavigate } from "react-router-dom";

const { Panel } = Collapse;

const ReturnExchangeForm = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reason, setReason] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [images, setImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [returnProduct] = useReturnProductMutation();
  const { data: getDeleveryedProduct, isLoading } = useGetDeleveredOrdersQuery();
  const { data: allOrders } = useAllOrdersQuery();

  const navigate = useNavigate()


useEffect(() => {
  const userType = localStorage.getItem('user_role');
  
  if (!userType) {
    Swal.fire({
      title: "Access Denied!",
      text: "You need to log in first to return a product.",
      icon: "warning",
      confirmButtonText: "Go to Home",
    }).then(() => {
      navigate("/");
    });
  }
}, [navigate]);


  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get delivered order items from the delivered orders API
  const deliveredOrderItems = getDeleveryedProduct?.results || [];

  // Get all orders to show in the order dropdown
  const orders = allOrders?.results || [];

  // Filter orders that have delivered items
  const ordersWithDeliveredItems = orders.filter(order => 
    order.items?.some(item => 
      deliveredOrderItems.some(deliveredItem => deliveredItem.id === item.id)
    )
  );

  // Get delivered items for the selected order
  const getDeliveredItemsForOrder = (orderId) => {
    if (!orderId) return [];
    
    const order = orders.find(o => o.id === orderId);
    if (!order?.items) return [];
    
    return order.items.filter(item => 
      deliveredOrderItems.some(deliveredItem => deliveredItem.id === item.id)
    );
  };

  // Fixed image upload with proper file extension handling
const handleImageUpload = async (e) => {
  const files = Array.from(e?.target?.files || []);
  
  // Validation
  if (files.length + (images?.length || 0) > 5) {
    Swal.fire("Limit Exceeded!", "You can upload maximum 5 images.", "warning");
    return;
  }

  // Set loading state
  setIsUploading(true);
  
  const compressedImages = [];
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
  };

  try {
    // Process files sequentially to show progress
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Update progress for current file
      setUploadProgress({
        current: i + 1,
        total: files.length,
        fileName: file.name
      });

      if (file.size > 7 * 1024 * 1024) {
        Swal.fire("File Too Large!", `${file.name} exceeds 7MB limit.`, "warning");
        continue;
      }

      try {
        const compressedFile = await imageCompression(file, options);
        
        // Create a new File object with proper name and type
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop().toLowerCase();
        const newFile = new File([compressedFile], fileName, {
          type: file.type,
          lastModified: Date.now(),
        });

        const preview = URL.createObjectURL(compressedFile);

        compressedImages.push({
          file: newFile,
          preview,
          name: fileName,
        });
      } catch (err) {
        console.error("Image compression failed:", err);
        // Fallback: use original file
        const preview = URL.createObjectURL(file);
        compressedImages.push({
          file,
          preview,
          name: file.name,
        });
      }
    }

    // Update images state
    setImages((prev) => [...(prev || []), ...compressedImages]);
    
    // Show success message if any images were processed

    
  } catch (error) {
    console.error("Upload process failed:", error);
    Swal.fire("Upload Failed!", "Something went wrong during image upload.", "error");
  } finally {
    // Reset loading states
    setIsUploading(false);
    setUploadProgress(null);
    e.target.value = ""; // Reset file input
  }
};

  const handleImageRemove = (index) => {
    const newImages = [...(images || [])];
    URL.revokeObjectURL(newImages?.[index]?.preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (!selectedOrder?.id || !selectedProduct?.id) {
      Swal.fire("Select an order & product!", "Please choose a product to return.", "warning");
      return;
    }
    if (!reason?.trim()) {
      Swal.fire("Enter a reason!", "Please provide a reason for return.", "warning");
      return;
    }
    if (!additionalInfo?.trim()) {
      Swal.fire("Description required!", "Please provide a detailed description.", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("order_item", selectedProduct?.id);
    formData.append("description", additionalInfo);
    formData.append("reason", reason);
    
    // Append images with proper file objects
    images?.forEach((img) => {
      formData.append("uploaded_images", img?.file);
    });

    try {
      const res = await returnProduct(formData);

      if (res?.error) {
        Swal.fire("Error!", res?.error?.data?.message || "Something went wrong.", "error");
        return;
      }

      Swal.fire("Success!", "Return request submitted successfully.", "success");

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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={i < rating ? "text-yellow-500" : "text-gray-300"}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CBA135]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F2] min-h-screen">
      <div className="md:mx-20 mx-4">
        <Breadcrumb />
      </div>
      <div className="md:mx-20 pb-11 px-4">
        <div className="bg-[#EAE7E1] w-full py-8 md:p-6 rounded-md">
          <h2 className="text-center popbold text-xl md:text-2xl font-semibold text-gray-800 mb-6">
            Return / Exchange Request
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                {/* Order Select */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-gray-800 font-medium">
                    <span className="bg-[#CBA135] text-white w-6 h-6 flex items-center justify-center rounded-full text-sm">
                      1
                    </span>
                    Select Order
                  </label>
                  <Select
                    showSearch
                    placeholder="Search and select order"
                    value={selectedOrder?.id}
                    onChange={(value) => {
                      const order = ordersWithDeliveredItems.find((o) => o?.id === value);
                      setSelectedOrder(order || null);
                      setSelectedProduct(null);
                    }}
                    options={ordersWithDeliveredItems.map((o) => ({
                      value: o?.id,
                      label: `Order #${o?.order_id} - ${o?.items?.length || 0} items`,
                    }))}
                    className="w-full"
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Only orders with delivered items are shown
                  </p>
                </div>

                {/* Order details */}
                {selectedOrder && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-3">Order Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Order ID:</p>
                        <p className="font-medium text-gray-800">#{selectedOrder?.order_id}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Order Date:</p>
                        <p className="font-medium text-gray-800">
                          {new Date(selectedOrder?.order_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Amount:</p>
                        <p className="font-medium text-gray-800">${selectedOrder?.total_amount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status:</p>
                        <p className="font-medium text-gray-800">{selectedOrder?.order_status_display}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Product Select */}
                {selectedOrder && (
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-gray-800 font-medium">
                      <span className="bg-[#CBA135] text-white w-6 h-6 flex items-center justify-center rounded-full text-sm">
                        2
                      </span>
                      Select Product from Order
                    </label>
                    <Select
                      showSearch
                      placeholder="Search and select product"
                      value={selectedProduct?.id}
                      onChange={(value) => {
                        const deliveredItems = getDeliveredItemsForOrder(selectedOrder.id);
                        const product = deliveredItems.find((item) => item?.id === value);
                        setSelectedProduct(product || null);
                      }}
                      options={getDeliveredItemsForOrder(selectedOrder.id).map((item) => ({
                        value: item?.id,
                        label: `${item?.product?.name} - Qty: ${item?.quantity}`,
                      }))}
                      className="w-full"
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                    <p className="text-xs text-gray-500">
                      {getDeliveredItemsForOrder(selectedOrder.id).length} delivered products available
                    </p>
                  </div>
                )}

                {/* Product details for selected product */}
                {selectedProduct && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-medium text-blue-800 mb-3">Selected Product</h3>
                    <div className="flex items-center gap-4">
                      {selectedProduct?.product?.images?.[0] && (
                        <img
                          src={selectedProduct.product.images[0].image}
                          alt={selectedProduct.product.name}
                          className="w-16 h-16 object-cover rounded-lg border border-blue-200"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-blue-900">{selectedProduct?.product?.name}</p>
                        <p className="text-sm text-blue-700">
                          Quantity: {selectedProduct?.quantity} × ${selectedProduct?.price}
                        </p>
                        <p className="text-sm font-semibold text-blue-900">
                          Total: ${(selectedProduct?.quantity * parseFloat(selectedProduct?.price || 0)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reason */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-gray-800 font-medium">
                    <span className="bg-[#CBA135] text-white w-6 h-6 flex items-center justify-center rounded-full text-sm">
                      3
                    </span>
                    Reason for Return
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e?.target?.value || "")}
                    placeholder="Enter a reason (e.g., Damaged product, Wrong item, etc.)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CBA135] focus:border-transparent transition"
                  />
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-gray-800 font-medium">
                    <span className="bg-[#CBA135] text-white w-6 h-6 flex items-center justify-center rounded-full text-sm">
                      4
                    </span>
                    Description (Required)
                  </label>
                  <textarea
                    rows={5}
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e?.target?.value || "")}
                    placeholder="Please describe the issue in detail. Include information about any damages, defects, or reasons for return..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#CBA135] focus:border-transparent transition"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    This field is required. Please provide a detailed description of why you're returning this product.
                  </p>
                </div>

                {/* Upload */}
{
  isUploading? <div><div className="upload-status">
          <div className="status-info">
            <Spin size="small" />
            <span>Processing images... ({uploadProgress?.current}/{uploadProgress?.total})</span>
          </div>
        </div></div> :                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-gray-800 font-medium">
                    <span className="bg-[#CBA135] text-white w-6 h-6 flex items-center justify-center rounded-full text-sm">
                      5
                    </span>
                    Upload Photos (Optional)
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#CBA135] transition group bg-white"
                    onClick={() => document?.getElementById("fileInput")?.click()}
                  >
                    <FaCloudUploadAlt size={40} className="mx-auto mb-3 text-gray-400 group-hover:text-[#CBA135] transition" />
                    <p className="text-gray-600 font-medium">Drag and drop images here, or click to browse</p>
                    <p className="text-sm text-gray-400 mt-2">
                      PNG, JPG up to 7MB • Max 5 images • {images?.length || 0}/5 used
                    </p>
                  </div>
                  <input
                    id="fileInput"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  {/* Enhanced Image Preview */}
                  {images?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Uploaded Images ({images.length}/5):</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {images.map((img, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                              <img
                                src={img.preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                              <button
                                type="button"
                                className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-all transform scale-75 group-hover:scale-100 hover:bg-red-600"
                                onClick={() => handleImageRemove(index)}
                              >
                                ×
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-1 px-1">
                              {img.name || `Image ${index + 1}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
}

                {/* Submit */}
                <div className="pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={
                      !selectedOrder?.id || !selectedProduct?.id || !reason?.trim() || !additionalInfo?.trim()
                    }
                    className="w-full bg-[#CBA135] text-white font-semibold py-4 rounded-lg hover:bg-yellow-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Submit Return Request
                  </button>
                </div>
              </div>
            </div>

            {/* Right column - Product Overview */}
            <div className="lg:col-span-1">
              {selectedProduct ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                  <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-3 flex items-center gap-2">
                    <FaInfoCircle className="text-[#CBA135]" />
                    Product Overview
                  </h3>

                  {/* Product Image Gallery */}
                  {selectedProduct?.product?.images?.length > 0 && (
                    <div className="mb-6">
                      <div className="relative h-48 w-full rounded-lg overflow-hidden mb-3 bg-gray-100">
                        <img
                          src={selectedProduct?.product?.images?.[0]?.image}
                          alt={selectedProduct?.product?.name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {selectedProduct?.product?.images?.map((img, index) => (
                          <img
                            key={index}
                            src={img?.image}
                            alt={`Preview ${index + 1}`}
                            className="w-12 h-12 object-cover rounded border border-gray-200 cursor-pointer hover:border-[#CBA135] transition flex-shrink-0"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Basic Info */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 text-lg mb-2">{selectedProduct?.product?.name}</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
                        {renderStars(Math.round(selectedProduct?.product?.average_rating || 0))}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({selectedProduct?.product?.reviews?.length || 0} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-2xl font-bold text-[#CBA135]">
                        ${selectedProduct?.product?.new_price || selectedProduct?.price}
                      </span>
                      {selectedProduct?.product?.old_price && selectedProduct?.product?.old_price !== selectedProduct?.product?.new_price && (
                        <span className="text-sm text-gray-500 line-through">
                          ${selectedProduct?.product?.old_price}
                        </span>
                      )}
                      {selectedProduct?.product?.promotion_discount_value && (
                        <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded">
                          Save ${selectedProduct?.product?.promotion_discount_value}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Tabs */}
                  <div className="border-b border-gray-200 mb-4">
                    <div className="flex -mb-px">
                      <button
                        className={`py-2 px-4 font-medium text-sm flex-1 text-center ${activeTab === "details" ? "border-b-2 border-[#CBA135] text-[#CBA135]" : "text-gray-600 hover:text-gray-800"}`}
                        onClick={() => setActiveTab("details")}
                      >
                        Details
                      </button>
                      <button
                        className={`py-2 px-4 font-medium text-sm flex-1 text-center ${activeTab === "specs" ? "border-b-2 border-[#CBA135] text-[#CBA135]" : "text-gray-600 hover:text-gray-800"}`}
                        onClick={() => setActiveTab("specs")}
                      >
                        Specifications
                      </button>
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="max-h-60 overflow-y-auto">
                    {activeTab === "details" && (
                      <div className="space-y-4 pr-2">
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FaBox className="text-gray-500 text-sm" />
                            Product Description
                          </h5>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {selectedProduct?.product?.short_description || "No description available."}
                          </p>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FaShippingFast className="text-gray-500 text-sm" />
                            Delivery Info
                          </h5>
                          <p className="text-sm text-gray-600">
                            Estimated delivery: {selectedProduct?.product?.estimated_delivery_days} days
                          </p>
                          <div className="flex gap-2 mt-2">
                            {selectedProduct?.product?.home_delivery && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Home Delivery</span>
                            )}
                            {selectedProduct?.product?.pickup && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Pickup</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <MdPayment className="text-gray-500 text-sm" />
                            Order Details
                          </h5>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-gray-600">Quantity:</span>
                            <span className="font-medium text-gray-800">{selectedProduct?.quantity}</span>
                            <span className="text-gray-600">Unit Price:</span>
                            <span className="font-medium text-gray-800">${selectedProduct?.price}</span>
                            <span className="text-gray-600">Total:</span>
                            <span className="font-medium text-gray-800">
                              ${(selectedProduct?.quantity * parseFloat(selectedProduct?.price || 0)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "specs" && selectedProduct?.product?.specifications && (
                      <div className="space-y-3 pr-2">
                        {Object.entries(selectedProduct.product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span className="font-medium text-gray-800 text-right">{value || "N/A"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Vendor Info */}
                  <Collapse ghost className="mt-6 bg-gray-50 rounded-lg">
                    <Panel 
                      header={
                        <span className="font-medium text-gray-700">Vendor Information</span>
                      } 
                      key="1"
                    >
                      <div className="space-y-3 text-sm pt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium text-gray-800">
                            {selectedProduct?.product?.vendor_details?.first_name}{" "}
                            {selectedProduct?.product?.vendor_details?.last_name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium text-gray-800">{selectedProduct?.product?.vendor_details?.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`font-medium ${selectedProduct?.product?.vendor_details?.is_online ? 'text-green-600' : 'text-gray-600'}`}>
                            {selectedProduct?.product?.vendor_details?.is_online ? "Online" : "Offline"}
                          </span>
                        </div>
                      </div>
                    </Panel>
                  </Collapse>

                  {/* Return Policy */}
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h5 className="font-medium text-yellow-800 mb-2 flex items-center gap-2 text-sm">
                      <FaUndo className="text-yellow-600" />
                      Return Policy
                    </h5>
                    <p className="text-xs text-yellow-700 leading-relaxed">
                      This product is eligible for return within 30 days of delivery. Please ensure the product is in its original condition with all tags attached.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center h-full flex flex-col justify-center items-center min-h-[400px]">
                  <div className="text-gray-400 mb-4">
                    <FaInfoCircle size={48} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Product Selected</h3>
                  <p className="text-gray-500 text-sm">
                    Please select an order and choose a product to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnExchangeForm;