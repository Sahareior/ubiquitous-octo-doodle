import { BsPerson } from 'react-icons/bs';
import { FaCartShopping } from 'react-icons/fa6';
import { FiSearch, FiX } from 'react-icons/fi';
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

  const navigate = useNavigate();

  useEffect(() => {
    const cartItems = JSON.parse(localStorage.getItem('guest_cart')) || [];
    setCart(cartItems);
    fetchCategories();
  }, [add]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/categories");
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

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

  const handleSearchChange = (text) => {
    setSearchText(text);
    
    if (text.trim()) {
      setLoading(true);
      const allNestedSubcategories = getAllNestedSubcategories();
      const results = allNestedSubcategories.filter(category =>
        category.name.toLowerCase().includes(text.toLowerCase())
      ).slice(0, 8); // Limit to 8 results like Google
      setSearchResults(results);
      setShowSearchResults(true);
      setLoading(false);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchText.trim()) {
      if (searchResults.length > 0) {
        handleCategorySelect(searchResults[0]);
      }
    }
  };

  return (
    <div className="w-full md:px-28 py-3 shadow-md flex justify-between items-center bg-white relative">
      {/* Left Section: Logo */}
      <Link to='/' className="flex items-center gap-6">
        <img src="/image/logo.png" alt="Logo" className="md:h-[32px] h-6 w-auto object-contain" />
      </Link>

      {/* Center Section: Search Bar */}
  <CategorySearch categoriesData={allCategories} />

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