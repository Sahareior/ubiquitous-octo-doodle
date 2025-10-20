import { Select, Switch } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import './OrderTracking.css';
import { Steps } from 'antd';
import Breadcrumb from '../others/Breadcrumb';
import { FaCarSide, FaLocationDot, FaWhatsapp } from 'react-icons/fa6';
import { TiMessages } from 'react-icons/ti';
import TrackingMap from './ToolComponents/TrackingMap';
import { FiChevronDown } from 'react-icons/fi';
import { MdEmail } from 'react-icons/md';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const notificationIcons = [
  <TiMessages className="text-2xl text-[#CBA135]" />, // SMS
  <MdEmail className="text-2xl text-[#CBA135]" />,   // Email
  <FaWhatsapp className="text-2xl text-[#CBA135]" /> // WhatsApp
];

// Helper function to determine current step based on order status
const getCurrentStep = (orderStatus) => {
  const statusMap = {
    'Pending': 0,
    'Processing': 1,
    'Shipped': 2,
    'Out for Delivery': 3,
    'Delivered': 4
  };
  return statusMap[orderStatus] || 0;
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const OrderTracking = () => {
  const icons = useMemo(() => notificationIcons, []);
  const location = useLocation();
  
  // Get order data from location state
  const orderData = location.state?.orderData || {};
  
  const {
    order_id,
    order_date,
    estimated_delivery,
    items = [],
    subtotal,
    discount_amount,
    tax_amount,
    delivery_fee,
    total_amount,
    delivery_type_display,
    order_status_display,
    payment_status_display,
    payment_method,
    shipping_address = {}
  } = orderData;

  const onChange = () => {
    // Removed debug // console.log
    // In production: maybe hook into API / user settings here
  };

  const currentStep = getCurrentStep(order_status_display);

  return (
    <div className="bg-[#FAF8F2] pb-10">
      <div className="md:mx-20 px-4">
        <Breadcrumb />

        {/* Header */}
        <div className="my-8">
          <h2 className="text-[30px] popbold text-[#333333]">Order Tracking</h2>
          <p className="text-[16px] text-[#4B5563] popreg">
            Track your order and manage delivery details
          </p>
        </div>

        {/* Grid layout: Left (main) + Right (sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="space-y-6 lg:col-span-2">
            {/* Steps */}
            <div className="bg-white p-6 rounded-md shadow-sm">
              <Steps
                size="small"
                current={currentStep}
                items={[
                  { title: 'Order Placed' },
                  { title: 'Processing' },
                  { title: 'Shipped' },
                  { title: 'Out for Delivery' },
                  { title: 'Delivered' }
                ]}
              />
              <div className="bg-[#EAE7E1] p-5 mt-6 rounded-md">
                <p className="text-[16px] popmed">Current Status: {order_status_display || 'Processing'}</p>
                <p className="text-[14px] popreg">
                  {order_status_display === 'Delivered' 
                    ? 'Your order has been delivered successfully.'
                    : `Your order is on the way. Expected delivery: ${formatDate(estimated_delivery)}`
                  }
                </p>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-[20px] popbold mb-6">Delivery Details</h2>

              {/* Location Type */}
              <div className="mb-4">
                <label className="block mb-1 text-sm popmed font-medium">
                  Location Type
                </label>
                <Select
                  defaultValue="Home"
                  className="w-full h-[46px]"
                  suffixIcon={<FiChevronDown size={25} className="text-gray-500" />}
                  options={[
                    { value: 'Home', label: 'Home' },
                    { value: 'Office', label: 'Office' },
                    { value: 'Other', label: 'Other' }
                  ]}
                />
              </div>

              {/* Landmark */}
              <div className="mb-4">
                <label className="block mb-1 text-sm popmed">Landmark Description</label>
                <input
                  type="text"
                  placeholder={shipping_address.landmark || "Near Central Mosque, opposite University"}
                  className="h-[46px] w-full border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-0 focus:border-gray-400"
                />
              </div>

              {/* GPS Pinning */}
              <div className="mb-4">
                <label className="block mb-1 text-sm popmed">GPS Pinning</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Longitude"
                    className="h-[46px] w-full border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-0 focus:border-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Latitude"
                    className="h-[46px] w-full border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-0 focus:border-gray-400"
                  />
                  <button className="w-24 h-[46px] bg-[#CBA135] rounded-[12px] flex justify-center items-center text-white">
                    <FaLocationDot size={18} />
                  </button>
                </div>
              </div>

              {/* Note to Driver */}
              <div className="mb-6">
                <label className="block mb-1 text-sm popmed">Note to Driver</label>
                <textarea
                  rows={4}
                  placeholder="Call when you arrive. House has a blue gate."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-400 resize-none"
                />
              </div>

              <button
                type="button"
                className="w-full bg-[#CBA135] text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2"
              >
                <EnvironmentOutlined /> Use My Current Location
              </button>
            </div>

            {/* Notification Preferences */}
            <div className="p-6 bg-white rounded-xl shadow-sm space-y-5">
              <h3 className="text-[20px] popbold text-[#333333]">
                Notification Preferences
              </h3>

              {['SMS Notifications', 'Email Updates', 'Whatsapp Updates'].map(
                (label, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-[#EAE7E1] p-4 rounded-lg shadow-inner"
                  >
                    <div className="flex items-center gap-3 text-gray-700">
                      {icons[idx]}
                      <p className="text-sm popmed text-[#333333]">{label}</p>
                    </div>
                    <Switch defaultChecked onChange={onChange} />
                  </div>
                )
              )}

              <div className="bg-[#FAF8F2] p-4 rounded-lg">
                <p className="text-[16px] font-semibold popmed mb-1">
                  Message Preview:
                </p>
                <p className="text-[14px] popreg text-[#4B5563]">
                  {`Your WRIKO order ${order_id} has been ${order_status_display?.toLowerCase() || 'shipped'}. ${estimated_delivery ? `ETA: ${formatDate(estimated_delivery)}` : ''}`}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
   <div className="flex flex-col justify-between gap-6 overflow-y-auto">
  <div className="bg-white p-6 rounded-xl shadow-md h-fit">
    <h3 className="text-[20px] font-semibold popbold mb-4">
      Order Summary
    </h3>

    {/* Order items */}
    <div className="space-y-4 h-[20vh] overflow-y-scroll">
      {items?.map((item, idx) => (
        <div key={idx} className="flex justify-between gap-4">
          <div className="flex gap-4">
            {/* <img
              src="/image/featured/img1.png"
              alt={item?.product_name}
              className="w-16 h-16 object-cover rounded-md"
            /> */}
            <div>
              <h4 className="text-sm popbold text-[#333333] font-semibold">
                {item?.product_name}
              </h4>
              <p className="text-sm popreg text-gray-500">
                Quantity: {item?.quantity}
              </p>
              <p className="text-xs popreg text-gray-500">Price: XAF {item?.price}</p>
            </div>
          </div>
          <p className="text-sm text-[#666666] popreg font-semibold text-right">
            XAF {(parseFloat(item?.price) * item?.quantity).toFixed(2)}
          </p>
        </div>
      ))}
    </div>

    {/* Totals */}
    <div className="border-t border-gray-300 mt-6 pt-4 space-y-2 text-[16px] popreg text-[#666666]">
      <div className="flex justify-between">
        <span>Subtotal ({items?.length} item{items?.length !== 1 ? 's' : ''})</span>
        <span>XAF {subtotal || '0.00'}</span>
      </div>
      <div className="flex justify-between">
        <span>Delivery fee</span>
        <span>XAF {delivery_fee || '0.00'}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax</span>
        <span>XAF {tax_amount || '0.00'}</span>
      </div>
      {parseFloat(discount_amount) > 0 && (
        <div className="flex justify-between">
          <span>Total Discount</span>
          <span className="text-green-600">-XAF {discount_amount || '0.00'}</span>
        </div>
      )}
    </div>
    <hr className="mt-3" />
    <div className="flex justify-between items-center mt-4">
      <h4 className="text-base font-semibold">Total</h4>
      <h4 className="text-xl font-bold text-[#CBA135]">XAF {total_amount || '0.00'}</h4>
    </div>

    <div className="bg-[#EAE7E1] rounded-2xl space-y-2 p-5 mt-5">
      <p className="flex items-center popmed gap-2">
        <FaCarSide size={21} className="text-[#CBA135]" /> Delivery Info
      </p>
      <p className="text-[12px] popreg text-[#4B5563]">Order: {order_id}</p>
      <p className="text-[12px] popreg text-[#4B5563]">
        Expected: {formatDate(estimated_delivery)}
      </p>
      <p className="text-[12px] popreg text-[#4B5563]">Carrier: {delivery_type_display || 'Standard'}</p>
      <p className="text-[12px] popreg text-[#4B5563]">Payment: {payment_status_display} ({payment_method})</p>
    </div>

    <button className="w-full bg-[#2B2B2B] text-white font-semibold text-sm py-3 mt-5 rounded-md hover:bg-yellow-600">
      Contact Support
    </button>
  </div>

  <TrackingMap />
</div>

        </div>
      </div>
    </div>
  );
};

export default OrderTracking;