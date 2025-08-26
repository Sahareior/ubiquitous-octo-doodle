import { Avatar, Button, Popover } from "antd";
import React, { useState, useMemo } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

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
      {/* Action Buttons */}
      {/* <div className="flex justify-end items-center gap-4">
        <p className="flex items-center bg-[#CBA135] text-sm gap-1 rounded-md text-white px-3 py-1 cursor-pointer">
          <FaEdit /> Edit
        </p>
        <Popover
          content={
            <div className="space-y-2 py-3 px-4 flex flex-col gap-4 items-center text-center">
              <p className="text-gray-700">Do you want to delete this order?</p>
              <Button className="bg-[#CBA135] text-white hover:bg-yellow-600">
                Delete
              </Button>
            </div>
          }
          title={
            <h3 className="text-red-500 text-center font-semibold">
              Are you sure!!
            </h3>
          }
          trigger="click"
          open={open}
          onOpenChange={handleOpenChange}
        >
          <p className="flex items-center bg-red-400 hover:bg-red-500 transition text-sm gap-1 rounded-md text-white px-3 py-1 cursor-pointer">
            <FaTrash /> Delete
          </p>
        </Popover>
      </div> */}

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
              {order?.payment_method || "Not Provided"}
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