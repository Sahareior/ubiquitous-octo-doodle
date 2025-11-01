import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaFacebookF, FaInstagram, FaPhone, FaTwitter, FaChartLine, FaBox, FaUsers, FaCog } from 'react-icons/fa';
import CustomModal from '../../checkout/modal/CustomModal';
import { useDispatch } from 'react-redux';
import { useGetCategoriesQuery } from '../../../redux/slices/Apis/vendorsApi';
import { selectedLocation } from '../../../redux/slices/customerSlice';

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: allCategories, isLoading, isError } = useGetCategoriesQuery();

  const userType = localStorage.getItem('user_role');
  

  const handelClick = () => {
    navigate('/vendorpage');
  };

  // For vendors, we don't need the category mappings
  const categoryMappings = useMemo(() => ({
    'Living Room': ['living room', 'livingroom', 'living', 'lounge', 'sitting room'],
    'Bedroom': ['bedroom', 'bedrooms', 'bed room', 'master bedroom', 'sleeping room'],
    'Dining Room': ['dining room', 'diningroom', 'dining', 'dinner room', 'eating area'],
    'Office Room': ['office room', 'officeroom', 'office', 'workspace', 'study room', 'study'],
    'Kitchen': ['kitchen', 'kitchens', 'cooking area', 'culinary space'],
  }), []);

  const matchedCategories = useMemo(() => {
    if (!allCategories?.results?.length) return [];

    return Object.entries(categoryMappings).map(([displayName, variations], index) => {
      const found = allCategories.results.find(cat => {
        const catName = cat?.name?.toLowerCase() || '';
        return variations.some(variation =>
          catName.includes(variation.toLowerCase()) ||
          variation.toLowerCase().includes(catName)
        );
      });

      return {
        displayName,
        id: found ? found.id : 1001 + index,
      };
    });
  }, [allCategories, categoryMappings]);

  // Vendor-specific navigation links
  const vendorLinks = [
    {
      name: 'Dashboard',
      path: '/vendor/dashboard',
      icon: <FaChartLine className="inline mr-2" />
    },
    {
      name: 'Products',
      path: '/vendor/products',
      icon: <FaBox className="inline mr-2" />
    },
    {
      name: 'Orders',
      path: '/vendor/orders',
      icon: <FaUsers className="inline mr-2" />
    },
    {
      name: 'Settings',
      path: '/vendor/settings',
      icon: <FaCog className="inline mr-2" />
    }
  ];

  // Render different content based on user type
  const renderVendorContent = () => (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
      {/* Logo and description */}
      <div className="md:col-span-1">
        <img src="/image/footer.png" alt="WIROKO Vendor Portal" className="w-[180px] mb-4" />
        <p className="text-[#E5E7EB] popreg mb-4">
          Premium luxury furniture marketplace for vendors. Grow your business with WIROKO.
        </p>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FaPhone className="text-[#CBA135]" />
            <span className="text-[#E5E7EB] popreg">Vendor Support: +237696745108</span>
          </div>
          <div className="flex items-center gap-2">
            <FaEnvelope className="text-[#CBA135]" />
            <span className="text-[#E5E7EB] popreg">vendors@wiroko.com</span>
          </div>
        </div>
        <p className="mb-2 text-[16px] popbold text-[#E5E7EB]">Follow Us</p>
        <div className="flex gap-4 text-[#CBA135]">
          <a href="#"><FaFacebookF className="hover:text-white" /></a>
          <a href="#"><FaInstagram className="hover:text-white" /></a>
          <a href="#"><FaTwitter className="hover:text-white" /></a>
        </div>
      </div>

      {/* Vendor Navigation */}
      <div>
        <h3 className="text-xl popbold text-[#FAF8F2] font-semibold mb-4">Vendor Portal</h3>
        <ul className="space-y-3 text-[#FAF8F2] popreg text-lg">
          {vendorLinks.map((link) => (
            <li key={link.name}>
              <Link 
                to={link.path} 
                className="hover:text-[#CBA135] transition-colors duration-200 flex items-center"
              >
                {link.icon}
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Resources & Support */}
      <div>
        <h3 className="text-xl popbold text-[#FAF8F2] font-semibold mb-4">Resources</h3>
        <ul className="space-y-3 text-[#FAF8F2] popreg text-lg">
          <li>
            <Link to="/vendor/help" className="hover:text-[#CBA135] transition-colors duration-200">
              Vendor Guide
            </Link>
          </li>
          <li>
            <Link to="/vendor/policies" className="hover:text-[#CBA135] transition-colors duration-200">
              Seller Policies
            </Link>
          </li>
          <li>
            <Link to="/vendor/analytics" className="hover:text-[#CBA135] transition-colors duration-200">
              Sales Analytics
            </Link>
          </li>
          <li>
            <Link to="/vendor/support" className="hover:text-[#CBA135] transition-colors duration-200">
              Support Center
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );

  const renderCustomerContent = () => (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
      {/* Logo and description */}
      <div>
        <img src="/image/footer.png" alt="WIROKO Logo" className="w-[180px] mb-4" />
        <p className="text-[#E5E7EB] popreg mb-4">
          Premium luxury furniture marketplace connecting you with the finest furniture makers.
        </p>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FaPhone className="text-[#CBA135]" />
            <span className="text-[#E5E7EB] popreg">+237696745108</span>
          </div>
          <div className="flex items-center gap-2">
            <FaEnvelope className="text-[#CBA135]" />
            <span className="text-[#E5E7EB] popreg">exchange.xw24@yahoo.com</span>
          </div>
        </div>
        <p className="mb-2 text-[16px] popbold text-[#E5E7EB]">Follow Us</p>
        <div className="flex gap-4 text-[#CBA135]">
          <a href="#"><FaFacebookF className="hover:text-white" /></a>
          <a href="#"><FaInstagram className="hover:text-white" /></a>
          <a href="#"><FaTwitter className="hover:text-white" /></a>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-xl popbold text-[#FAF8F2] font-semibold mb-4">Categories</h3>
        <ul className="space-y-2 text-[#FAF8F2] popreg text-lg">
          {isLoading ? <li>Loading categories...</li> : 
           isError ? <li>Failed to load categories</li> :
           matchedCategories.map(({ displayName, id }) => (
            <li key={id}>
              <Link to={`/filter?category=${id}`} className="hover:text-white block w-full">
                {displayName}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Support */}
      <div>
        <h3 className="text-xl popbold text-[#FAF8F2] font-semibold mb-4">Support</h3>
        <ul className="space-y-2 text-[#FAF8F2] popreg text-lg">
          <li onClick={() => setIsModalOpen(true)} className="cursor-pointer hover:text-white">Track Order</li>
          <li><Link to="/return" className="hover:text-white">Return Request</Link></li>
          <li className="hover:cursor-pointer">
            <div onClick={handelClick} className="hover:text-white">Be a Vendor</div>
          </li>
          <li><Link to="/return-policy" className="hover:text-white">Return Policy</Link></li>
        </ul>
      </div>

      {/* Company */}
      <div>
        <h3 className="text-xl popbold text-[#FAF8F2] font-semibold mb-4">Company</h3>
        <ul className="space-y-2 text-[#FAF8F2] popreg text-lg">
          <li><Link to="/aboutUs" className="hover:text-white">About Us</Link></li>
        </ul>
      </div>
    </div>
  );

  return (
    <footer className="bg-black text-white px-3 py-12">
      {userType === 'vendor' ? renderVendorContent() : renderCustomerContent()}

      {/* Bottom Footer */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
        <p>© {new Date().getFullYear()} WIROKO. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link to="/privacy" className="md:mt-0 hover:text-white">Privacy Policy</Link>
          <Link to="/terms&conditions" className="hover:text-white">Terms & Conditions</Link>
          {userType === 'vendor' && (
            <Link to="/vendor/agreement" className="hover:text-white">Vendor Agreement</Link>
          )}
        </div>
      </div>

      <CustomModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </footer>
  );
};

export default Footer;