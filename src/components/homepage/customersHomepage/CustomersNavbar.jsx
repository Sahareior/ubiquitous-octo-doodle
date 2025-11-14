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
import CategorySearch from './Category/CategorySearch';

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
    navigate(`/details?id=${product?.id}`, { state: product });
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
      <div className="w-full px-1 md:px-8 lg:px-20 py-3 shadow-md flex justify-between items-center bg-white relative">
        {/* Logo and Mobile Menu Button */}
        <div className="flex items-center gap-2">

          
          <Link to="/" className="flex-shrink-0">
            <img
              src="/image/logo.png"
              alt="Logo"
              className="h-6 md:h-[32px] w-auto object-contain"
            />
          </Link>
        </div>



        {/* Search Bar - Hidden on mobile when menu is open */}
    <CategorySearch categoriesData={allCategories}/>

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
              <Link to="wishlist" className="p-1 relative">
                <FaRegHeart size={20} className="cursor-pointer hover:text-red-500 transition" />
                  {wishLists?.count > 0 && (
 <span className="absolute -top-2 -right-1 bg-[#CBA135] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
      {wishLists.count}
    </span>
  )}
              </Link>
              <Link to="cart" className="p-1 relative">
                <FaCartShopping size={18} className="cursor-pointer hover:text-[#CBA135] transition" />
                 {cartCount > 0 && (
    <span className="absolute -top-2 -right-1 bg-[#CBA135] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
      {cartCount}
    </span>
  )}
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
   
    </>
  );
};

export default CustomersNavbar;