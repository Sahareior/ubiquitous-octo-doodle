// In ProductFilter.jsx - updated to use categoryProducts data
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Button, Checkbox, Slider, Select, Rate, Radio, Pagination, Spin, Drawer } from 'antd';
import { FaRegHeart, FaFilter } from "react-icons/fa6";
import Breadcrumb from '../../others/Breadcrumb';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { RiArrowDropDownLine } from "react-icons/ri";
import { useDispatch } from 'react-redux';
import { addToCart, addToWishList } from '../../../redux/slices/customerSlice';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAddProductToCartMutation, useGetAllWishListQuery, useGetAppCartQuery, useGetCategoriesQuery, useGetCustomerProductsQuery, useSavetoWishListMutation } from '../../../redux/slices/Apis/customersApi';
import { useWebSocketContext } from '../../../context/WebSocketContext';
import { useGetProductsByCategoryQuery } from '../../../redux/slices/Apis/vendorsApi';

const MySwal = withReactContent(Swal);

const ProductFilter = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  
  // Get category data from navigation state
  const navigationState = location.state;
  const queryParams = new URLSearchParams(location.search);
  const categoryFromUrl = queryParams.get('category'); 
  
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [addProductToCart] = useAddProductToCartMutation();
  const { data: cartData, refetch } = useGetAppCartQuery();
  const { data: wishLists, refetch: wishListRefetch } = useGetAllWishListQuery();
  const [savetoWishList] = useSavetoWishListMutation();

  const productListRef = useRef(null);
  const navigate = useNavigate();
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [availability, setAvailability] = useState(false);
  const [sort, setSort] = useState('Newest');
  const { add, setAdd } = useWebSocketContext();
  const [currentPage, setCurrentPage] = useState(1);
  const childSubId = navigationState?.selectedNestedCategory?.id;
  const searchId = location?.state?.categoryId

  

  const { data: categoryProducts, loading: categoryLoading } = useGetProductsByCategoryQuery(childSubId||searchId );

  const pageSize = 6;

  // Use categoryProducts data instead of allProducts
  const { data: fetchedCategories } = useGetCategoriesQuery();

  const getGuestCart = useCallback(() => {
    return JSON.parse(localStorage.getItem('guest_cart')) || [];
  }, []);

  // Extract filters and products from categoryProducts
  const filters = categoryProducts?.filters || [];
  const products = categoryProducts?.products || [];
  const category = categoryProducts?.category;

  const [selectedFilters, setSelectedFilters] = useState({});

