import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaFacebookF, FaInstagram, FaPhone, FaTwitter } from 'react-icons/fa';
import CustomModal from '../../checkout/modal/CustomModal';
import { useDispatch } from 'react-redux';
import { selectedLocation } from '../../../redux/slices/customerSlice';
import { useGetCategoriesQuery } from '../../../redux/slices/Apis/vendorsApi';

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { data: allCategories } = useGetCategoriesQuery();

  const handelClick = () => {
    navigate('/regester-seller')
  }

  // Map of static category names to possible API name variations
  const categoryMappings = useMemo(() => ({
    'Living Room': ['living room', 'livingroom', 'living', 'lounge', 'sitting room'],
    'Bedroom': ['bedroom', 'bedrooms', 'bed room', 'master bedroom', 'sleeping room'],
    'Dining Room': ['dining room', 'diningroom', 'dining', 'dinner room', 'eating area'],
    'Office Room': ['office room', 'officeroom', 'office', 'workspace', 'study room', 'study'],
    'Kitchen': ['kitchen', 'kitchens', 'cooking area', 'culinary space']
  }), []);

  // Find matching categories from API data
  const matchedCategories = useMemo(() => {
    if (!allCategories?.results) return [];

    const matches = [];
    
    Object.entries(categoryMappings).forEach(([staticName, variations]) => {
      // Find category that matches any of the variations
      const foundCategory = allCategories.results.find(category => {
        if (!category.name) return false;
        
        const categoryName = category.name.toLowerCase().trim();
        
        // Check if category name matches any variation
        return variations.some(variation => 
          categoryName.includes(variation.toLowerCase()) || 
          variation.toLowerCase().includes(categoryName)
        );
      });

      if (foundCategory) {
        matches.push({
          staticName,
          category: foundCategory
        });
      }
    });

    return matches;
  }, [allCategories, categoryMappings]);

  // Render category links dynamically
  const renderCategoryLinks = () => {
    // If we have matched categories from API, use them
    if (matchedCategories.length > 0) {
      return matchedCategories.map(({ staticName, category }) => (
        <li key={category.id}>
          <Link 
            to={`/filter?category=${category.id}`} 
            className="hover:text-white block w-full"
          >
            {staticName}
          </Link>
        </li>
 ));
    }

    // Fallback to static categories if no API matches found
    return (
      <>
        <li><Link to="/filter?category=living-room" className="hover:text-white">Living Room</Link></li>
        <li><Link to="/filter?category=bedroom" className="hover:text-white">Bedroom</Link></li>
        <li><Link to="/filter?category=dining-room" className="hover:text-white">Dining Room</Link></li>
        <li><Link to="/filter?category=office-room" className="hover:text-white">Office Room</Link></li>
        <li><Link to="/filter?category=kitchen" className="hover:text-white">Kitchen</Link></li>
      </>
    );
  };

  return (
    <footer className="bg-black text-white px-6 py-12">
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
            {renderCategoryLinks()}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-xl popbold text-[#FAF8F2] font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-[#FAF8F2] popreg text-lg">
            <li onClick={() => setIsModalOpen(true)} className="cursor-pointer hover:text-white">Track Order</li>
            <li><Link to="/return" className="hover:text-white">Return Request</Link></li>
            <li className='hover:cursor-pointer'>
              <div onClick={() => handelClick()} className="hover:text-white">Be a Vendor</div>
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

      {/* Bottom Footer */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
        <p>© {new Date().getFullYear()} WIROKO. All rights reserved.</p>
        <div className='flex items-center gap-6'>
          <Link to="/privacy" className="mt-2 md:mt-0 hover:text-white">
            Privacy Policy
          </Link>
          <Link to="/terms&conditions" className="hover:text-white">Terms & Conditions</Link>
        </div>
      </div>

      <CustomModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </footer>
  );
};

export default Footer;