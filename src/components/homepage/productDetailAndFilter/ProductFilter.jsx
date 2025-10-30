import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { Rate, Button, Slider } from "antd";
import Swal from "sweetalert2";
import { useAddProductToCartMutation, useGetAllWishListQuery, useGetAppCartQuery, useSavetoWishListMutation } from "../../../redux/slices/Apis/customersApi";

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
  const [priceRange, setPriceRange] = useState([0, 5000]);
   const { data: cartData, refetch } = useGetAppCartQuery();
  const [cart, setCart] = useState([]);
    const [addProductToCart] = useAddProductToCartMutation();
    const [savetoWishList] = useSavetoWishListMutation();
      const { data: wishLists, refetch: wishListRefetch } =
        useGetAllWishListQuery();
    

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
  }, [selectedFilters, products, priceRange]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/categories");
      setCategories(data);
      console.log('Categories loaded:', data.length);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

    const localStorageCart = JSON.parse(localStorage.getItem('guest_cart')) || []

    const checkCartData = useCallback(
    (id) => {
      // console.log('insude ', id)
     if(localStorageCart.length > 0){
       return localStorageCart.some((items) => items.id === id);
     }
     else{
       return cartData?.results?.some((items) => items.product.id === id);
     }
    },
    [cartData]
  );


    const checkWishList = useCallback(
      (id) => {
        if (!wishLists?.results) return false;
        return wishLists?.results?.some(
          (item) => item.product.id === id || item.id === id
        );
      },
      [wishLists]
    );

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
  const handleWishlist = async (item) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      Swal.fire({
        title: "Please Sign In Your Account!",
        text: "You need to log in to access this page.",
        icon: "warning",
        confirmButtonText: "Go to Login",
        confirmButtonColor: "#3085d6",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });

      return null; // prevent rendering children until after Swal closes
    }

    const payload = {
      item,
      product_id: item.id,
    };

    try {
      await savetoWishList(payload).unwrap();
      wishListRefetch();
      MySwal.fire({
        position: "top-end",
        icon: "success",
        title: "Item added to wishlist!",
        showConfirmButton: false,
        timer: 1800,
        toast: true,
      });
    } catch (error) {
      console.error("Wishlist error:", error);
      MySwal.fire({
        position: "top-end",
        icon: "error",
        title: "Failed to add to wishlist",
        showConfirmButton: false,
        timer: 1800,
        toast: true,
      });
    }
  };

  const checkWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

    const handleCart = useCallback(
      async (data) => {
        const payload = {
          ...data,
          id: data.id,
          quantity: 1,
          product_id: data.id,
        };
        delete payload.prod_id;
  
        const token = localStorage.getItem("access_token");
  
        if (!token) {
          // 🛒 Handle guest cart (store in localStorage)
          const existingCart =
            JSON.parse(localStorage.getItem("guest_cart")) || [];
  
          // Check if product already exists in guest cart
          const existingItemIndex = existingCart.findIndex(
            (item) => item.id === payload.id
          );
  
          if (existingItemIndex !== -1) {
            // Update quantity if it already exists
            existingCart[existingItemIndex].quantity += 1;
          } else {
            existingCart.push(payload);
          }
  
          localStorage.setItem("guest_cart", JSON.stringify(existingCart));
  
          MySwal.fire({
            position: "top-end",
            icon: "success",
            title: "Item added to cart!",
            showConfirmButton: false,
            timer: 1800,
            toast: true,
          });
  
          setAdd((items) => !items);
  
          return; // Exit function since user is not logged in
        }
  
        // 🧾 Handle logged-in cart
        await addProductToCart(payload);
        refetch();
  
        MySwal.fire({
          position: "top-end",
          icon: "success",
          title: "Item added to cart!",
          showConfirmButton: false,
          timer: 1800,
          toast: true,
        });
      },
      [addProductToCart, refetch]
    );

  // Cart functions
  // const handleCart = (product) => {

  //   console.log( product.Responsed_products.id)
  //   setCart(prev => {
  //     const isInCart = prev.some(item => item.id === product.id);
  //     if (isInCart) {
  //       return prev.filter(item => item.id !== product.id);
  //     } else {
  //       return [...prev, { ...product, quantity: 1 }];
  //     }
  //   });
  // };



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

  // Apply filters to products including price range
