// Footer.jsx
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaFacebookF, FaInstagram, FaPhone, FaTwitter, FaChartLine, FaBox, FaUsers, FaCog } from 'react-icons/fa';
import CustomModal from '../../checkout/modal/CustomModal';
import { useDispatch } from 'react-redux';
import { useChildCategoryQuery, useGetCategoriesQuery } from '../../../redux/slices/Apis/vendorsApi';
import { selectedLocation } from '../../../redux/slices/customerSlice';
import { useWebSocketContext } from '../../../context/WebSocketContext';

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    globalMessages, 
    sendMessage, 
    connected, 
    setUserId, 
    setIncoming, 
    incoming,
    childCategories, 
    clientmsg 
  } = useWebSocketContext();

  // Use the same categories query as CategoryDropdown
  const { data: categoriesData, isLoading, isError } = useGetCategoriesQuery();
  
  const userType = localStorage.getItem('user_role');

  const handelClick = () => {
    navigate('/vendorpage');
  };

  // Function to get only the nested category from childCategories
  const getTopCategories = useMemo(() => {
    // First try to use childCategories from WebSocket context
    if (childCategories?.nested) {
      // childCategories.nested is an object, not an array
      return [{
        id: childCategories.nested.id,
        name: childCategories.nested.name,
        slug: childCategories.nested.slug,
        isParent: false
      }];
    }
    
    // Fallback: use categories from RTK Query and find leaf nodes
    if (!categoriesData || !categoriesData.results || !Array.isArray(categoriesData.results)) return [];

    const leafCategories = [];
    
    // Recursive function to find leaf nodes (categories with no children)
    const findLeafCategories = (categories) => {
      categories.forEach(category => {
        if (category.children && category.children.length > 0) {
          // If category has children, recursively check them
          findLeafCategories(category.children);
        } else {
          // If category has no children, it's a leaf node - add to results
          leafCategories.push({
            id: category.id,
            name: category.name,
            slug: category.slug,
            isParent: false,
            children: []
          });
        }
      });
    };

    // Start with the root categories from results
    findLeafCategories(categoriesData.results);

    // Return up to 5 leaf categories
    return leafCategories.slice(0, 5);
  }, [childCategories, categoriesData]);

  // Navigation handler for categories
  const handleCategoryClick = (categoryId, isParent) => {
    navigate('/filter', {
      state: {
        categoryId: categoryId, // Using searchId as required
        isParentCategory: isParent
      }
    });
  };

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

  // Rest of your Footer component remains the same...
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
            <Link to="/vendor/contactUs" className="hover:text-[#CBA135] transition-colors duration-200">
             Contact Us
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
          {isLoading ? (
            <li className="text-[#E5E7EB]">Loading categories...</li>
          ) : isError ? (
            <li className="text-[#E5E7EB]">Failed to load categories</li>
          ) : getTopCategories.length > 0 ? (
            getTopCategories.map((category) => (
              <li key={category.id}>
                <button 
                  onClick={() => handleCategoryClick(category.id, category.isParent)}
                  className="hover:text-[#CBA135] transition-colors duration-200 text-left w-full"
                >
                  {category.name}
                </button>
              </li>
            ))
          ) : (
            <li className="text-[#E5E7EB]">No categories available</li>
          )}
        </ul>
      </div>

      {/* Support */}
      <div>
        <h3 className="text-xl popbold text-[#FAF8F2] font-semibold mb-4">Support</h3>
        <ul className="space-y-2 text-[#FAF8F2] popreg text-lg">
          <li onClick={() => setIsModalOpen(true)} className="cursor-pointer hover:text-[#CBA135] transition-colors duration-200">Track Order</li>
          <li><Link to="/return" className="hover:text-[#CBA135] transition-colors duration-200">Return Request</Link></li>
          <li>
            <Link to="/contactUs" className="hover:text-[#CBA135] transition-colors duration-200">
             Contact Us
            </Link>
          </li>
          <li className="hover:cursor-pointer">
            <div onClick={handelClick} className="hover:text-[#CBA135] transition-colors duration-200">Be a Vendor</div>
          </li>
          <li><Link to="/return-policy" className="hover:text-[#CBA135] transition-colors duration-200">Return Policy</Link></li>
        </ul>
      </div>

      {/* Company */}
      <div>
        <h3 className="text-xl popbold text-[#FAF8F2] font-semibold mb-4">Company</h3>
        <ul className="space-y-2 text-[#FAF8F2] popreg text-lg">
          <li><Link to="/aboutUs" className="hover:text-[#CBA135] transition-colors duration-200">About Us</Link></li>
          <li>
            <Link to="/contactUs" className="hover:text-[#CBA135] transition-colors duration-200">
             Contact Us
            </Link>
          </li>
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