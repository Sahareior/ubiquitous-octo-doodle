import { Avatar } from 'antd';
import { IoMdArrowDropdown } from 'react-icons/io';
import { FaCartShopping, FaRegHeart } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import { RxExit } from 'react-icons/rx';
import { useEffect, useRef, useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useGetCategoriesQuery } from '../../../redux/slices/Apis/vendorsApi';
import { useGetCustomerProductsQuery } from '../../../redux/slices/Apis/customersApi';

const CustomersNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { data: allCategories } = useGetCategoriesQuery();
  const { data: allProducts,isLoading } = useGetCustomerProductsQuery();

  const userInfo = JSON.parse(localStorage.getItem('customerId'));
  const isAdmin = userInfo?.user?.email === 'admin@gmail.com';

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("customerId");
    navigate("/login");
  };

  // Filter products based on search text
  useEffect(() => {
    if (searchText && allProducts?.results) {
      const filtered = allProducts.results.filter(product => 
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.short_description.toLowerCase().includes(searchText.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredProducts(filtered.slice(0, 5)); // Show only top 5 results
      setShowSearchResults(true);
    } else {
      setFilteredProducts([]);
      setShowSearchResults(false);
    }
  }, [searchText, allProducts]);

  const handleSearch = () => {
    navigate(`/filter?${searchText ? `search=${searchText}` : ''}`);
    setShowSearchResults(false);
  };

  const handleProductSelect = (product) => {
    navigate("/details", { state: product });
    setSearchText('');
    setShowSearchResults(false);
  };

  const clearSearch = () => {
    setSearchText('');
    setShowSearchResults(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full px-20 py-3 shadow-md flex justify-between items-center bg-white relative">
      {/* Left Section */}
      <div className="flex justify-between w-2/6 items-center gap-6">
        <Link to="/">
          <img
            src="/image/logo.png"
            alt="Logo"
            className="h-[32px] w-auto object-contain"
          />
        </Link>

        <div ref={dropdownRef} className="relative inline-block">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 cursor-pointer hover:text-[#CBA135] transition"
          >
            <h4 className="font-medium text-sm">Category</h4>
            <IoMdArrowDropdown size={16} />
          </div>

          {isOpen && (
            <div className="absolute mt-2 w-40 bg-[#FAF8F2] shadow-lg rounded-md border border-gray-200 z-10">
              {allCategories?.results?.map((category) => (
                <Link 
                  to={`/filter?category=${category.id}`} 
                  className="w-full flex justify-center"
                  key={category.id}
                >
                  <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer w-full text-left">
                    {category.name}
                  </button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-between w-3/6 gap-24">
        <div ref={searchRef} className="relative w-full">
          <div className="relative">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              onFocus={() => searchText && setShowSearchResults(true)}
              placeholder="Search products..."
              className="w-full border border-[#E5E7EB] px-4 py-2 pr-10 placeholder:pl-1 focus:outline-none focus:ring-0 focus:border-[#E5E7EB] rounded-xl"
            />
            {searchText && (
              <FiX
                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                size={18}
                onClick={clearSearch}
              />
            )}
            <FiSearch
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
              size={18}
              onClick={handleSearch}
            />
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && filteredProducts.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-80 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleProductSelect(product)}
                >
                  <img 
                    src={product.images[0]?.image || '/image/placeholder-product.png'} 
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm truncate">{product.name}</div>
                    <div className="text-xs text-gray-500 truncate">{product.short_description}</div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm font-semibold text-[#CBA135]">
                        ${product.price1}
                      </span>
                      <span className="text-xs text-gray-500">{product.vendor_details.first_name}</span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length > 0 && searchText && (
                <div 
                  className="p-3 text-center text-sm font-medium text-[#CBA135] hover:bg-gray-100 cursor-pointer border-t border-gray-100"
                  onClick={handleSearch}
                >
                  View all results for "{searchText}"
                </div>
              )}
            </div>
          )}
          {showSearchResults && searchText && filteredProducts.length === 0 && !isLoading && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4">
              <div className="text-center text-gray-500">No products found</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-[1rem] text-sm font-medium">
          {isAdmin ? (
            <Link
              to="/admin-dashboard"
              className="px-4 py-1 bg-[#CBA135] text-white rounded-md hover:bg-[#b38f2e] transition"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="wishlist">
                <FaRegHeart size={22} className="cursor-pointer hover:text-red-500 transition" />
              </Link>
              <Link to="cart">
                <FaCartShopping size={20} className="cursor-pointer hover:text-[#CBA135] transition" />
              </Link>
            </>
          )}

          <Link to="/profile" className="inline-block">
            <Avatar
              size={32}
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1170&auto=format&fit=crop"
              alt="User Avatar"
            />
          </Link>
          <Link onClick={handleLogout} to='/login'>
            <RxExit size={22} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomersNavbar;