// Apply filters to products including price range and category
const applyFilters = () => {
  let filtered = [...products];

  // First: Always apply category hierarchy filter
  filtered = filtered.filter(product => {
    const productCategoryId = product.category?.toString();
    const productSubCategoryId = product.subcategory?.toString();
    const productNestedId = product.nestedSubcategory?.toString();

    // If no category is selected, show all products
    if (!selectedCategoryId) return true;

    // Check main category match
    const matchesMainCategory = productCategoryId === selectedCategoryId.toString();
    if (!matchesMainCategory) return false;

    // Check subcategory if selected
    if (selectedSubCategoryId) {
      const matchesSubCategory = productSubCategoryId === selectedSubCategoryId.toString();
      if (!matchesSubCategory) return false;
    }

    // Check nested subcategory if selected
    if (selectedNestedId) {
      const matchesNestedCategory = productNestedId === selectedNestedId.toString();
      if (!matchesNestedCategory) return false;
    }

    return true;
  });

  console.log('Products after category filter:', filtered.length, {
    selectedCategoryId,
    selectedSubCategoryId, 
    selectedNestedId
  });

  // Second: Apply price range filter
  filtered = filtered.filter(product => {
    const productPrice = product.price || product.Responsed_products?.old_price || 0;
    return productPrice >= priceRange[0] && productPrice <= priceRange[1];
  });

  console.log('Products after price filter:', filtered.length);

  // Third: Apply specification filters if any
  if (Object.keys(selectedFilters).length > 0) {
    filtered = filtered.filter(product => {
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
    console.log('Products after specification filters:', filtered.length);
  }

  setFilteredProducts(filtered);
};

  // Clear all filters including price range
  const clearAllFilters = () => {
    setSelectedFilters({});
    setPriceRange([0, 5000]);
    console.log('Cleared all filters and price range');
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

  // Calculate rating for product
  const calculateRating = (product) => {
    return product.Responsed_products?.average_rating || product.rating || Math.random() * 2 + 3;
  };

  // Get product price
  const getProductPrice = (product) => {
    return product.price || product.Responsed_products?.old_price || 0;
  };

  // Get product stock
  const getProductStock = (product) => {
    return product.stock || product.Responsed_products?.stock_quantity || 0;
  };

  // Get product images
  const getProductImages = (product) => {
    return product.images || product.Responsed_products?.images || [];
  };

  // Get product promotion info
  const getProductPromotion = (product) => {
    return {
      discount_type: product.promotion_discount_type || product.Responsed_products?.promotion_discount_type,
      discount_value: product.promotion_discount_value || product.Responsed_products?.promotion_discount_value,
      old_price: product.Responsed_products?.old_price,
      new_price: product.Responsed_products?.new_price
    };
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
        <div className="p-8 text-center border border-gray-200 rounded-lg bg-white">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Filters Available</h3>
          <p className="text-gray-600 text-sm">We're preparing filter options for this category.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-6 border border-gray-200 rounded-lg bg-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 font-normal"
          >
            Clear all
          </button>
        </div>

        {/* Price Range Filter */}
        <div>
          <div className="my-4">
            <p className="popmed mb-2">Price Range</p>
            <Slider
              range
              min={0}
              max={5000}
              step={100}
              value={priceRange}
              onChange={setPriceRange}
            />
            <div className="flex justify-between popreg text-sm">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>
        
        {/* Filter Sections */}
        <div className="space-y-6">
          {filterOptions.map((filter) => (
            <div 
              key={filter._id || filter.id} 
              className="space-y-4"
            >
              <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                {filter.name}
              </label>
              
              {/* Checkbox Filter */}
              {filter.type === 'checkbox' && (
                <div className="space-y-3">
                  {filter.options.map((option) => (
                    <label key={option} className="flex items-center group cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFilterSelected(filter.name, option, 'checkbox')}
                        onChange={() => handleFilterChange(filter.name, option, 'checkbox')}
                        className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                      />
                      <span className="ml-3 popmed text-sm  text-yellow-700 group-hover:text-gray-900 transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* Radio Filter */}
              {filter.type === 'radio' && (
                <div className="space-y-3">
                  {filter.options.map((option) => (
                    <label key={option} className="flex items-center group cursor-pointer">
                      <input
                        type="radio"
                        name={filter.name}
                        checked={isFilterSelected(filter.name, option, 'radio')}
                        onChange={() => handleFilterChange(filter.name, option, 'radio')}
                        className="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* Color Swatch Filter - Common in home decor */}
              {filter.type === 'color' && (
                <div className="flex flex-wrap gap-3">
                  {filter.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleFilterChange(filter.name, option, 'color')}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                        isFilterSelected(filter.name, option, 'color') 
                          ? 'border-gray-900 ring-2 ring-gray-200' 
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: option.toLowerCase() }}
                      title={option}
                    />
                  ))}
                </div>
              )}

              {/* Price Range Filter - Common in home decor */}
              {filter.type === 'range' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>${filter.min}</span>
                    <span>${filter.max}</span>
                  </div>
                  <input
                    type="range"
                    min={filter.min}
                    max={filter.max}
                    // Add your range handling logic here
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Results Count */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{filteredProducts.length}</span> products
          </p>
        </div>
      </div>
    );
  };

  // Render selected filters including price range
  const renderSelectedFilters = () => {
    const hasFilters = Object.keys(selectedFilters).length > 0 || priceRange[0] > 0 || priceRange[1] < 5000;
    
    if (!hasFilters) return null;

    return (
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-2xl">
        <span className="text-sm font-medium text-gray-700">Active Filters:</span>
        
        {/* Price Range Filter */}
        {(priceRange[0] > 0 || priceRange[1] < 5000) && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Price: ${priceRange[0]} - ${priceRange[1]}
            <button
              onClick={() => setPriceRange([0, 5000])}
              className="ml-2 text-red-600 hover:text-red-800 font-bold"
            >
              ×
            </button>
          </span>
        )}
        
        {/* Other Filters */}
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
                className="ml-2 text-red-600 hover:text-red-800 font-bold"
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
    const productData = product.Responsed_products || product;
    const productId = productData.id || product._id;
    const productName = productData.name || product.name;
    const productImages = getProductImages(product);
    const productPrice = getProductPrice(product);
    const productStock = getProductStock(product);
    const promotion = getProductPromotion(product);
    const rating = calculateRating(product);
    const isInWishlist = checkWishList(productId);
    const isInCart = checkCartData(productId);

    const hasPromotion = promotion.discount_value > 0;
    const displayPrice = hasPromotion ? (promotion.new_price || productPrice) : productPrice;

    return (
      <div
        key={productId}
        className="bg-white rounded-2xl shadow-md relative overflow-hidden transition-transform hover:scale-[1.02]"
      >
        <Link to={`/details?id=${productId}`} state={product}>
          <img
            src={productImages[0]?.image || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=658"}
            alt={productName}
            className="w-full rounded-t-2xl h-48 md:h-56 lg:h-64 object-cover"
          />
        </Link>

        {/* Wishlist Button */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleWishlist( product.Responsed_products);
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
        {hasPromotion && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
            -{promotion.discount_value}{promotion.discount_type === 'percentage' ? '%' : ' XAF'}
          </span>
        )}

        <div className="p-4 space-y-2">
          <h3 className="text-base md:text-lg line-clamp-1 font-medium">{productName}</h3>
          
          {/* Rating */}
          <div className="flex gap-2">
            <Rate disabled defaultValue={rating} className="text-yellow-500 text-xs md:text-sm" />
          </div>

          {/* Price and Add to Cart */}
          <div className="flex justify-between items-center gap-2">
            <div className="flex flex-col">
              {hasPromotion ? (
                <>
                  <span className="text-gray-400 line-through text-sm">
                    XAF {productPrice}
                  </span>
                  <span className="text-[#CBA135] font-bold text-lg md:text-[20px]">
                    XAF {displayPrice}
                  </span>
                </>
              ) : (
                <span className="text-[#CBA135] font-bold text-lg md:text-[20px]">
                  XAF {displayPrice}
                </span>
              )}
            </div>

            <Button
              onClick={() => handleCart( product.Responsed_products)}
              className={`rounded-md font-bold text-white border-none px-4 py-1 
                ${isInCart ? "bg-green-500" : "bg-[#CBA135]"} 
                ${productStock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={productStock <= 0}
            >
              {productStock <= 0 ? 'Out of Stock' : isInCart ? 'Added' : 'Add to Cart'}
            </Button>
          </div>

          {/* Stock Status */}
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>
              {productStock > 0 ? `${productStock} in stock` : 'Out of stock'}
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
      <div className="max-w-8xl md:mx-40">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{getCurrentCategoryName()}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar - Category Selection & Filters */}
          <div className="lg:col-span-1 h-[80vh] overflow-y-auto space-y-6">
            {/* Category Selection */}
            <div className="bg-white p-4 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Categories</h3>
              
              <div className="space-y-3 ">
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
          <div className="lg:col-span-3 gap-x-6 mb-5 h-[80vh] overflow-y-auto space-y-6">
            {/* Selected Filters */}
            {renderSelectedFilters()}

            {/* Results Count */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{filteredProducts.length}</span> products
                {priceRange[0] > 0 || priceRange[1] < 5000 ? ` within $${priceRange[0]} - $${priceRange[1]}` : ''}
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
                {filteredProducts.map(renderProductCard,)}
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