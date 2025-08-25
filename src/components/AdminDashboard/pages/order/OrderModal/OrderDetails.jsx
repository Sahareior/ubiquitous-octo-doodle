import { Avatar, Button, Popover } from "antd";
import React, { useState, useMemo } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const OrderDetails = ({ tableData }) => {
  const [open, setOpen] = useState(false);

  const hide = () => setOpen(false);
  const handleOpenChange = (newOpen) => setOpen(newOpen);

  // Customer (vendor) data
  const customer = tableData?.product?.vendor_details;

  // Product data
  const product = tableData?.product;

  // Calculate subtotal & total
  const subtotal = useMemo(() => {
    return parseFloat(tableData?.price || 0) * (tableData?.quantity || 1);
  }, [tableData]);

  const total = subtotal; // later you can add shipping charges, tax, etc.

  return (
    <div className="p-2 rounded-md space-y-6 text-sm text-gray-700">
      {/* Action Buttons */}
      <div className="flex justify-end items-center gap-4">
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
      </div>

      {/* Customer Summary */}
      <div className="bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-black mb-4">
          Customer Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <p className="text-gray-500 mb-1">Email</p>
            <p className="font-medium">{customer?.email}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Order Date</p>
            <p className="font-medium">
              {new Date(tableData?.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Order Status</p>
            <p className="font-medium capitalize">
              {product?.status || "pending"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Payment Method</p>
            <p className="font-medium">Not Provided</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Payment Status</p>
            <p className="font-medium">Not Provided</p>
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
          Product Summary
        </h3>
        <div className="grid grid-cols-4 font-semibold text-gray-600 text-sm border-b pb-2">
          <span>Product</span>
          <span className="text-center">Qty</span>
          <span className="text-center">Price</span>
          <span className="text-right">Subtotal</span>
        </div>
        <div className="grid grid-cols-4 items-center text-sm mt-3">
          <div className="flex items-center gap-3">
            <img
              src={product?.images?.[0]?.image}
              alt={product?.name}
              className="w-12 h-12 rounded object-cover"
            />
            <span className="font-medium">{product?.name}</span>
          </div>
          <span className="text-center">{tableData?.quantity}</span>
          <span className="text-center">${parseFloat(tableData?.price)}</span>
          <span className="text-right font-semibold">
            ${subtotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-black mb-4">
          Shipping Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 mb-1">Delivery Address</p>
            <p className="font-medium">{customer?.address || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Delivery Option</p>
            <p className="font-medium">
              {product?.home_delivery ? "Home Delivery" : "Pickup"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Expected Delivery</p>
            <p className="font-medium">
              {product?.estimated_delivery_days
                ? `${product?.estimated_delivery_days} Days`
                : "Not Provided"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
