import { BsPerson } from 'react-icons/bs';
import { FaCartShopping } from 'react-icons/fa6';
import { FiSearch, FiX, FiMenu } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useWebSocketContext } from '../../../context/WebSocketContext';
import { useEffect, useState } from 'react';
import axios from 'axios';
import CategorySearch from '../customersHomepage/Category/CategorySearch';
import { useGetCategoriesQuery } from '../../../redux/slices/Apis/vendorsApi';

const Navbar = () => {
  const { add, setAdd } = useWebSocketContext();
  const [cart, setCart] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [categories, setCategories] = useState([]);
  const { data: allCategories } = useGetCategoriesQuery();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigate = useNavigate();

  // Flatten categories to get all nested subcategories
  const getAllNestedSubcategories = () => {
    const allNested = [];
    
    categories.forEach(mainCategory => {
      if (mainCategory.subcategories) {
        mainCategory.subcategories.forEach(subCategory => {
          if (subCategory.subcategories) {
            subCategory.subcategories.forEach(nestedSubcategory => {
              allNested.push({
                ...nestedSubcategory,
                mainCategory: {
                  id: mainCategory._id || mainCategory.id,
                  name: mainCategory.name
                },
                subCategory: {
                  id: subCategory._id || subCategory.id,
                  name: subCategory.name
                }
              });
            });
          }
        });
      }
    });
    
    return allNested;
  };

  const clearSearch = () => {
    setSearchText('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleCategorySelect = (category) => {
    const categoryHierarchy = {
      selectedCategoryId: category.mainCategory.id,
      selectedSubCategoryId: category.subCategory.id,
      selectedNestedId: category._id || category.id,
      categoryHierarchy: {
        main: { 
          id: category.mainCategory.id, 
          name: category.mainCategory.name 
        },
        sub: { 
          id: category.subCategory.id, 
          name: category.subCategory.name 
        },
        nested: { 
          id: category._id || category.id, 
          name: category.name 
        }
      }
    };

    navigate('/filter', { state: categoryHierarchy });
    clearSearch();
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  return (
    <>
      <div className="w-full md:px-28 px-3 py-3 shadow-md flex justify-between items-center bg-white relative">
        {/* Left Section: Logo */}
        <Link to='/' className="flex items-center gap-6">
          <img src="/image/logo.png" alt="Logo" className="md:h-[32px] h-6 w-auto object-contain" />
        </Link>

        {/* Center Section: Search Bar */}
        <div className="hidden md:block flex-1 max-w-2xl mx-8">
          <CategorySearch categoriesData={allCategories} />
        </div>

        {/* Right Section: Desktop Login + Cart */}
        <div className="hidden md:flex items-center gap-4">
          <Link className='flex gap-2 items-center' to="/login">
            <BsPerson size={18} />
            <h4 className="cursor-pointer hover:text-blue-600 transition">Login</h4>
          </Link>
          <Link to="/cart" className="p-1 relative">
            <FaCartShopping size={18} className="cursor-pointer hover:text-[#CBA135] transition" /> 
            {cart?.length > 0 && (
              <span className="absolute -top-2 -right-1 bg-[#CBA135] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex items-center justify-center p-2"
          onClick={() => setIsDrawerOpen(true)}
        >
          <FiMenu size={24} />
        </button>
      </div>

      {/* Mobile Search Bar (below navbar on mobile) */}
      <div className="md:hidden w-full px-3 py-3 bg-white border-t">
        <CategorySearch categoriesData={allCategories} />
      </div>

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-50 transform ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleDrawerClose}
        ></div>
        
        {/* Drawer Content */}
        <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              onClick={handleDrawerClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-4">
            {/* Login Section */}
            <div className="mb-6">
              <Link 
                to="/login" 
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition"
                onClick={handleDrawerClose}
              >
                <div className="p-2 bg-blue-50 rounded-full">
                  <BsPerson size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Login / Register</h3>
                  <p className="text-sm text-gray-500">Access your account</p>
                </div>
              </Link>
            </div>

            {/* Cart Section */}
            <div>
              <Link 
                to="/cart" 
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition relative"
                state={{path:'nav'}}
                onClick={handleDrawerClose}
              >
                <div className="p-2 bg-amber-50 rounded-full">
                  <FaCartShopping size={20} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium">Shopping Cart</h3>
         
                </div>
                {cart?.length > 0 && (
                  <span className="absolute right-4 bg-[#CBA135] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Link>
            </div>

    

            {/* Logout/Account Section (if logged in) */}
            {/* Uncomment and modify when you have auth state
            {isLoggedIn && (
              <div className="mt-8 pt-6 border-t">
                <button
                  onClick={handleLogout}
                  className="w-full text-left p-3 hover:bg-red-50 text-red-600 rounded-lg transition"
                >
                  <div className="flex items-center gap-3">
                    <FiLogOut size={18} />
                    <span className="font-medium">Logout</span>
                  </div>
                </button>
              </div>
            )}
            */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;