import { BsPerson } from 'react-icons/bs';
import { FaCartShopping } from 'react-icons/fa6';
import { FiSearch, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useWebSocketContext } from '../../../context/WebSocketContext';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const { add, setAdd } = useWebSocketContext();
  const [cart, setCart] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const cartItems = JSON.parse(localStorage.getItem('guest_cart')) || [];
    setCart(cartItems);
  }, [add]);

  const handleSearch = () => {
    if (searchText.trim()) {
      // Implement your search logic here
      console.log('Searching for:', searchText);
      setShowSearchResults(true);
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setShowSearchResults(false);
  };

  return (
    <div className="w-full md:px-28 py-3 shadow-md flex justify-between items-center bg-white">
      {/* Left Section: Logo */}
      <Link to='/' className="flex items-center gap-6">
        <img src="/image/logo.png" alt="Logo" className="h-[32px] w-auto object-contain" />
      </Link>

      {/* Center Section: Search Bar */}
      <div className="flex-1 max-w-2xl mx-4">
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
        {showSearchResults && searchText && (
          <div className="absolute top-full left-0 right-0 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-50 mt-1">
            <div className="p-4">
              <p className="text-gray-600">Search results for: "{searchText}"</p>
              {/* Add your search results here */}
            </div>
          </div>
        )}
      </div>

      {/* Right Section: Login + Cart */}
      <div className="flex items-center gap-4">
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
    </div>
  );
};

export default Navbar;