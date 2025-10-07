import React, { useEffect, useState } from "react";
import { FaCloudUploadAlt, FaInfoCircle, FaStar, FaBox, FaShippingFast, FaUndo } from "react-icons/fa";
import { MdDiscount, MdPayment } from "react-icons/md";
import Breadcrumb from "../../others/Breadcrumb";
import Swal from "sweetalert2";
import { Select, Collapse } from "antd";
import { useGetDeleveredOrdersQuery, useReturnProductMutation } from "../../../redux/slices/Apis/customersApi";

const { Panel } = Collapse;

const ReturnExchangeForm = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reason, setReason] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [images, setImages] = useState([]);
  const [activeTab, setActiveTab] = useState("details");
  const [returnProduct] = useReturnProductMutation();
  const { data: getDeleveryedProduct, isLoading } = useGetDeleveredOrdersQuery();

console.log(getDeleveryedProduct,'ad')
  useEffect(()=>{
    window.scrollTo(0,0)
  },[])

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e?.target?.files || []);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages([...(images || []), ...newImages]);
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

    const formData = new FormData();

    formData.append("order_item", selectedProduct?.id);
    formData.append("description", additionalInfo || reason);
    images?.forEach((img) => {
      formData.append("uploaded_images", img?.file);
    });

    try {
      const res = await returnProduct(formData);
      // console.log("Response:", res);

      if (res?.error) {
        Swal.fire("Error!", res?.error?.data?.message || "Something went wrong.", "error");
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

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={i <= rating ? "text-yellow-500" : "text-gray-300"}
        />
      );
    }
    return stars;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="bg-[#FAF8F2] min-h-screen">
      <div className="px-6">
        <Breadcrumb />
      </div>
      <div className="max-w-8xl mx-auto pb-11 px-4">
        <div className="bg-[#EAE7E1] w-full py-8 p-6 rounded-md">
          <h2 className="text-center popbold text-xl md:text-2xl font-semibold text-gray-800 mb-6">
            Return / Exchange Request
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-md p-5 space-y-4">
                {/* Order Select */}
                <div className="bg-white p-5 rounded-md border border-gray-200">
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
                      const order = getDeleveryedProduct?.results?.find((o) => o?.id === value);
                      setSelectedOrder(order || null);
                      setSelectedProduct(null);
                    }}
                    options={
                      getDeleveryedProduct?.results?.map((o) => ({
                        value: o?.id,
                        label: `Order #${o?.id} - ${o?.product?.name}`,
                      })) || []
                    }
                    className="w-full"
                  />
                </div>

                {/* Order details */}
                {selectedOrder && (
                  <div className="bg-white p-5 rounded-md border border-gray-200">
                    <h3 className="font-medium mb-2">Order Details:</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Order Item ID:</p>
                        <p className="font-medium">#{selectedOrder?.id}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Product:</p>
                        <p className="font-medium">{selectedOrder?.product?.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Quantity:</p>
                        <p className="font-medium">{selectedOrder?.quantity}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Price:</p>
                        <p className="font-medium">${selectedOrder?.price}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Product Select */}
                {selectedOrder && (
                  <div className="bg-white p-5 rounded-md border border-gray-200">
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
                        const product = getDeleveryedProduct?.results?.find((item) => item?.id === Number(value));
                        setSelectedProduct(product || null);
                      }}
                      options={
                        getDeleveryedProduct?.results?.map((item) => ({
                          value: item?.id,
                          label: item?.product?.name,
                        })) || []
                      }
                      className="w-full"
                    />
                  </div>
                )}

                {/* Reason */}
                <div className="bg-white p-5 rounded-md border border-gray-200">
                  <label className="flex items-center gap-2 text-gray-800 font-medium mb-1">
                    <span className="bg-[#CBA135] text-white w-5 h-5 flex items-center justify-center rounded-full text-sm">
                      3
                    </span>
                    Reason for Return
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e?.target?.value || "")}
                    placeholder="Enter a reason..."
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CBA135]"
                  />
                </div>

                {/* Description */}
                <div className="bg-white p-5 rounded-md border border-gray-200">
                  <label className="flex items-center gap-2 text-gray-800 font-medium mb-1">
                    <span className="bg-[#CBA135] text-white w-5 h-5 flex items-center justify-center rounded-full text-sm">
                      4
                    </span>
                    Description (Required)
                  </label>
                  <textarea
                    rows={5}
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e?.target?.value || "")}
                    placeholder="Please describe the issue in detail..."
                    className="w-full px-4 py-2 border rounded-md resize-none border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#CBA135]"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This field is required. Please provide a detailed description of why you're returning this product.
                  </p>
                </div>

                {/* Upload */}
                <div className="bg-white p-5 rounded-md border border-gray-200">
                  <label className="flex items-center gap-2 text-gray-800 font-medium mb-1">
                    <span className="bg-[#CBA135] text-white w-5 h-5 flex items-center justify-center rounded-full text-sm">
                      5
                    </span>
                    Upload Photos (Optional)
                  </label>
                  <div
                    className="border-2 border-dashed flex flex-col justify-center border-gray-300 rounded-md p-4 text-center py-10 text-sm text-gray-500 bg-white cursor-pointer hover:border-yellow-400 transition"
                    onClick={() => document?.getElementById("fileInput")?.click()}
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
                    {images?.map((img, index) => (
                      <div key={index} className="relative w-20 h-20">
                        <img
                          src={img?.preview}
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

                {/* Submit */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={
                      !selectedOrder?.id || !selectedProduct?.id || !reason?.trim() || !additionalInfo?.trim()
                    }
                    className="w-full max-w-md bg-[#CBA135] mx-auto text-white font-semibold py-3 rounded-md hover:bg-yellow-500 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Submit Return Request
                  </button>
                </div>
              </div>
            </div>

            {/* Right column - Product Overview */}
            {selectedProduct ? (
              <div className="bg-white rounded-md p-5 h-fit sticky top-4">
                <h3 className="font-bold text-lg mb-4 border-b pb-2 flex items-center gap-2">
                  <FaInfoCircle className="text-[#CBA135]" />
                  Product Overview
                </h3>

                {/* Product Image Gallery */}
                {selectedProduct?.product?.images?.length > 0 && (
                  <div className="mb-4">
                    <div className="relative h-64 w-full rounded-md overflow-hidden mb-2">
                      <img
                        src={selectedProduct?.product?.images?.[0]?.image}
                        alt={selectedProduct?.product?.name || "Product"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-2 overflow-x-auto py-2">
                      {selectedProduct?.product?.images?.map((img, index) => (
                        <img
                          key={index}
                          src={img?.image}
                          alt={`Preview ${index + 1}`}
                          className="w-16 h-16 object-cover rounded cursor-pointer border"
                          onClick={() => setActiveTab("details")}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Basic Info */}
                <div className="mb-4">
                  <h4 className="font-semibold text-lg">{selectedProduct?.product?.name}</h4>
                  <div className="flex items-center gap-2 my-2">
                    <div className="flex">
                      {renderStars(selectedProduct?.product?.average_rating || 0)}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({selectedProduct?.product?.reviews?.length || 0} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xl font-bold text-[#CBA135]">
                      ${selectedProduct?.product?.new_price || selectedProduct?.price}
                    </span>
                    {selectedProduct?.product?.old_price && (
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
                <div className="border-b mb-4">
                  <div className="flex -mb-px">
                    <button
                      className={`py-2 px-4 font-medium text-sm ${activeTab === "details" ? "border-b-2 border-[#CBA135] text-[#CBA135]" : "text-gray-600"}`}
                      onClick={() => setActiveTab("details")}
                    >
                      Details
                    </button>
                    <button
                      className={`py-2 px-4 font-medium text-sm ${activeTab === "specs" ? "border-b-2 border-[#CBA135] text-[#CBA135]" : "text-gray-600"}`}
                      onClick={() => setActiveTab("specs")}
                    >
                      Specifications
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                {activeTab === "details" && (
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium mb-1 flex items-center gap-2">
                        <FaBox className="text-gray-500" />
                        Product Description
                      </h5>
                      <p className="text-sm text-gray-600">
                        {selectedProduct?.product?.short_description}
                      </p>
                    </div>

                    <div>
                      <h5 className="font-medium mb-1 flex items-center gap-2">
                        <FaShippingFast className="text-gray-500" />
                        Delivery Info
                      </h5>
                      <p className="text-sm text-gray-600">
                        Estimated delivery: {selectedProduct?.product?.estimated_delivery_days} days
                      </p>
                      <div className="flex gap-4 mt-1 text-sm">
                        {selectedProduct?.product?.home_delivery && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Home Delivery</span>
                        )}
                        {selectedProduct?.product?.pickup && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Pickup</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-1 flex items-center gap-2">
                        <MdPayment className="text-gray-500" />
                        Payment Details
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span>Quantity:</span>
                        <span className="font-medium">{selectedProduct?.quantity}</span>
                        <span>Unit Price:</span>
                        <span className="font-medium">${selectedProduct?.price}</span>
                        <span>Total:</span>
                        <span className="font-medium">
                          ${(selectedProduct?.quantity * parseFloat(selectedProduct?.price || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "specs" && selectedProduct?.product?.specifications && (
                  <div className="space-y-3">
                    {Object.entries(selectedProduct.product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-medium">{value || "N/A"}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Vendor Info */}
                <Collapse ghost className="mt-4 bg-gray-50 rounded-md">
                  <Panel header="Vendor Information" key="1">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">
                          {selectedProduct?.product?.vendor_details?.first_name}{" "}
                          {selectedProduct?.product?.vendor_details?.last_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedProduct?.product?.vendor_details?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium">
                          {selectedProduct?.product?.vendor_details?.is_online ? "Online" : "Offline"}
                        </span>
                      </div>
                    </div>
                  </Panel>
                </Collapse>

                {/* Return Policy */}
                <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-100">
                  <h5 className="font-medium mb-1 flex items-center gap-2 text-sm">
                    <FaUndo className="text-yellow-600" />
                    Return Policy
                  </h5>
                  <p className="text-xs text-yellow-700">
                    This product is eligible for return within 30 days of delivery. Please ensure the product is in its original condition with all tags attached.
                  </p>
                </div>
              </div>
            ): (
   <div className="h-full w-full flex flex-col justify-center items-center bg-gray-800/20 backdrop-blur-sm rounded-md border border-gray-300">
  <p className="text-gray-500 text-center text-lg font-medium">
    Select a product first
  </p>
</div>

            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnExchangeForm;