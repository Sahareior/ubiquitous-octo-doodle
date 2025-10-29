import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { Rate, Button } from "antd";
import Swal from "sweetalert2";

const ProductFilter = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [selectedNestedId, setSelectedNestedId] = useState("");
  const [filterOptions, setFilterOptions] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);

  const location = useLocation();

  // Initialize from navigation state
  useEffect(() => {
    if (location.state) {
      console.log('Navigation state received:', location.state);
      
      const { 
        selectedCategoryId, 
        selectedSubCategoryId, 
        selectedNestedId,
        categoryHierarchy 
      } = location.state;
      
      if (selectedCategoryId) {
        setSelectedCategoryId(selectedCategoryId);
        console.log('Set selectedCategoryId:', selectedCategoryId);
      }
      if (selectedSubCategoryId) {
        setSelectedSubCategoryId(selectedSubCategoryId);
        console.log('Set selectedSubCategoryId:', selectedSubCategoryId);
      }
      if (selectedNestedId) {
        setSelectedNestedId(selectedNestedId);
        console.log('Set selectedNestedId:', selectedNestedId);
      }
      
      // If we have full hierarchy, log it
      if (categoryHierarchy) {
        console.log('Full category hierarchy:', categoryHierarchy);
      }
    }
  }, [location.state]);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchProducts()]);
      setLoading(false);
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      updateFilterOptions();
      setSelectedFilters({});
    }
  }, [selectedCategoryId, selectedSubCategoryId, selectedNestedId, categories]);

  useEffect(() => {
    applyFilters();
  }, [selectedFilters, products]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/categories");
      setCategories(data);
      console.log('Categories loaded:', data.length);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/products");
      setProducts(data);
      setFilteredProducts(data);
      console.log('Products loaded:', data.length);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Wishlist functions
  const handleWishlist = (product) => {
    setWishlist(prev => {
      const isInWishlist = prev.some(item => item.id === product.id);
      if (isInWishlist) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const checkWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  // Cart functions
  const handleCart = (product) => {
    setCart(prev => {
      const isInCart = prev.some(item => item.id === product.id);
      if (isInCart) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const checkCart = (productId) => {
    return cart.some(item => item.id === productId);
  };

  // Helper function to get string ID for comparison
  const getSubCategoryIdString = (sub) => {
    if (!sub) return "";
    const id = sub.id || sub._id;
    return id ? id.toString() : "";
  };

  // Find category hierarchy
  const findCategoryHierarchy = () => {
    if (!selectedCategoryId) {
      // Check if we have hierarchy from navigation
      if (location.state?.categoryHierarchy) {
        return location.state.categoryHierarchy;
      }
      return null;
    }

    const mainCategory = categories.find((cat) => 
      cat._id === selectedCategoryId || cat.id === selectedCategoryId
    );
    
    if (!mainCategory) {
      console.log('Main category not found for ID:', selectedCategoryId);
      return null;
    }

    let subCategory = null;
    let nestedSubCategory = null;

    if (selectedSubCategoryId && mainCategory.subcategories) {
      subCategory = mainCategory.subcategories.find(
        (sub) => getSubCategoryIdString(sub) === selectedSubCategoryId.toString()
      );

      if (subCategory && selectedNestedId && subCategory.subcategories) {
        nestedSubCategory = subCategory.subcategories.find(
          (nested) => getSubCategoryIdString(nested) === selectedNestedId.toString()
        );
      }
    }

    const hierarchy = {
      main: mainCategory,
      sub: subCategory,
      nested: nestedSubCategory
    };

    console.log('Current hierarchy:', hierarchy);
    return hierarchy;
  };

  // Update filter options based on selected category hierarchy
  const updateFilterOptions = () => {
    const hierarchy = findCategoryHierarchy();
    
    if (!hierarchy) {
      console.log('No hierarchy found, clearing filter options');
      setFilterOptions([]);
      return;
    }

    let finalCategory = null;
    
    // Priority: nested -> sub -> main
    if (hierarchy.nested && hierarchy.nested.filterOptions && hierarchy.nested.filterOptions.length > 0) {
      finalCategory = hierarchy.nested;
      console.log('Using nested category filters:', hierarchy.nested.name, hierarchy.nested.filterOptions);
    } else if (hierarchy.sub && hierarchy.sub.filterOptions && hierarchy.sub.filterOptions.length > 0) {
      finalCategory = hierarchy.sub;
      console.log('Using sub category filters:', hierarchy.sub.name, hierarchy.sub.filterOptions);
    } else if (hierarchy.main && hierarchy.main.filterOptions && hierarchy.main.filterOptions.length > 0) {
      finalCategory = hierarchy.main;
      console.log('Using main category filters:', hierarchy.main.name, hierarchy.main.filterOptions);
    }

    if (finalCategory && finalCategory.filterOptions) {
      console.log('Setting filter options:', finalCategory.filterOptions);
      setFilterOptions(finalCategory.filterOptions);
    } else {
      console.log('No filter options found for current selection');
      setFilterOptions([]);
    }
  };

  // Handle filter selection
  const handleFilterChange = (filterName, value, type) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      
      if (type === 'checkbox') {
        const currentValues = newFilters[filterName] || [];
        if (currentValues.includes(value)) {
          newFilters[filterName] = currentValues.filter(v => v !== value);
        } else {
          newFilters[filterName] = [...currentValues, value];
        }
      } else {
        newFilters[filterName] = value;
      }
      
      // Remove empty filter entries
      Object.keys(newFilters).forEach(key => {
        if (!newFilters[key] || (Array.isArray(newFilters[key]) && newFilters[key].length === 0)) {
          delete newFilters[key];
        }
      });
      
      console.log('Updated filters:', newFilters);
      return newFilters;
    });
  };

  // Check if a filter option is selected
  const isFilterSelected = (filterName, value, type) => {
    if (type === 'checkbox') {
      return (selectedFilters[filterName] || []).includes(value);
    } else {
      return selectedFilters[filterName] === value;
    }
  };

  // Apply filters to products
  const applyFilters = () => {
    if (Object.keys(selectedFilters).length === 0) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product => {
      // Check if product belongs to selected category hierarchy
      const productCategoryId = product.category?.toString();
      const productSubCategoryId = product.subcategory?.toString();
      const productNestedId = product.nestedSubcategory?.toString();

      const matchesCategory = 
        productCategoryId === selectedCategoryId?.toString() &&
        (!selectedSubCategoryId || productSubCategoryId === selectedSubCategoryId?.toString()) &&
        (!selectedNestedId || productNestedId === selectedNestedId?.toString());

      if (!matchesCategory) return false;

      // Check if product matches all selected filters
      return Object.entries(selectedFilters).every(([filterName, filterValue]) => {
        const productSpec = product.specification?.find(spec => spec.name === filterName);
        
        if (!productSpec) return false;

        if (Array.isArray(filterValue)) {
          // Checkbox filter - product must have at least one of the selected values
          return filterValue.some(value => 
            productSpec.values.includes(value)
          );
        } else {
          // Radio filter - product must have the exact value
          return productSpec.values.includes(filterValue);
        }
      });
    });

    setFilteredProducts(filtered);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFilters({});
    console.log('Cleared all filters');
  };

  // Get available subcategories
  const getSubcategories = () => {
    if (!selectedCategoryId) return [];
    const mainCategory = categories.find((cat) => 
      cat._id === selectedCategoryId || cat.id === selectedCategoryId
    );
    return mainCategory?.subcategories || [];
  };

  // Get nested subcategories
  const getNestedSubcategories = () => {
    if (!selectedCategoryId || !selectedSubCategoryId) return [];

    const mainCategory = categories.find((cat) => 
      cat._id === selectedCategoryId || cat.id === selectedCategoryId
    );
    if (!mainCategory || !mainCategory.subcategories) return [];

    const subCategory = mainCategory.subcategories.find(
      (sub) => getSubCategoryIdString(sub) === selectedSubCategoryId.toString()
    );
    
    return subCategory?.subcategories || [];
  };

  // Get current category name for display
  const getCurrentCategoryName = () => {
    const hierarchy = findCategoryHierarchy();
    if (!hierarchy) return "All Products";

    return hierarchy.nested?.name || hierarchy.sub?.name || hierarchy.main?.name || "Products";
  };

  // Calculate rating for product (you can replace this with actual rating logic)
  const calculateRating = (product) => {
    // This is a placeholder - replace with your actual rating logic
    return product.rating || Math.random() * 2 + 3; // Random rating between 3-5 for demo
  };

  // SweetAlert configuration
  const MySwal = Swal.mixin({
    customClass: {
      popup: 'rounded-lg shadow-lg',
      title: 'text-lg font-semibold',
    },
  });

  // Render filter options
  const renderFilterOptions = () => {
    if (filterOptions.length === 0) {
      return (
        <div className="p-4 border rounded-2xl bg-white shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Filters</h3>
          <p className="text-gray-500 text-sm">No filters available for this category.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-4 border rounded-2xl bg-white shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All
          </button>
        </div>
        
        {filterOptions.map((filter) => (
          <div key={filter._id || filter.id} className="space-y-3 border-b pb-4 last:border-b-0">
            <label className="block font-medium text-gray-700">
              {filter.name}
            </label>
            
            {filter.type === 'checkbox' && (
              <div className="space-y-2">
                {filter.options.map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isFilterSelected(filter.name, option, 'checkbox')}
                      onChange={() => handleFilterChange(filter.name, option, 'checkbox')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 text-sm">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {filter.type === 'radio' && (
              <div className="space-y-2">
                {filter.options.map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={filter.name}
                      checked={isFilterSelected(filter.name, option, 'radio')}
                      onChange={() => handleFilterChange(filter.name, option, 'radio')}
                      className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 text-sm">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render selected filters
  const renderSelectedFilters = () => {
    if (Object.keys(selectedFilters).length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-2xl">
        <span className="text-sm font-medium text-gray-700">Active Filters:</span>
        {Object.entries(selectedFilters).map(([filterName, filterValue]) => {
          const values = Array.isArray(filterValue) ? filterValue : [filterValue];
          return values.map(value => (
            <span
              key={`${filterName}-${value}`}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {filterName}: {value}
              <button
                onClick={() => {
                  if (Array.isArray(filterValue)) {
                    handleFilterChange(filterName, value, 'checkbox');
                  } else {
                    setSelectedFilters(prev => {
                      const newFilters = { ...prev };
                      delete newFilters[filterName];
                      return newFilters;
                    });
                  }
                }}
                className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
              >
                ×
              </button>
            </span>
          ));
        })}
      </div>
    );
  };

  // Render product card
  const renderProductCard = (product) => {
    const rating = calculateRating(product);
    const isInWishlist = checkWishlist(product.id);
    const isInCart = checkCart(product.id);

    return (
      <div
        key={product.id || product._id}
        className="bg-white rounded-2xl shadow-md relative overflow-hidden transition-transform hover:scale-[1.02]"
      >
        <Link to={`/details?id=${product.id || product._id}`} state={product}>
          <img
            src={product.images?.[0]?.image || product.image || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=658"}
            alt={product.name}
            className="w-full rounded-t-2xl h-48 md:h-56 lg:h-64 object-cover"
          />
        </Link>

        {/* Wishlist Button */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleWishlist(product);
            MySwal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Item added to Wishlist!',
              showConfirmButton: false,
              timer: 1800,
              toast: true,
            });
          }}
          className="absolute top-2 right-2 text-black w-8 h-8 flex items-center justify-center hover:text-red-500 bg-slate-100 rounded-full cursor-pointer text-xl"
        >
          {isInWishlist ? (
            <FaHeart className="text-red-500" size={15} />
          ) : (
            <FaRegHeart className="text-gray-300" size={15} />
          )}
        </div>

        {/* Promotion Badge */}
        {product.promotion_discount_value > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
            -{product.promotion_discount_value}{product.promotion_discount_type === 'percentage' ? '%' : ' XAF'}
          </span>
        )}

        <div className="p-4 space-y-2">
          <h3 className="text-base md:text-lg line-clamp-1 font-medium">{product.name}</h3>
          
          {/* Rating */}
          <div className="flex gap-2">
            <Rate disabled defaultValue={rating} className="text-yellow-500 text-xs md:text-sm" />
          </div>

          {/* Price and Add to Cart */}
          <div className="flex justify-between items-center gap-2">
            <div className="flex flex-col">
              {product.promotion_discount_value > 0 ? (
                <>
                  <span className="text-gray-400 line-through text-sm">
                    XAF {product.price}
                  </span>
                  <span className="text-[#CBA135] font-bold text-lg md:text-[20px]">
                    XAF {product.new_price || (product.price - (product.promotion_discount_type === 'percentage' ? 
                      (product.price * product.promotion_discount_value / 100) : product.promotion_discount_value))}
                  </span>
                </>
              ) : (
                <span className="text-[#CBA135] font-bold text-lg md:text-[20px]">
                  XAF {product.price}
                </span>
              )}
            </div>

            <Button
              onClick={() => handleCart(product)}
              className={`rounded-md font-bold text-white border-none px-4 py-1 
                ${isInCart ? "bg-green-500" : "bg-[#CBA135]"} 
                ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={product.stock <= 0}
            >
              {product.stock <= 0 ? 'Out of Stock' : isInCart ? 'Added' : 'Add to Cart'}
            </Button>
          </div>

          {/* Stock Status */}
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products and categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-8xl mx-40">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{getCurrentCategoryName()}</h1>
        <p className="text-gray-600 mb-8">Browse our collection of {getCurrentCategoryName().toLowerCase()}</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Category Selection & Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Category Selection */}
            <div className="bg-white p-4 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Categories</h3>
              
              <div className="space-y-3">
                {/* Main Category Selector */}
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setSelectedSubCategoryId("");
                    setSelectedNestedId("");
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Main Category</option>
                  {categories.map((category) => (
                    <option key={getSubCategoryIdString(category)} value={getSubCategoryIdString(category)}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {/* Sub Category Selector */}
                {selectedCategoryId && getSubcategories().length > 0 && (
                  <select
                    value={selectedSubCategoryId}
                    onChange={(e) => {
                      setSelectedSubCategoryId(e.target.value);
                      setSelectedNestedId("");
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Sub Category</option>
                    {getSubcategories().map((sub) => (
                      <option key={getSubCategoryIdString(sub)} value={getSubCategoryIdString(sub)}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                )}

                {/* Nested Sub Category Selector */}
                {selectedSubCategoryId && getNestedSubcategories().length > 0 && (
                  <select
                    value={selectedNestedId}
                    onChange={(e) => setSelectedNestedId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Nested Category</option>
                    {getNestedSubcategories().map((nested) => (
                      <option key={getSubCategoryIdString(nested)} value={getSubCategoryIdString(nested)}>
                        {nested.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Filter Options */}
            {renderFilterOptions()}
          </div>

          {/* Main Content - Products */}
          <div className="lg:col-span-3 space-y-6">
            {/* Selected Filters */}
            {renderSelectedFilters()}

            {/* Results Count */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{filteredProducts.length}</span> of{" "}
                <span className="font-semibold">{products.length}</span> products
                {selectedCategoryId && " in selected category"}
              </p>
              
              {Object.keys(selectedFilters).length > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(renderProductCard)}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                <p className="text-gray-500 text-lg mb-4">No products found matching your filters.</p>
                <button
                  onClick={clearAllFilters}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;