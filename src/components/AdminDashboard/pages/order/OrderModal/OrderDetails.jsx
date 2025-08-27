import { Avatar, Button, Popover } from "antd";
import React, { useState, useMemo } from "react";
import { FaEdit, FaTrash, FaMapMarkerAlt, FaPhone, FaEnvelope, FaHome, FaCity } from "react-icons/fa";

const OrderDetails = ({ tableData }) => {
  const [open, setOpen] = useState(false);

  const hide = () => setOpen(false);
  const handleOpenChange = (newOpen) => setOpen(newOpen);

  // Get the full order data
  const order = tableData?.fullOrder || tableData;
  
  // Customer data
  const customer = order?.customer;
  
  // Vendor data
  const vendor = order?.vendor;
  
  // Shipping address
  const shippingAddress = order?.selected_shipping_address;
  
  // Calculate order totals
  const subtotal = useMemo(() => {
    return parseFloat(order?.subtotal || 0);
  }, [order]);

  const total = useMemo(() => {
    return parseFloat(order?.total_amount || 0);
  }, [order]);

  // Calculate tax and delivery
  const taxAmount = parseFloat(order?.tax_amount || 0);
  const deliveryFee = parseFloat(order?.delivery_fee || 0);
  const discountAmount = parseFloat(order?.discount_amount || 0);

  return (
    <div className="p-2 rounded-md space-y-6 text-sm text-gray-700">
      {/* Order Summary */}
      <div className="bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-black mb-4">
          Order Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-500 mb-1">Order ID</p>
            <p className="font-medium">{order?.order_id}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Customer Name</p>
            <div className="flex items-center gap-2 font-medium">
              <Avatar
                src={
                  customer?.profile_image ||
                  "https://ui-avatars.com/api/?name=" +
                    (customer?.first_name || "User")
                }
                className="w-6 h-6"
              />
              {customer?.first_name} {customer?.last_name}
            </div>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Vendor/Seller</p>
            <div className="flex items-center gap-2 font-medium">
              <Avatar
                src={
                  vendor?.profile_image ||
                  "https://ui-avatars.com/api/?name=" +
                    (vendor?.first_name || "Vendor")
                }
                className="w-6 h-6"
              />
              {vendor?.first_name} {vendor?.last_name}
            </div>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Email</p>
            <p className="font-medium">{customer?.email}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Order Date</p>
            <p className="font-medium">
              {new Date(order?.order_date || order?.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Order Status</p>
            <p className="font-medium capitalize">
              {order?.order_status_display || order?.order_status || "pending"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Payment Method</p>
            <p className="font-medium capitalize">
              {order?.payment_method === 'mobile' ? 'Mobile Banking' : order?.payment_method || "Not Provided"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Payment Status</p>
            <p className="font-medium capitalize">
              {order?.payment_status_display || order?.payment_status || "Not Provided"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Delivery Type</p>
            <p className="font-medium capitalize">
              {order?.delivery_type_display || order?.delivery_type || "Not Provided"}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-5 pt-3 border-t">
          <h4 className="text-base font-semibold">Total</h4>
          <h5 className="text-lg font-bold text-yellow-600">
            ${total.toFixed(2)}
          </h5>
        </div>
      </div>

      {/* Product Summary */}
      <div className="py-9 shadow-sm bg-white p-5">
        <h3 className="text-lg font-semibold text-black mb-4">
          Product Summary ({order?.items?.length || 0} items)
        </h3>
        <div className="grid grid-cols-5 font-semibold text-gray-600 text-sm border-b pb-2">
          <span className="col-span-2">Product</span>
          <span className="text-center">Qty</span>
          <span className="text-center">Price</span>
          <span className="text-right">Subtotal</span>
        </div>
        
        {order?.items?.map((item) => {
          const itemSubtotal = parseFloat(item.price || 0) * (item.quantity || 1);
          return (
            <div key={item.id} className="grid grid-cols-5 items-center text-sm mt-3 py-2 border-b">
              <div className="col-span-2 flex items-center gap-3">
                <img
                  src={item.product?.images?.[0]?.image || "https://via.placeholder.com/50"}
                  alt={item.product?.name}
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <span className="font-medium block">{item.product?.name}</span>
                  <span className="text-xs text-gray-500">SKU: {item.product?.sku}</span>
                </div>
              </div>
              <span className="text-center">{item.quantity}</span>
              <span className="text-center">${parseFloat(item.price).toFixed(2)}</span>
              <span className="text-right font-semibold">
                ${itemSubtotal.toFixed(2)}
              </span>
            </div>
          );
        })}
        
        {/* Order Totals */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between py-1">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between py-1 text-green-600">
              <span>Discount:</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="flex justify-between py-1">
              <span>Tax:</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
          )}
          {deliveryFee > 0 && (
            <div className="flex justify-between py-1">
              <span>Delivery Fee:</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-1 font-bold text-lg mt-2 pt-2 border-t">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-black mb-4">
          Shipping Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 mb-1">Delivery Instructions</p>
            <p className="font-medium">{order?.delivery_instructions || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Delivery Option</p>
            <p className="font-medium capitalize">
              {order?.delivery_type_display || order?.delivery_type || "Not Provided"}
            </p>
          </div>
          {order?.estimated_delivery && (
            <div>
              <p className="text-gray-500 mb-1">Estimated Delivery</p>
              <p className="font-medium">
                {new Date(order.estimated_delivery).toLocaleDateString()}
              </p>
            </div>
          )}
          {order?.delivery_date && (
            <div>
              <p className="text-gray-500 mb-1">Delivery Date</p>
              <p className="font-medium">
                {new Date(order.delivery_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Shipping Address Section */}
        {shippingAddress && (
          <>
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-md font-semibold text-black mb-3 flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-500" /> Shipping Address
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500 w-24 flex-shrink-0">Full Name:</span>
                    <span className="font-medium">{shippingAddress.full_name}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <FaPhone className="text-gray-500" size={12} />
                    <span className="text-gray-500 w-24 flex-shrink-0">Phone:</span>
                    <span className="font-medium">{shippingAddress.phone_number}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-500" size={12} />
                    <span className="text-gray-500 w-24 flex-shrink-0">Email:</span>
                    <span className="font-medium">{shippingAddress.email}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <FaHome className="text-gray-500" size={12} />
                    <span className="text-gray-500 w-24 flex-shrink-0">Address:</span>
                    <span className="font-medium">{shippingAddress.street_address}</span>
                  </p>
                  {shippingAddress.landmark && (
                    <p className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-500" size={12} />
                      <span className="text-gray-500 w-24 flex-shrink-0">Landmark:</span>
                      <span className="font-medium">{shippingAddress.landmark}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <FaCity className="text-gray-500" size={12} />
                    <span className="text-gray-500 w-24 flex-shrink-0">City:</span>
                    <span className="font-medium">{shippingAddress.city}</span>
                  </p>
                  {shippingAddress.zip_code && (
                    <p className="flex items-center gap-2">
                      <span className="text-gray-500 w-24 flex-shrink-0">ZIP Code:</span>
                      <span className="font-medium">{shippingAddress.zip_code}</span>
                    </p>
                  )}
                </div>
              </div>
              
              {/* Additional Address Details */}
              {(shippingAddress.apartment_name || 
                shippingAddress.floor_number || 
                shippingAddress.flat_number) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h5 className="text-sm font-medium mb-2 text-gray-700">Additional Details:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {shippingAddress.apartment_name && (
                      <p>
                        <span className="text-gray-500">Apartment:</span> {shippingAddress.apartment_name}
                      </p>
                    )}
                    {shippingAddress.floor_number && (
                      <p>
                        <span className="text-gray-500">Floor:</span> {shippingAddress.floor_number}
                      </p>
                    )}
                    {shippingAddress.flat_number && (
                      <p>
                        <span className="text-gray-500">Flat:</span> {shippingAddress.flat_number}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Notes */}
      {order?.notes && (
        <div className="bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-black mb-4">
            Order Notes
          </h3>
          <p className="text-gray-700">{order.notes}</p>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;