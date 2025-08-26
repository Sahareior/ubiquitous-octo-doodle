import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { LiaStarSolid } from "react-icons/lia";
import { useAcceptProductsMutation, useGetAllProductsQuery } from '../../../../../redux/slices/Apis/dashboardApis';
import Swal from 'sweetalert2';

const ProductsModal = ({ isModalOpen, setIsModalOpen, productData }) => {
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [acceptProducts] = useAcceptProductsMutation();
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

          <div className='flex py-4 justify-end items-center gap-2'>
            <Button onClick={() => handleApprove()} className='bg-[#CBA135] text-white'>Approve</Button>
            <Button className='bg-[#F87171] text-white'>Reject</Button>
          </div>

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
                <p className="text-sm popreg">${productData?.price1}</p>
              </div>

              <div>
                <p className="popmed text-sm">Status</p>
                <p className={`${productData?.status === "pending" ? "text-yellow-600" : "text-green-600"} font-semibold`}>
                  {productData?.status}
                </p>
              </div>

              <div>
                <p className="popmed text-sm mb-1">Options</p>
                <div className="flex items-center gap-2">
                  {productData?.option1 && <span className="px-2 py-1 border rounded">{productData?.option1}</span>}
                  {productData?.option2 && <span className="px-2 py-1 border rounded">{productData?.option2}</span>}
                  {productData?.option3 && <span className="px-2 py-1 border rounded">{productData?.option3}</span>}
                  {productData?.option4 && <span className="px-2 py-1 border rounded">{productData?.option4}</span>}
                </div>
              </div>

              <div>
                <p className="popmed text-sm">Discount price:</p>
                <p className="text-sm popreg">${productData?.price2}</p>
              </div>

              <div>
                <p className="popmed text-[#666666]"> Rating</p>
                <button
                  className="text-yellow-600 flex items-center gap-1 underline font-medium"
                  onClick={() => setIsOrderHistoryOpen(true)}
                >
                  <LiaStarSolid size={16} /> <span className='text-black text-sm popreg'>2</span>
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
                <button className="text-yellow-600 underline font-medium">
                  Product details
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProductsModal;
