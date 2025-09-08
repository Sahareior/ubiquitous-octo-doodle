import React, { use, useState } from 'react';
import { Button, Modal } from 'antd';
import { LiaStarSolid } from "react-icons/lia";
import { useAcceptProductsMutation, useGetAllProductsQuery, useRejectProductsMutation } from '../../../../../redux/slices/Apis/dashboardApis';
import Swal from 'sweetalert2';

const ProductsModal = ({ isModalOpen, setIsModalOpen, productData,path }) => {
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [acceptProducts] = useAcceptProductsMutation();
  const [rejectProducts] = useRejectProductsMutation()
    const { data: products, refetch } = useGetAllProductsQuery();

const handleApprove = async () => {
  if (!productData) return;

  const payload = {
    categories: productData?.categories?.length ? productData.categories.map(c => c.id) : [0],
    tags: productData?.tags?.length ? productData.tags.map(t => t.id) : [0],
    seo: productData?.seo || 0,
    name: productData?.name || 'string',
    sku: productData?.sku || 'string',
    short_description: productData?.short_description || 'string',
    full_description: productData?.full_description || 'string',
    price1: productData?.price1?.toString() || '0',
    price2: productData?.price2?.toString() || '0',
    price3: productData?.price3?.toString() || '0',
    option1: productData?.option1 || '',
    option2: productData?.option2 || '',
    option3: productData?.option3 || '',
    option4: productData?.option4 || '',
    is_stock: productData?.is_stock,
    stock_quantity: productData?.stock_quantity || 0,
    home_delivery: productData?.home_delivery,
    pickup: productData?.pickup,
    partner_delivery: productData?.partner_delivery,
    is_approve: true,
    estimated_delivery_days: productData?.estimated_delivery_days || 0,
  };

  try {
    const res = await acceptProducts({ id: productData?.id, data: payload }).unwrap();
    console.log('Approved:', res);

    // ✅ Success Swal
    Swal.fire({
      title: "Approved!",
      text: `${productData?.name} has been approved successfully.`,
      icon: "success",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "OK"
    });
    refetch()
    setIsModalOpen(false);

  } catch (err) {
    console.error('Error approving product:', err);

    // ❌ Error Swal
    Swal.fire({
      title: "Error!",
      text: "Something went wrong while approving the product.",
      icon: "error",
      confirmButtonColor: "#d33",
      confirmButtonText: "Close"
    });
  }
};
const handleReject = async () => {
  if (!productData) return;

  const payload = {
    categories: productData?.categories?.length ? productData.categories.map(c => c.id) : [0],
    tags: productData?.tags?.length ? productData.tags.map(t => t.id) : [0],
    seo: productData?.seo || 0,
    name: productData?.name || 'string',
    sku: productData?.sku || 'string',
    short_description: productData?.short_description || 'string',
    full_description: productData?.full_description || 'string',
    price1: productData?.price1?.toString() || '0',
    price2: productData?.price2?.toString() || '0',
    price3: productData?.price3?.toString() || '0',
    option1: productData?.option1 || '',
    option2: productData?.option2 || '',
    option3: productData?.option3 || '',
    option4: productData?.option4 || '',
    is_stock: productData?.is_stock,
    stock_quantity: productData?.stock_quantity || 0,
    home_delivery: productData?.home_delivery,
    pickup: productData?.pickup,
    partner_delivery: productData?.partner_delivery,
    is_approve: true,
    estimated_delivery_days: productData?.estimated_delivery_days || 0,
  };

  try {
    const res = await rejectProducts({ id: productData?.id, data: payload }).unwrap();
    console.log('Rejected:', res);

    // ✅ Success Swal
    Swal.fire({
      title: "Rejected!",
      text: `${productData?.name} has been rejected successfully.`,
      icon: "success",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "OK"
    });
    refetch()
    setIsModalOpen(false);

  } catch (err) {
    console.error('Error approving product:', err);

    // ❌ Error Swal
    Swal.fire({
      title: "Error!",
      text: "Something went wrong while approving the product.",
      icon: "error",
      confirmButtonColor: "#d33",
      confirmButtonText: "Close"
    });
  }
};



  const handleOk = () => setIsModalOpen(false);
  const handleCancel = () => setIsModalOpen(false);


  console.log("prodaddddddddddddddductData", productData?.is_approve );

  return (
    <>
      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={900}
      >
        <div className="bg-[#f9f8f6] rounded-md w-full  p-4 mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center border-b-2 border-[#E5E7EB] px-4 pb-2">
            <h2 className="text-2xl popbold text-gray-900">Products Details</h2>
          </div>

{productData?.status === 'approved' || !path && (
  <div className="flex py-4 justify-end items-center gap-2">
    <Button 
      onClick={() => handleApprove()} 
      className="bg-[#CBA135] text-white"
    >
      Approve
    </Button>
    <Button onClick={() => handleReject()} className="bg-[#F87171] text-white">Reject</Button>
  </div>
)}


          {/* Content */}
          <div className="p-6 bg-white shadow-sm rounded mt-4">
            <h3 className="text-lg popbold text-gray-700 mb-4">Product</h3>

            <div className="grid grid-cols-3 gap-y-4 text-sm text-gray-700">
              <div>
                <p className="popmed text-sm">Product Name</p>
                <p className=" flex text-sm popreg items-center gap-1">
                  <span className="text-red-500 text-lg">●</span> {productData?.name}
                </p>
              </div>

              <div>
                <p className="popmed text-sm">Vendor</p>
                <p className="text-sm popreg">{productData?.vendor_details?.email}</p>
              </div>

              <div>
                <p className="popmed text-sm">Product Id:</p>
                <p className="text-sm popreg">{productData?.prod_id}</p>
              </div>

              <div>
                <p className="popmed text-sm">Stock:</p>
                <p className={`${productData?.is_stock ? "text-green-600" : "text-red-600"}`}>
                  {productData?.is_stock ? `In Stock (${productData?.stock_quantity})` : "Out of Stock"}
                </p>
              </div>

              <div>
                <p className="popmed text-sm">Price :</p>
                <p className="text-sm popreg">${productData?.price1} XAF</p>
              </div>

              <div>
                <p className="popmed text-sm">Status</p>
                <p className={`${productData?.status === "pending" ? "text-yellow-600" : "text-green-600"} font-semibold`}>
                  {productData?.status}
                </p>
              </div>

<div className="col-span-3">
  <p className="popmed text-sm mb-3">Delivery Options</p>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
    { productData?.option1 && (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start">
        <div className="bg-green-100 p-2 rounded-full mr-3">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-green-800 text-sm">Home Delivery</p>
          <p className="text-green-600 text-xs mt-1">{productData.option1} XAF</p>
        </div>
      </div>
    )}
    
    { productData?.option2 && (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start">
        <div className="bg-blue-100 p-2 rounded-full mr-3">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-blue-800 text-sm">Pickup</p>
          <p className="text-blue-600 text-xs mt-1">{productData.option2} XAF</p>
        </div>
      </div>
    )}
    
    { productData?.option3 && (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-start">
        <div className="bg-purple-100 p-2 rounded-full mr-3">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-purple-800 text-sm">Partner Delivery</p>
          <p className="text-purple-600 text-xs mt-1">{productData.option3} XAF</p>
        </div>
      </div>
    )}
    
    {productData?.option4 && (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-start">
        <div className="bg-gray-100 p-2 rounded-full mr-3">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-gray-800 text-sm">Additional Option</p>
          <p className="text-gray-600 text-xs mt-1">{productData.option4}</p>
        </div>
      </div>
    )}
    

  </div>
</div>

              <div>
                <p className="popmed text-sm">Discount price:</p>
                <p className="text-sm popreg">{productData?.price2} XAF</p>
              </div>

              <div>
                <p className="popmed text-[#666666]"> Rating</p>
                <button
                  className="text-yellow-600 flex items-center gap-1 underline font-medium"
                  onClick={() => setIsOrderHistoryOpen(true)}
                >
                  <LiaStarSolid size={16} /> <span className='text-black text-sm popreg'>{productData?.average_rating}</span>
                </button>
              </div>

              <div>
                <p className="popmed text-sm">Total Solds</p>
                <p className="text-sm popreg">03</p>
              </div>

              <div>
                <p className="popmed text-sm">Total Orders</p>
                <p className="text-sm popreg">03</p>
              </div>

              <div>

              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProductsModal;
