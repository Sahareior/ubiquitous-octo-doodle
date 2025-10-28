import React from 'react';
import { 
  FaChair, 
  FaChartLine, 
  FaDollarSign, 
  FaShippingFast, 
  FaUsers, 
  FaCog,
  FaStore,
  FaShieldAlt,
  FaMobileAlt,
  FaComments
} from 'react-icons/fa';
import { 
  RiProductHuntLine, 
  RiBarChartBoxLine,
  RiCustomerService2Line,
  RiSecurePaymentLine
} from 'react-icons/ri';
import { 
  MdInventory, 
  MdAnalytics,
  MdPayment,
  MdSupportAgent
} from 'react-icons/md';

const features = [
  {
    icon: <RiProductHuntLine className="text-3xl text-[#CBA135]" />,
    title: 'Easy Product Listing',
    description: 'Showcase your furniture with high-quality images, detailed descriptions, and customizable pricing options.',
  },
  {
    icon: <MdInventory className="text-3xl text-[#CBA135]" />,
    title: 'Inventory Management',
    description: 'Track stock levels, set alerts for low inventory, and manage product variations effortlessly.',
  },
  {
    icon: <FaChartLine className="text-3xl text-[#CBA135]" />,
    title: 'Sales Analytics',
    description: 'Gain insights into your best-selling products, customer preferences, and revenue trends.',
  },
  {
    icon: <FaShippingFast className="text-3xl text-[#CBA135]" />,
    title: 'Order Fulfillment',
    description: 'Streamline your shipping process with integrated delivery tracking and customer notifications.',
  },
  {
    icon: <RiSecurePaymentLine className="text-3xl text-[#CBA135]" />,
    title: 'Secure Payments',
    description: 'Receive payments securely with multiple payment options and automated payout systems.',
  },
  {
    icon: <FaUsers className="text-3xl text-[#CBA135]" />,
    title: 'Customer Management',
    description: 'Build relationships with your customers through order history and communication tools.',
  },
  {
    icon: <RiBarChartBoxLine className="text-3xl text-[#CBA135]" />,
    title: 'Performance Dashboard',
    description: 'Monitor your store performance with real-time metrics and growth indicators.',
  },
  {
    icon: <FaStore className="text-3xl text-[#CBA135]" />,
    title: 'Custom Storefront',
    description: 'Create a unique brand presence with customizable store layouts and branding options.',
  },
  {
    icon: <MdSupportAgent className="text-3xl text-[#CBA135]" />,
    title: 'Dedicated Support',
    description: 'Get expert assistance from our vendor support team for any platform-related queries.',
  }
];

const VendorFeatureOverview = () => {
  return (
    <div className="bg-[#EAE7E1] py-16">
      <div className="px-4 md:px-8 lg:px-40 mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl popbold text-gray-900 mb-4">
            Everything You Need to Grow Your Furniture Business
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful tools and features designed specifically for furniture vendors to succeed in the digital marketplace
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-start group"
            >
              <div className="mb-4 flex justify-start">
                <div className="p-3 bg-[#FAF8F2] rounded-lg  group-hover:text-white transition-colors duration-300">
                  {feature.icon}
                </div>
              </div>
              <h4 className="text-xl popbold font-extrabold mb-3 text-gray-900 group-hover:text-[#CBA135] transition-colors">
                {feature.title}
              </h4>
              <p className="text-gray-600 popreg leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>


      </div>
    </div>
  );
};

export default VendorFeatureOverview;