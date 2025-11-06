// Footer.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaFacebookF, FaInstagram, FaPhone, FaTwitter, FaChartLine, FaBox, FaUsers, FaCog } from 'react-icons/fa';
import CustomModal from '../../checkout/modal/CustomModal';


const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  // Use the same categories query as CategoryDropdown

  
 const userType = localStorage.getItem('user_role');

  const handelClick = () => {
    navigate('/vendorpage');
  };





  // Vendor-specific navigation links


const renderVendorContent = () => (
  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 justify-items-center text-center md:text-left">
    {/* Logo and description */}
    <div className="md:col-span-1 flex flex-col items-center md:items-start">
      <img
        src="/image/footer.png"
        alt="WIROKO Vendor Portal"
        className="w-[180px] mb-4"
      />
      <p className="text-[#E5E7EB] popreg mb-4 max-w-sm">
        Premium luxury furniture marketplace for vendors. Grow your business with WIROKO.
      </p>

      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-center md:justify-start gap-2">
          <FaPhone className="text-[#CBA135]" />
          <span className="text-[#E5E7EB] popreg">Vendor Support: +237696745108</span>
        </div>
        <div className="flex items-center justify-center md:justify-start gap-2">
          <FaEnvelope className="text-[#CBA135]" />
          <span className="text-[#E5E7EB] popreg">vendors@wiroko.com</span>
        </div>
      </div>

      <p className="mb-2 text-[16px] popbold text-[#E5E7EB]">Follow Us</p>
      <div className="flex justify-center md:justify-start gap-4 text-[#CBA135]">
        <a href="#"><FaFacebookF className="hover:text-white" /></a>
        <a href="#"><FaInstagram className="hover:text-white" /></a>
        <a href="#"><FaTwitter className="hover:text-white" /></a>
      </div>
    </div>

    {/* Centered Company section */}
    <div className="flex flex-col items-center md:items-start">
      <h3 className="text-xl popbold text-[#FAF8F2] font-semibold mb-4">
        Company
      </h3>
      <ul className="space-y-2 text-[#FAF8F2] popreg text-lg">
        <li>
          <Link
            to="/aboutUs"
            className="hover:text-[#CBA135] transition-colors duration-200"
          >
            About Us
          </Link>
        </li>
        <li>
          <Link
            to="/contactUs"
            className="hover:text-[#CBA135] transition-colors duration-200"
          >
            Contact Us
          </Link>
        </li>
      </ul>
    </div>
  </div>
);


  const renderCustomerContent = () => (
    <div className="max-w-7xl md:justify-items-center mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
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
    <footer className="bg-black text-white  px-3 py-12">
      <div>
        {userType === 'vendor' ? renderVendorContent() : renderCustomerContent()}
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
        <p>© {new Date().getFullYear()} WIROKO. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link to="/privacy" className="md:mt-0 hover:text-white">Privacy Policy</Link>
          <Link to="/terms&conditions" className="hover:text-white">Terms & Conditions</Link>

        </div>
      </div>

      <CustomModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </footer>
  );
};

export default Footer;