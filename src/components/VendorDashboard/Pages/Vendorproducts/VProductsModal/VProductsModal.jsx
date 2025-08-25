import React, { useState } from 'react';
import { Modal } from 'antd';
import { LiaStarSolid } from 'react-icons/lia';

const VProductsModal = ({ isModalOpen, setIsModalOpen, product }) => {
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);

  const handleOk = () => setIsModalOpen(false);
  const handleCancel = () => setIsModalOpen(false);

  if (!product) return null; // safe guard

  const p = product.originalData; // full product data

  return (
    <>
      {/* Product Details Modal */}
      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={900}
      >
        <div className="bg-[#f9f8f6] rounded-md w-full p-4 mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center border-b-2 border-[#E5E7EB] px-4 pb-2">
            <h2 className="text-2xl popbold text-gray-900">Product Details</h2>
          </div>

          {/* Content */}
          <div className="p-6 bg-white shadow-sm rounded mt-4">
            <h3 className="text-lg popbold text-gray-700 mb-4">Product</h3>

            <div className="grid grid-cols-3 gap-y-4 text-sm text-gray-700">
              <div>
                <p className="popmed text-sm">Product Name</p>
                <p className="flex text-sm popreg items-center gap-1">
                  <span className="text-red-500 text-lg">●</span> {p?.name}
                </p>
              </div>
              <div>
                <p className="popmed text-sm">Vendor</p>
                <p className="text-sm popreg">{p?.vendor_details?.email}</p>
              </div>
              <div>
                <p className="popmed text-sm">Product Id:</p>
                <p className="text-sm popreg">{p?.prod_id}</p>
              </div>

              <div>
                <p className="popmed text-sm">Stock:</p>
                <p className={p?.is_stock ? "text-blue-600" : "text-red-600"}>
                  {p?.is_stock ? p?.stock_quantity : "Out of Stock"}
                </p>
              </div>
              <div>
                <p className="popmed text-sm">Price :</p>
                <p className="text-sm popreg">${p?.price1}</p>
              </div>
              <div>
                <p className="popmed text-sm">Status</p>
                <p
                  className={
                    p?.status === "approved"
                      ? "text-green-600 font-semibold"
                      : "text-yellow-600 font-semibold"
                  }
                >
                  {p?.status}
                </p>
              </div>

              <div>
                <p className="popmed text-sm mb-1">Colour</p>
                <div className="flex items-center gap-2">
                  {/* Example color swatches — replace with your own product options if available */}
                  <span className="w-4 h-4 rounded-full bg-red-500"></span>
                  <span className="w-4 h-4 rounded-full bg-blue-500"></span>
                  <span className="w-4 h-4 rounded-full bg-green-500"></span>
                </div>
              </div>

              <div>
                <p className="popmed text-sm">Discount price:</p>
                <p className="text-sm popreg">${p?.price2}</p>
              </div>
              <div>
                <p className="popmed text-[#666666]"> Rating</p>
                <button
                  className="text-yellow-600 flex items-center gap-1 underline font-medium"
                  onClick={() => setIsOrderHistoryOpen(true)}
                >
                  <LiaStarSolid size={16} />{" "}
                  <span className="text-black text-sm popreg">2</span>
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
                <button
                  className="text-yellow-600 underline font-medium"
                  onClick={() => setIsOrderHistoryOpen(true)}
                >
                  Order History
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default VProductsModal;