const handleFilterChange = useCallback((filterId, value) => {
  setSelectedFilters(prev => {
    // If the same radio button is clicked again, unselect it
    if (prev[filterId] === value) {
      const newFilters = { ...prev };
      delete newFilters[filterId];
      return newFilters;
    }
    // Otherwise, set the new value
    return { ...prev, [filterId]: value };
  });
}, []);

  const handleMultiFilterChange = useCallback((filterId, value, checked) => {
    setSelectedFilters(prev => {
      let current = prev[filterId] || [];
      if (checked) {
        current = [...current, value];
      } else {
        current = current.filter(v => v !== value);
      }
      return {...prev, [filterId]: current};
    });
  }, []);

  
  // Handle category selection from navigation
  useEffect(() => {
    if (navigationState) {
      const { selectedCategoryId, selectedSubCategoryId, selectedNestedId } = navigationState;
      
      // Set the selected category IDs for filtering
      const categoryIds = [];
      if (selectedNestedId) categoryIds.push(selectedNestedId);
      else if (selectedSubCategoryId) categoryIds.push(selectedSubCategoryId);
      else if (selectedCategoryId) categoryIds.push(selectedCategoryId);
      
      setSelectedCategoryIds(categoryIds);
    } else if (categoryFromUrl) {
      // Handle URL parameter fallback
      const categoryId = isNaN(categoryFromUrl) 
        ? Object.entries(categoryMap).find(([id, name]) => name === categoryFromUrl)?.[0]
        : parseInt(categoryFromUrl);
      
      if (categoryId) {
        setSelectedCategoryIds([categoryId]);
      }
    }
  }, [navigationState, categoryFromUrl, fetchedCategories]);

  // Display selected category information
  const selectedCategoryInfo = useMemo(() => {
    if (!navigationState) return null;
    
    const { selectedCategory, selectedSubCategory, selectedNestedCategory, text } = navigationState;
    
    return {
      mainCategory: selectedCategory,
      subCategory: selectedSubCategory,
      nestedCategory: selectedNestedCategory,
      displayText: text
    };
  }, [navigationState]);

  const checkCartData = useCallback(
    (id) => {
      const token = localStorage.getItem("access_token");
      
      // If user is not logged in, check guest cart
      if (!token) {
        const guestCart = getGuestCart();
        return guestCart.some((item) => item.id === id);
      }
      
      // If user is logged in, check server cart data
      return cartData?.results?.some((item) => item.product.id === id);
    },
    [cartData, getGuestCart]
  );

  const checkWishList = useCallback((id) => {
    if (!wishLists?.results) return false;
    return wishLists.results.some(item => item.product.id === id || item.id === id);
  }, [wishLists]);

  const categoryMap = useMemo(() => {
    const map = {};
    fetchedCategories?.results?.forEach(cat => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [fetchedCategories]);

  // Get colors from products
  const colors = useMemo(() => {
    if (!products) return [];
    const colorSet = new Set();
    products.forEach(product => {
      if (product.specifications?.color) {
        const colorList = product.specifications.color
          .split(/[,/]/)
          .map(color => color.trim().toLowerCase()) 
          .filter(color => color.length > 0);
        colorList.forEach(color => colorSet.add(color));
      }
    });
    return Array.from(colorSet)
      .sort()
      .map(color => ({
        label: color.charAt(0).toUpperCase() + color.slice(1),
        value: color
      }));
  }, [products]);

  // Filter products based on selected filters
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products
      .filter(p => {
        const productCategories = p.categories || [];
        return !selectedCategoryIds.length || productCategories.some(c => selectedCategoryIds.includes(c));
      })
      .filter(p => {
        if (!selectedColors.length) return true;
        if (!p.specifications?.color) return false;
        const productColors = p.specifications.color
          .split(/[,/]/)
          .map(c => c.trim().toLowerCase());
        return productColors.some(c => selectedColors.includes(c));
      })
      .filter(p => !selectedRating || (p.average_rating || 0) >= selectedRating)
      .filter(p => !availability || p.is_stock)
      .filter(p => {
        const price = p.new_price || parseFloat(p.price1) || 0;
        return price >= priceRange[0] && price <= priceRange[1];
      })
      .filter(p => {
        // Filter based on selected filter options
        return Object.entries(selectedFilters).every(([filterId, selected]) => {
          if (!selected || (Array.isArray(selected) && !selected.length)) return true;
          
          const filter = filters.find(f => f.id === parseInt(filterId));
          if (!filter) return true;
          
          // Check if product has the filter option in product_filter array
          const productFilterIds = p.product_filter || [];
          const filterOptionIds = filter.options.map(opt => opt.id);
          
          const matchingOptionIds = productFilterIds.filter(id => filterOptionIds.includes(id));
          if (matchingOptionIds.length === 0) return false;
          
          if (filter.filter_type === "radio") {
            // For radio, check if any matching option value equals the selected value
            const selectedOption = filter.options.find(opt => opt.value === selected);
            return selectedOption && matchingOptionIds.includes(selectedOption.id);
          } else {
            // For checkbox, check if any matching option value is in selected array
            return matchingOptionIds.some(optionId => {
              const option = filter.options.find(opt => opt.id === optionId);
              return option && selected.includes(option.value);
            });
          }
        });
      })
      .sort((a, b) => {
        const priceA = a.new_price || parseFloat(a.price1) || 0;
        const priceB = b.new_price || parseFloat(b.price1) || 0;
        if (sort === 'Price: Low to High') return priceA - priceB;
        if (sort === 'Price: High to Low') return priceB - priceA;
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [products, selectedCategoryIds, selectedColors, selectedRating, availability, priceRange, sort, selectedFilters, filters]);

  const availableColors = useMemo(() => {
    if (!filteredProducts || filteredProducts.length === 0) return [];
    const colorSet = new Set();
    filteredProducts.forEach(product => {
      if (product.specifications?.color) {
        const colorList = product.specifications.color
          .split(/[,/]/)
          .map(c => c.trim().toLowerCase())
          .filter(c => c.length > 0);
        colorList.forEach(c => colorSet.add(c));
      }
    });
    return Array.from(colorSet)
      .sort()
      .map(c => ({
        label: c.charAt(0).toUpperCase() + c.slice(1),
        value: c
      }));
  }, [filteredProducts]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryIds, selectedColors, selectedRating, availability, priceRange, sort, selectedFilters]);

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
        const existingCart = getGuestCart();

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
    [addProductToCart, refetch, getGuestCart, setAdd]
  );

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

      return null;
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

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", 
    });
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (productListRef.current) {
      const yOffset = -60; 
      const y = productListRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  // Category Breadcrumb Component
  const CategoryBreadcrumb = () => {
    if (!selectedCategoryInfo) return null;
    
    const { mainCategory, subCategory, nestedCategory } = selectedCategoryInfo;
    
    return (
      <div className="mb-4 p-3 bg-white rounded-lg shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Category:</span>
          {mainCategory && (
            <>
              <span className="font-medium">{mainCategory.name}</span>
              {subCategory && (
                <>
                  <span>›</span>
                  <span className="font-medium">{subCategory.name}</span>
                  {nestedCategory && (
                    <>
                      <span>›</span>
                      <span className="font-medium">{nestedCategory.name}</span>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

const FilterSidebar = () => (
  <div className="bg-white p-4 h-full">
    <div className='flex justify-between '>
      <h3 className="text-lg popbold mb-2">Filters</h3>
      <Button className='border-none popmed' onClick={() => {
        setSelectedCategoryIds([]);
        setSelectedColors([]);
        setSelectedRating(null);
        setPriceRange([0, 5000]);
        setAvailability(false);
        setSelectedFilters({});
      }}>Clear All</Button>
    </div>

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

    <div className="my-4">
      <p className="font-medium popmed mb-2">Colors</p>
      <div className="max-h-40 text-[#666666] overflow-y-auto bg-white rounded-md px-2">
        {availableColors.length > 0 ? (
          availableColors.map(({ label, value }) => (
            <label
              key={value}
              className="flex items-center space-x-2 py-1 cursor-pointer popreg"
            >
              <input
                type="checkbox"
                value={value}
                checked={selectedColors.includes(value)}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedColors(prev =>
                    prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]
                  );
                }}
                className="w-4 h-4 border border-[#333] rounded-sm accent-[#CBA135] bg-white"
              />
              <span>{label}</span>
            </label>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No color data available</p>
        )}
      </div>
    </div>

    {/* Render filters from API */}
{/* Render filters from API */}
{filters.map(filter => (
  <div key={filter.id} className="my-4">
    <p className="popmed mb-2">{filter.name}</p>
    <div className="max-h-40 text-[#666666] overflow-y-auto space-y-1 bg-white rounded-md px-2">
      {filter.options.length === 0 ? (
        <p className="text-gray-400 text-sm">No options available</p>
      ) : (
        filter.filter_type === "radio" ? (
          <>
            {/* Add "None" option for radio filters to allow clearing */}
            <label
              className="flex items-center space-x-2 py-1 cursor-pointer popreg"
            >
              <input
                type="radio"
                name={`filter_${filter.id}`}
                value=""
                checked={!selectedFilters[filter.id]}
                onChange={() => handleFilterChange(filter.id, '')}
                className="w-4 h-4 border border-[#333] rounded-full accent-[#CBA135] bg-white"
              />
              <span className="text-gray-400">None</span>
            </label>
            {filter.options.map(option => (
              <label
                key={option.id}
                className="flex items-center space-x-2 py-1 cursor-pointer popreg"
              >
                <input
                  type="radio"
                  name={`filter_${filter.id}`}
                  value={option.value}
                  checked={selectedFilters[filter.id] === option.value}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  className="w-4 h-4 border border-[#333] rounded-full accent-[#CBA135] bg-white"
                />
                <span>{option.value}</span>
              </label>
            ))}
          </>
        ) : (
          filter.options.map(option => (
            <label
              key={option.id}
              className="flex items-center space-x-2 py-1 cursor-pointer popreg"
            >
              <input
                type="checkbox"
                value={option.value}
                checked={(selectedFilters[filter.id] || []).includes(option.value)}
                onChange={e => handleMultiFilterChange(filter.id, option.value, e.target.checked)}
                className="w-4 h-4 border border-[#333] rounded-sm accent-[#CBA135] bg-white"
              />
              <span>{option.value}</span>
            </label>
          ))
        )
      )}
    </div>
  </div>
))}

    <div className="my-4">
      <p className="popmed mb-2">Customer Rating</p>
      <div className="space-y-2">
        {[5, 4, 3].map(stars => (
          <div
            key={stars}
            onClick={() =>
              setSelectedRating(selectedRating === stars ? null : stars)
            }
            className={`flex items-center gap-3 cursor-pointer p-2 rounded ${
              selectedRating === stars ? 'bg-yellow-100' : ''
            }`}
          >
            <Rate className="text-sm" disabled defaultValue={stars} />
            <p className="text-[#666666] popreg">{stars} stars</p>
          </div>
        ))}
      </div>
    </div>

    <div className="my-7">
      <p className="popmed mb-2">Availability</p>
      <Checkbox className='text-[#666666] popreg' onChange={(e) => setAvailability(e.target.checked)} checked={availability}>
        In Stock Only
      </Checkbox>
    </div>
  </div>
);

  const storedRole = localStorage.getItem('user_role'); 

  return (
    <div className='bg-[#FAF8F2] min-h-screen'>
      <div className='flex p-4 md:p-6 gap-2 md:px-6 lg:px-20 pb-6 pt-1'>
        <Breadcrumb />
      </div>

      {location.pathname === "/filter" && (
        <div className="pb-12 md:px-6 lg:px-20">
          {/* Display selected category breadcrumb */}
          <CategoryBreadcrumb />
        
          <div className="px-4 md:hidden mb-4">
            <Button 
              icon={<FaFilter />} 
              onClick={() => setMobileFiltersOpen(true)}
              className="w-full flex items-center justify-center gap-2"
              size="large"
            >
              Filters {filteredProducts.length > 0 && `(${filteredProducts.length} results)`}
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="hidden md:block md:w-72 lg:w-80 flex-shrink-0">
              <FilterSidebar />
            </div>

            <Drawer
              title="Filters"
              placement="left"
              onClose={() => setMobileFiltersOpen(false)}
              open={mobileFiltersOpen}
              className='pb-11'
              width={300}
              bodyStyle={{ padding: 0, paddingBottom: '20px' }}
            >
              <FilterSidebar />
            </Drawer>

            <div className="flex-1 px-4 md:px-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl popbold">
                    {category?.name || selectedCategoryInfo?.displayText || location?.state?.text || "Search Results"}
                  </h2>
                  <p className="text-gray-500 popreg">{filteredProducts.length} products found</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-sm text-[#666666] popreg whitespace-nowrap">Sort by:</span>
                  <div className='relative flex-1 md:flex-initial'>
                    <Select 
                      className='w-full md:w-36 popreg relative' 
                      value={sort} 
                      onChange={setSort} 
                      options={[
                        { value: 'Newest' }, 
                        { value: 'Price: Low to High' }, 
                        { value: 'Price: High to Low' }
                      ]} 
                    />
                    <RiArrowDropDownLine size={20} className='absolute top-2 right-2 pointer-events-none' />
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              <div ref={productListRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {categoryLoading ? (
                  <div className="col-span-3 flex justify-center py-10">
                    <Spin size="large" />
                  </div>
                ) : paginatedProducts.length === 0 ? (
                  <div className="col-span-3 text-center py-10">
                    <p className="text-gray-500">No products found matching your criteria</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => {
                        setSelectedCategoryIds([]);
                        setSelectedColors([]);
                        setSelectedRating(null);
                        setPriceRange([0, 5000]);
                        setAvailability(false);
                        setSelectedFilters({});
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  paginatedProducts.map(product => {
                    const price = product.new_price || parseFloat(product.price1) || 0;
                    const rating = product.average_rating || 0;

                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-2xl shadow-md relative overflow-hidden transition-transform hover:scale-[1.02]"
                      >
                        <Link to={`/details?id=${product.id}`} state={product}>
                          <img
                            src={product.images?.[0]?.image || "https://via.placeholder.com/400x300"}
                            alt={product.name}
                            className="w-full rounded-t-2xl h-48 md:h-56 lg:h-64 object-cover"
                          />
                        </Link>

                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWishlist(product);
                          }}
                          className="absolute top-2 right-2 text-black w-8 h-8 flex items-center justify-center hover:text-red-500 bg-slate-100 rounded-full cursor-pointer text-xl"
                        >
                          <FaRegHeart className={checkWishList(product.id) ? "text-red-500" : "text-gray-300"} size={15} />
                        </div>

                        <div className="p-4 space-y-2">
                          <h3 className="popmed text-base md:text-lg line-clamp-1">{product.name}</h3>
                          <div className="flex gap-2">
                            <Rate disabled defaultValue={rating} className="text-yellow-500 text-xs md:text-sm" />
                          </div>

                          <div className="flex justify-between items-center gap-2">
                            <div className="flex flex-col">
                              {product.promotion_discount_value > 0 ? (
                                <>
                                  <span className="text-gray-400 line-through text-sm">
                                    XAF {product.old_price}
                                  </span>
                                  <span className="text-[#CBA135] popbold text-lg md:text-[20px]">
                                    XAF {product.new_price}
                                  </span>
                                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
                                    -{product.promotion_discount_value}{product.promotion_discount_type === 'percentage' ? ' %' : ' XAF'}
                                  </span>
                                </>
                              ) : (
                                <span className="text-[#CBA135] popbold text-lg md:text-[20px]">
                                  XAF {product.price1}
                                </span>
                              )}
                            </div>

                            <Button
                              onClick={() => handleCart(product)}
                              className={`rounded-md popbold text-white border-none px-4 py-1 
                                ${checkCartData(product.id) ? "bg-green-500" : "bg-[#CBA135]"} 
                                ${storedRole === 'admin' ? 'hidden' : ''}`}
                            >
                              {checkCartData(product.id) ? 'Added' : 'Add to Cart'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {filteredProducts.length > 0 && (
                <div className="mt-6 flex gap-9 justify-center">
                  <Pagination
                    current={currentPage}
                    total={filteredProducts.length}
                    pageSize={pageSize}
                    className='space-x-2'
                    onChange={handlePageChange}
                    responsive
                    showSizeChanger={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Outlet />
    </div>
  );
};

export default ProductFilter;