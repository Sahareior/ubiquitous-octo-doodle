import { Avatar, Drawer } from 'antd';
import { IoMdArrowDropdown, IoMdMenu, IoMdClose } from 'react-icons/io';
import { FaCartShopping, FaRegHeart } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import { RxExit } from 'react-icons/rx';
import { useEffect, useRef, useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useGetCategoriesQuery } from '../../../redux/slices/Apis/vendorsApi';
import { useGetAllWishListQuery, useGetCustomerProductsQuery, useGetProfileQuery } from '../../../redux/slices/Apis/customersApi';
import Swal from 'sweetalert2'; // Import SweetAlert2

const CustomersNavbar = ({ cartCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: profileData, error, refetch } = useGetProfileQuery();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { data: allCategories } = useGetCategoriesQuery();
  const { data: allProducts, isLoading } = useGetCustomerProductsQuery();
   const { data: wishLists,  isError } = useGetAllWishListQuery();

  const userInfo = JSON.parse(localStorage.getItem('customerId'));
  const isAdmin = userInfo?.user?.email === 'admin@gmail.com' || userInfo?.user?.role === 'admin'|| userInfo?.user?.role === 'Admin';

  const handleLogout = () => {
    // Show confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out from your account",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Perform logout if confirmed
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("customerId");
        navigate("/login");
        
        // Show success message
        Swal.fire(
          'Logged out!',
          'You have been successfully logged out.',
          'success'
        );
      }
    });
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
    setMobileMenuOpen(false);
  };

  const handleProductSelect = (product) => {
    navigate("/details", { state: product });
    setSearchText('');
    setShowSearchResults(false);
    setMobileMenuOpen(false);
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
  const annomalyImage = "/image/ann.png"

  const profileImg = profileData?.profile_image || annomalyImage
  return (
    <>
      <div className="w-full px-4 md:px-8 lg:px-20 py-3 shadow-md flex justify-between items-center bg-white relative">
        {/* Logo and Mobile Menu Button */}
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <IoMdMenu size={24} />
          </button>
          
          <Link to="/" className="flex-shrink-0">
            <img
              src="/image/logo.png"
              alt="Logo"
              className="h-8 md:h-[32px] w-auto object-contain"
            />
          </Link>
        </div>

        {/* Desktop Category Dropdown */}
        <div className="hidden lg:block" ref={dropdownRef}>
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
                  <button className="px-4 py-2 text-sm text-gray-700 popmed hover:bg-gray-100 cursor-pointer w-full text-left">
                    {category.name}
                  </button>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Search Bar - Hidden on mobile when menu is open */}
        <div className={`${mobileMenuOpen ? 'hidden' : 'flex'} md:flex hidden md:block items-center flex-1 max-w-lg mx-4 md:mx-8`}>
          <div ref={searchRef} className="relative w-full"> 
            <div className="relative">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => {
                  searchText && setShowSearchResults(true);
                  setIsSearchFocused(true);
                }}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
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
                    className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b  border-gray-100 last:border-b-0"
                    onClick={() => handleProductSelect(product)}
                  >
                    <img 
                      src={product.images[0]?.image || annomalyImage} 
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm truncate">{product.name}</div>
                      {/* <div className="text-xs text-gray-500 truncate">{product.short_description}</div> */}
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-semibold text-[#CBA135]">
                          XAF {product.price1}
                        </span>
                        <span className="text-xs  text-gray-500">___by {product.vendor_details.first_name}</span>
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
        </div>

        {/* Desktop Icons */}
        <div className="hidden md:flex items-center gap-2 text-sm font-medium">
          {isAdmin ? (
            <Link
              to="/admin-dashboard"
              className="px-4 py-1 bg-[#CBA135] text-white rounded-md hover:bg-[#b38f2e] transition"
            >
              Dashboard
            </Link>
          ) : (
            <>
       {/* Wishlist Icon with Count */}
<Link to="wishlist" className="relative p-2">
  <FaRegHeart size={22} className="cursor-pointer hover:text-red-500 transition" />
  {wishLists?.count > 0 && (
 <span className="absolute -top-1 -right-1 bg-[#CBA135] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
      {wishLists.count}
    </span>
  )}
</Link>

{/* Cart Icon with Count */}
<Link to="cart" className="relative p-2">
  <FaCartShopping size={20} className="cursor-pointer hover:text-[#CBA135] transition" />
  {cartCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-[#CBA135] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
      {cartCount}
    </span>
  )}
</Link>

            </>
          )}

          <Link to="/profile" className="inline-block p-2">
            <Avatar
              size={32}
              src={profileImg}
              alt="User Avatar"
            />
          </Link>
          <div 
            onClick={handleLogout}
            className="cursor-pointer p-2 hover:text-red-500 transition"
            title="Logout"
          >
            <RxExit size={22} />
          </div>
        </div>

        {/* Mobile Icons - Only show when search is not focused */}
        <div className={`md:hidden flex items-center gap-2 ${isSearchFocused ? 'hidden' : 'flex'}`}>
          {!isAdmin && (
            <>
              <Link to="wishlist" className="p-1">
                <FaRegHeart size={20} className="cursor-pointer hover:text-red-500 transition" />
              </Link>
              <Link to="cart" className="p-1">
                <FaCartShopping size={18} className="cursor-pointer hover:text-[#CBA135] transition" />
              </Link>
            </>
          )}
          <Link to="/profile" className="inline-block p-1">
            <Avatar
              size={28}
              src={profileImg}
              alt="User Avatar"
            />
          </Link>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <Drawer
        title={
          <div className="flex justify-between items-center">
            <span>Menu</span>
            <button onClick={() => setMobileMenuOpen(false)}>
              <IoMdClose size={20} />
            </button>
          </div>
        }
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
        className="md:hidden"
      >
        <div className="flex flex-col h-full">
          {/* Mobile Search - Only in drawer */}

          {/* Mobile Category Dropdown */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-3">Categories</h4>
            <div className="space-y-2">
              {allCategories?.results?.map((category) => (
                <Link 
                  to={`/filter?category=${category.id}`} 
                  key={category.id}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                    {category.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Admin Dashboard Link */}
          {isAdmin && (
            <div className="mb-6">
              <Link
                to="/admin-dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 bg-[#CBA135] text-white rounded-md text-center hover:bg-[#b38f2e] transition"
              >
                Admin Dashboard
              </Link>
            </div>
          )}

          {/* Mobile Navigation Links */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-3">Account</h4>
            <div className="space-y-2">
              <Link 
                to="/profile" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                My Profile
              </Link>
              {!isAdmin && (
                <>
                  <Link 
                    to="wishlist" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    My Wishlist
                  </Link>
                  <Link 
                    to="cart" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    My Cart
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Logout Button at bottom */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
            >
              <RxExit size={18} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default CustomersNavbar;