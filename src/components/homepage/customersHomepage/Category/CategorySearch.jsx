import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiSearch } from 'react-icons/fi';

/**
 * Walk the tree and return only the leaf nodes (categories with no children)
 */
const getLeafCategories = (categories = []) => {
  const leaves = [];
  const walk = (cats) => {
    cats.forEach((cat) => {
      if (cat.children && cat.children.length > 0) {
        walk(cat.children);
      } else {
        leaves.push(cat);
      }
    });
  };
  walk(categories);
  return leaves;
};

const CategorySearch = ({ categoriesData }) => {
  const [searchText, setSearchText] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const isSelectingSuggestion = useRef(false);

  // 1. Get only leaf categories
  const leafCategories = useMemo(
    () => getLeafCategories(categoriesData?.results),
    [categoriesData]
  );

  // 2. Filter leaves by search term - this replaces searchResults
  const searchResults = useMemo(() => {
    if (!searchText.trim()) return [];
    const lower = searchText.toLowerCase();
    return leafCategories.filter((cat) =>
      cat.name.toLowerCase().includes(lower)
    );
  }, [searchText, leafCategories]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (value) => {
    setSearchText(value);
    if (value.trim()) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
    isSelectingSuggestion.current = false;
  };

  const handleCategorySelect = (category) => {
    isSelectingSuggestion.current = true;
    setSearchText(category.name);
    setShowSearchResults(false);
    setIsSearchFocused(false);
    
    // Navigate to /filter with category data
    navigate('/filter', {
      state: {
        categoryId: category.id,
        categoryName: category.name,
      },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        // Navigate with the first suggestion on Enter
        handleCategorySelect(searchResults[0]);
      } else if (searchText.trim()) {
        setShowSearchResults(false);
      }
    }
    if (e.key === 'Escape') {
      setShowSearchResults(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setShowSearchResults(false);
    isSelectingSuggestion.current = false;
    inputRef.current?.focus();
  };

  // Handle mouse down on suggestions to prevent blur interference
  const handleSuggestionMouseDown = (e) => {
    e.preventDefault();
    isSelectingSuggestion.current = true;
  };

  // Handle touch events for mobile
  const handleSuggestionTouchStart = (e) => {
    e.preventDefault();
    isSelectingSuggestion.current = true;
  };

  return (
    <div className="flex-1 max-w-lg mx-4">
      <div className="relative">
        <input
          ref={inputRef}
          value={searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchText) {
              setShowSearchResults(true);
            }
            setIsSearchFocused(true);
          }}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          placeholder="Search categories..."
          className="w-full border border-gray-300 px-4 py-1 pr-12 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-full bg-white transition-all duration-150"
        />
{searchText && (
  <FiX
    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
    size={18}
    onMouseDown={(e) => {
      e.preventDefault(); // Prevent input blur
      clearSearch();
    }}
  />
)}

        <div 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
          onClick={() => searchText.trim() && handleSearchChange(searchText)}
        >
          <FiSearch size={18} />
        </div>
      </div>
      
      {/* Google-style Search Suggestions */}
      {showSearchResults && (searchText || searchResults.length > 0) && isSearchFocused && (
        <div 
          ref={suggestionsRef}
          className="absolute top-10 w-96 left-[40%] right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] mt-1 overflow-hidden"
        >
          {searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((category) => (
                <div
                  key={category._id || category.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors flex items-center gap-3"
                  onClick={() => handleCategorySelect(category)}
                  onMouseDown={handleSuggestionMouseDown}
                  onTouchStart={handleSuggestionTouchStart}
                >
                  <FiSearch className="text-gray-400" size={16} />
                  <span className="text-gray-800 text-sm">{category.name}</span>
                </div>
              ))}
            </div>
          ) : searchText.trim() ? (
            <div className="p-3 text-center text-gray-500">
              No categories found for "{searchText}"
            </div>
          ) : null}
          
          {/* Footer similar to Google */}
          {searchResults.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500 bg-gray-50">
              Press Enter to select first result
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySearch;