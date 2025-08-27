import React from 'react';
import { Modal, Button } from 'antd';
import { FaEdit, FaTrash, FaDownload, FaUser, FaStore, FaMoneyBill, FaTruck, FaCalendar, FaFileInvoice, FaMapMarkerAlt, FaPhone, FaEnvelope, FaHome, FaCity } from 'react-icons/fa';

const TableModal = ({ isModalOpen, setIsModalOpen, orderDetails }) => {
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  if (!orderDetails) return null;

  return (
    <>
      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={900}
        closable={false}
        className="rounded-lg"
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl popbold">Order Details – #{orderDetails.order_id}</h2>
          </div>
          <hr />
          
          <div className="space-x-2 flex justify-end">
            <p className='flex items-center bg-[#CBA135] text-white gap-2 text-sm px-2 rounded-md py-1'>
              <FaEdit /> Edit
            </p>
            <p className='flex items-center gap-2 bg-[#F87171] px-2 text-sm rounded-md text-white'>
              <FaTrash /> Delete
            </p>
          </div>

          {/* Order Summary */}
          <div className="border rounded-md p-4 bg-gray-50">
            <h3 className="text-[18px] popbold mb-3">Order Summary</h3>
            <div className="grid grid-cols-3 gap-y-5 text-sm">
              <p className='flex flex-col gap-2 text-[16px] popreg text-[#333333]'>
                <span className="popmed text-sm text-[#666666] flex items-center gap-1">
                  <FaUser size={12} /> Customer Name:
                </span>
                {orderDetails.customer.first_name} {orderDetails.customer.last_name}
              </p>
              <p className='flex flex-col gap-2 text-[16px] popreg text-[#333333]'>
                <span className="popmed text-sm text-[#666666]">Email:</span>
                {orderDetails.customer.email}
              </p>
              <p className='flex flex-col gap-2 text-[16px] popreg text-[#333333]'>
                <span className="popmed text-sm text-[#666666] flex items-center gap-1">
                  <FaStore size={12} /> Vendor:
                </span>
                {orderDetails.vendor.email}
              </p>
              <p className='flex flex-col gap-2 text-[16px] popreg text-[#333333]'>
                <span className="popmed text-sm text-[#666666] flex items-center gap-1">
                  <FaCalendar size={12} /> Order Date:
                </span>
                {formatDate(orderDetails.order_date)}
              </p>
              <p className='flex flex-col gap-2 text-[16px] popreg text-[#333333]'>
                <span className="popmed text-sm text-[#666666]">Order Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  orderDetails.order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  orderDetails.order_status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {orderDetails.order_status_display}
                </span>
              </p>
              <p className='flex flex-col gap-2 text-[16px] popreg text-[#333333]'>
                <span className="popmed text-sm text-[#666666] flex items-center gap-1">
                  <FaMoneyBill size={12} /> Payment Method:
                </span>
                {orderDetails.payment_method === 'mobile' ? 'Mobile Banking' : orderDetails.payment_method}
              </p>
              <p className='flex flex-col gap-2 text-[16px] popreg text-[#333333]'>
                <span className="popmed text-sm text-[#666666]">Payment Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  orderDetails.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  orderDetails.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {orderDetails.payment_status_display}
                </span>
              </p>
              <p className='flex flex-col gap-2 text-[16px] popreg text-[#333333]'>
                <span className="popmed text-sm text-[#666666] flex items-center gap-1">
                  <FaTruck size={12} /> Delivery Type:
                </span>
                {orderDetails.delivery_type_display}
              </p>
              <p className='flex flex-col gap-2 text-[16px] popreg text-[#333333]'>
                <span className="popmed text-sm text-[#666666]">Items:</span>
                {orderDetails.item_count} items
              </p>
            </div>
            <div className='h-[0.8px] w-full bg-slate-300 my-6' />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="flex justify-between mb-1">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(orderDetails.subtotal)}</span>
                </p>
                {orderDetails.discount_amount !== "0.00" && (
                  <p className="flex justify-between mb-1 text-red-500">
                    <span>Discount:</span>
                    <span>-{formatCurrency(orderDetails.discount_amount)}</span>
                  </p>
                )}
                <p className="flex justify-between mb-1">
                  <span>Tax:</span>
                  <span>{formatCurrency(orderDetails.tax_amount)}</span>
                </p>
                <p className="flex justify-between mb-1">
                  <span>Delivery Fee:</span>
                  <span>{formatCurrency(orderDetails.delivery_fee)}</span>
                </p>
              </div>
              <div className="text-right flex flex-col justify-end">
                <div className="text-lg text-[#666666] popbold flex justify-between items-center">
                  <span>Total:</span>
                  <span className='text-yellow-500 text-2xl'>{formatCurrency(orderDetails.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Summary */}
          <div className="border rounded-md p-4 bg-white">
            <h3 className="text-[18px] popbold mb-6">Product Summary</h3>
            <div className="grid grid-cols-12 gap-x-4 font-semibold text-sm border-b pb-2">
              <p className="col-span-6">Product</p>
              <p className="col-span-2 text-center">Qty</p>
              <p className="col-span-2 text-right">Price</p>
              <p className="col-span-2 text-right">Subtotal</p>
            </div>
            {orderDetails.items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-x-4 items-center mt-4 py-2 text-[16px] popmed border-b last:border-b-0">
                <div className="col-span-6 flex items-center gap-3">
                  <img 
                    src={item.product.images[0]?.image || "https://via.placeholder.com/50"} 
                    alt={item.product.name} 
                    className="w-12 h-12 rounded object-cover" 
                  />
                  <div>
                    <span className="block">{item.product.name}</span>
                    <span className="text-sm text-gray-500">SKU: {item.product.sku}</span>
                  </div>
                </div>
                <p className="col-span-2 text-center">{item.quantity}</p>
                <p className="col-span-2 text-right">{formatCurrency(item.price)}</p>
                <p className="col-span-2 text-right">
                  {formatCurrency(parseFloat(item.price) * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Shipping Information */}
          <div className="border rounded-md p-4 bg-white">
            <h3 className="text-[18px] popbold mb-3">Shipping Information</h3>
            <div className="grid grid-cols-2 gap-y-5 text-sm">
              <p className='flex flex-col text-[16px] text-[#2B2B2B]'>
                <span className="text-[#555555] text-[14px] flex items-center gap-1">
                  <FaTruck size={12} /> Delivery Type:
                </span>
                {orderDetails.delivery_type_display}
              </p>
              <p className='flex flex-col text-[16px] text-[#2B2B2B]'>
                <span className="text-[#555555] text-[14px]">Delivery Instructions:</span>
                {orderDetails.delivery_instructions || "No special instructions"}
              </p>
              {orderDetails.delivery_date && (
                <p className='flex flex-col text-[16px] text-[#2B2B2B]'>
                  <span className="text-[#555555] text-[14px]">Delivery Date:</span>
                  {formatDate(orderDetails.delivery_date)}
                </p>
              )}
              {orderDetails.estimated_delivery && (
                <p className='flex flex-col text-[16px] text-[#2B2B2B]'>
                  <span className="text-[#555555] text-[14px]">Estimated Delivery:</span>
                  {formatDate(orderDetails.estimated_delivery)}
                </p>
              )}
            </div>
            
            {/* Shipping Address Section */}
            {orderDetails.selected_shipping_address && (
              <>
                <div className='h-[0.8px] w-full bg-slate-300 my-4' />
                <h4 className="text-[16px] popbold mb-3 flex items-center gap-2">
                  <FaMapMarkerAlt /> Shipping Address
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className='flex items-center gap-2'>
                      <FaUser size={12} className="text-gray-500" />
                      <span className="font-medium">Full Name:</span>
                      {orderDetails.selected_shipping_address.full_name}
                    </p>
                    <p className='flex items-center gap-2'>
                      <FaPhone size={12} className="text-gray-500" />
                      <span className="font-medium">Phone:</span>
                      {orderDetails.selected_shipping_address.phone_number}
                    </p>
                    <p className='flex items-center gap-2'>
                      <FaEnvelope size={12} className="text-gray-500" />
                      <span className="font-medium">Email:</span>
                      {orderDetails.selected_shipping_address.email}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className='flex items-center gap-2'>
                      <FaHome size={12} className="text-gray-500" />
                      <span className="font-medium">Address:</span>
                      {orderDetails.selected_shipping_address.street_address}
                    </p>
                    {orderDetails.selected_shipping_address.landmark && (
                      <p className='flex items-center gap-2'>
                        <FaMapMarkerAlt size={12} className="text-gray-500" />
                        <span className="font-medium">Landmark:</span>
                        {orderDetails.selected_shipping_address.landmark}
                      </p>
                    )}
                    <p className='flex items-center gap-2'>
                      <FaCity size={12} className="text-gray-500" />
                      <span className="font-medium">City:</span>
                      {orderDetails.selected_shipping_address.city}
                    </p>
                    {orderDetails.selected_shipping_address.zip_code && (
                      <p className='flex items-center gap-2'>
                        <span className="font-medium">ZIP Code:</span>
                        {orderDetails.selected_shipping_address.zip_code}
                      </p>
                    )}
                  </div>
                </div>
                {(orderDetails.selected_shipping_address.apartment_name || 
                  orderDetails.selected_shipping_address.floor_number || 
                  orderDetails.selected_shipping_address.flat_number) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h5 className="text-sm font-medium mb-2">Additional Details:</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {orderDetails.selected_shipping_address.apartment_name && (
                        <p>
                          <span className="font-medium">Apartment:</span> {orderDetails.selected_shipping_address.apartment_name}
                        </p>
                      )}
                      {orderDetails.selected_shipping_address.floor_number && (
                        <p>
                          <span className="font-medium">Floor:</span> {orderDetails.selected_shipping_address.floor_number}
                        </p>
                      )}
                      {orderDetails.selected_shipping_address.flat_number && (
                        <p>
                          <span className="font-medium">Flat:</span> {orderDetails.selected_shipping_address.flat_number}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Notes Section (if exists) */}
          {orderDetails.notes && (
            <div className="border rounded-md p-4 bg-white">
              <h3 className="text-[18px] popbold mb-3">Order Notes</h3>
              <p className="text-sm text-gray-700">{orderDetails.notes}</p>
            </div>
          )}

          {/* Download Button */}
          <div className="text-right">
            <Button 
              type="link" 
              className="text-yellow-500 font-medium flex items-center gap-2 mx-auto"
            >
              <FaDownload /> Download Invoice
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TableModal;