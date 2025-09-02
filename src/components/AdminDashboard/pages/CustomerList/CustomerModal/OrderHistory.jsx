import React, { useEffect } from 'react';
import { FiDownload, FiCopy } from 'react-icons/fi';
import { useLazyGetCustomerByIDQuery } from '../../../../../redux/slices/Apis/dashboardApis';

const OrderHistory = ({ customerId }) => {
  const [getCustomerByID, { data, isLoading, isError }] = useLazyGetCustomerByIDQuery();

  useEffect(() => {
    if (customerId) {
      getCustomerByID(customerId);
    }
  }, [customerId, getCustomerByID]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching data</div>;

  const orderDetails = data?.orders || [];

  return (
    <div className="flex items-center justify-center bg-[#FAF8F2] bg-opacity-50 min-h-screen p-4">
      <div className="bg-white rounded-md shadow-lg w-full max-w-4xl">
        {/* Header */}
        <div className="px-6 py-4 text-center border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Order History!</h2>
          <p className="text-sm text-gray-600">Thank You for Your Order!</p>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[70vh] mt-1 px-6 py-14">
          {orderDetails.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders found
            </div>
          ) : (
            orderDetails.map((order) => (
              <div key={order.order_id} className="mb-6 pb-14 border-b border-red-500 last:border-b-0">
                {/* Order Details */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 text-sm mb-3">Order Details</h3>
                  <div className="flex justify-between text-sm text-gray-800">
                    <div>
                      <p className="font-medium">Order ID</p>
                      <p className="flex items-center gap-1 text-gray-700">
                        {order.order_id} <FiCopy className="text-gray-500 cursor-pointer" size={14} />
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Order Date</p>
                      <p>{new Date(order.order_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium">Status</p>
                      <p>{order.order_status_display}</p>
                    </div>
                  </div>
                </div>

                <div className="my-4 bg-gray-300 h-[0.7px]" />

                {/* Product List */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 text-sm mb-3">Products list</h3>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start text-sm text-gray-800 mb-2">
                      <div>
                        <p className="font-semibold">{item.product_name}</p>
                        <p className="text-gray-600 text-xs">Qty: {item.quantity}</p>
                      </div>
                      <p>${item.price}</p>
                    </div>
                  ))}
                </div>

                <div className="my-4 bg-gray-300 h-[0.7px]" />

                {/* Price Breakdown */}
                <div className="text-sm text-gray-800 space-y-2">
                  <div className="flex justify-between">
                    <p>Subtotal ({order.items.length} items)</p>
                    <p>${order.subtotal}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Delivery fee</p>
                    <p>${order.delivery_fee}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Tax</p>
                    <p>${order.tax_amount}</p>
                  </div>
                  {order.discount_amount !== "0.00" && (
                    <div className="flex justify-between">
                      <p>Total Discount</p>
                      <p>-${order.discount_amount}</p>
                    </div>
                  )}
                  <div className="my-4 bg-gray-300 h-[0.7px]" />
                  <div className="flex justify-between pt-4 mt-2 font-semibold text-lg text-yellow-600">
                    <p>Total</p>
                    <p>${order.total_amount}</p>
                  </div>
                </div>

                {/* Download Button */}
                {/* <div className="text-center mt-6">
                  <button className="text-yellow-600 text-sm flex items-center gap-1 mx-auto hover:underline">
                    <FiDownload size={16} /> Download Invoice
                  </button>
                </div> */}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;