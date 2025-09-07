import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Button, Checkbox, Slider, Select, Rate, Radio, Pagination, Spin, Drawer } from 'antd';
import { FaRegHeart, FaFilter } from "react-icons/fa6";
import Breadcrumb from '../../others/Breadcrumb';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { RiArrowDropDownLine } from "react-icons/ri";
import { useDispatch } from 'react-redux';
import { addToCart, addToWishList } from '../../../redux/slices/customerSlice';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useGetCategoriesQuery, useGetCustomerProductsQuery } from '../../../redux/slices/Apis/customersApi';

const MySwal = withReactContent(Swal);

const ProductFilter = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFromUrl = queryParams.get('category'); 
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Create a ref for the product list section
  const productListRef = useRef(null);
  
  // Filters state
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [availability, setAvailability] = useState(false);
  const [sort, setSort] = useState('Newest');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Fetch products & categories
  const { data: allProducts, isLoading } = useGetCustomerProductsQuery();
  const { data: fetchedCategories } = useGetCategoriesQuery();

  // Set initial category from URL parameter
  useEffect(() => {
    if (categoryFromUrl) {
      // If categoryFromUrl is a number (ID), use it directly
      // If it's a name, find the corresponding ID
      const categoryId = isNaN(categoryFromUrl) 
        ? Object.entries(categoryMap).find(([id, name]) => name === categoryFromUrl)?.[0]
        : parseInt(categoryFromUrl);
      
      if (categoryId) {
        setSelectedCategoryIds([categoryId]);
      }
    }
  }, [categoryFromUrl, fetchedCategories]);

  // Category map
  const categoryMap = useMemo(() => {
    const map = {};
    fetchedCategories?.results?.forEach(cat => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [fetchedCategories]);

  // Get category names for display
  const categories = useMemo(() => {
    if (!allProducts?.results) return [];
    const allCatIds = allProducts.results.map(p => p.categories || []).flat();
    const uniqueCatIds = [...new Set(allCatIds.filter(Boolean))];
    return uniqueCatIds.map(id => ({
      id,
      name: categoryMap[id]
    })).filter(cat => cat.name);
  }, [allProducts, categoryMap]);

  const brands = useMemo(() => {
    if (!allProducts?.results) return [];
    const brs = allProducts.results.map(p => p.name);
    return [...new Set(brs)];
  }, [allProducts]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!allProducts?.results) return [];
    return allProducts.results
      .filter(p => {
        const productCategories = p.categories || [];
        return !selectedCategoryIds.length || productCategories.some(c => selectedCategoryIds.includes(c));
      })
      .filter(p => !selectedBrand.length || selectedBrand.includes(p.name))
      .filter(p => !selectedRating || (p.average_rating || 0) >= selectedRating)
      .filter(p => !availability || p.is_stock)
      .filter(p => {
        const price = p.active_price || parseFloat(p.price1) || 0;
        return price >= priceRange[0] && price <= priceRange[1];
      })
      .sort((a, b) => {
        const priceA = a.active_price || parseFloat(a.price1) || 0;
        const priceB = b.active_price || parseFloat(b.price1) || 0;
        if (sort === 'Price: Low to High') return priceA - priceB;
        if (sort === 'Price: High to Low') return priceB - priceA;
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [allProducts, selectedCategoryIds, selectedBrand, selectedRating, availability, priceRange, sort]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryIds, selectedBrand, selectedRating, availability, priceRange, sort]);

  const handleCart = (product) => {
    dispatch(addToCart(product));
    MySwal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Item added to cart!',
      background: '#FFFFFF',
      showConfirmButton: false,
      timer: 1800,
      toast: true,
    });
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", // instant scroll
    });
  }, []);

  // Handle page change with scroll to product list
  const handlePageChange = (page) => {
    setCurrentPage(page);
    
    // Scroll to the product list section instead of the top of the page
    if (productListRef.current) {
      const yOffset = -60; // Adjust this value as needed
      const y = productListRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  // Filter sidebar component
  const FilterSidebar = () => (
    <div className="bg-white p-4 h-full">
      <div className='flex justify-between '>
        <h3 className="text-lg popbold mb-2">Filters</h3>
        <Button className='border-none popmed' onClick={() => {
          setSelectedCategoryIds([]);
          setSelectedBrand([]);
          setSelectedRating(null);
          setPriceRange([0, 5000]);
          setAvailability(false);
        }}>Clear All</Button>
      </div>

      {/* Category */}
      <div className="my-4">
        <p className="popmed mb-2">Category</p>
        <div className="max-h-34 popreg text-[#666666] overflow-y-auto space-y-1 bg-white rounded-md px-2">
          {categories?.map((item) => (
            <label key={item.id} className="flex items-center space-x-2 py-1 cursor-pointer">
              <input
                type="checkbox"
                value={item.id}
                checked={selectedCategoryIds.includes(item.id)}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  setSelectedCategoryIds(prev => prev.includes(val) 
                    ? prev.filter(i => i !== val) 
                    : [...prev, val]);
                }}
                className="w-4 h-4 border border-[#333] rounded-sm accent-[#CBA135] bg-white"
              />
              <span>{item.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
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

      {/* Brand */}
      <div className="my-4">
        <p className="font-medium popmed mb-2">Brand</p>
        <div className="max-h-40 text-[#666666] overflow-y-auto bg-white rounded-md px-2">
          {brands?.map((item) => (
            <label key={item} className="flex items-center space-x-2 py-1 cursor-pointer popreg">
              <input
                type="checkbox"
                value={item}
                checked={selectedBrand.includes(item)}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedBrand(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]);
                }}
                className="w-4 h-4 border border-[#333] rounded-sm accent-[#CBA135] bg-white"
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
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

      {/* Availability */}
      <div className="my-7">
        <p className="popmed mb-2">Availability</p>
        <Checkbox className='text-[#666666] popreg' onChange={(e) => setAvailability(e.target.checked)} checked={availability}>
          In Stock Only
        </Checkbox>
      </div>
    </div>
  );

  return (
    <div className='bg-[#FAF8F2] min-h-screen'>
      <div className='flex p-4 md:p-6 gap-2 md:px-6 lg:px-20 pb-6 pt-1'>
        <Breadcrumb />
      </div>

      {location.pathname === "/filter" && (
        <div className="pb-12 md:px-6 lg:px-20">
          {/* Mobile filter button */}
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
            {/* Desktop Filters */}
            <div className="hidden md:block md:w-72 lg:w-80 flex-shrink-0">
              <FilterSidebar />
            </div>

            {/* Mobile Filters Drawer */}
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

            {/* Products */}
            <div className="flex-1 px-4 md:px-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl popbold">Search Results</h2>
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

              <div ref={productListRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {isLoading ? (
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
                        setSelectedBrand([]);
                        setSelectedRating(null);
                        setPriceRange([0, 5000]);
                        setAvailability(false);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  paginatedProducts.map(product => {
                    const price = product.active_price || parseFloat(product.price1) || 0;
                    const rating = product.average_rating || 0;

                    return (
<div
  key={product.id}
  className="bg-white rounded-2xl shadow-md relative overflow-hidden transition-transform hover:scale-[1.02]"
>
  <Link to='details' state={product}>
    <img
      src={product.images?.[0]?.image || "https://via.placeholder.com/400x300"}
      alt={product.name}
      className="w-full rounded-t-2xl h-48 md:h-56 lg:h-64 object-cover"
    />
  </Link>

  {/* Wishlist */}
  <div
    onClick={(e) => {
      e.stopPropagation();
      dispatch(addToWishList(product));
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
    <FaRegHeart size={15} />
  </div>

  <div className="p-4 space-y-2">
    <h3 className="popmed text-base md:text-lg line-clamp-1">{product.name}</h3>
    <div className="flex gap-2">
      <Rate disabled defaultValue={rating} className="text-yellow-500 text-xs md:text-sm" />
    </div>

    {/* Price & Discount */}
    <div className="flex justify-between items-center gap-2">
      <div className="flex flex-col">
        {product.promotion_discount_value > 0 ? (
          <>
            <span className="text-gray-400 line-through text-sm">
              XAF {product.price1}
            </span>
            <span className="text-[#CBA135] popbold text-lg md:text-[20px]">
              XAF {product.new_price}
            </span>
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
              -{product.promotion_discount_value}{product.promotion_type === 'percentage' ? '%' : 'XAF'}
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
        className="bg-yellow-600 rounded-xl popreg text-white py-1 md:py-2 px-2 md:px-4 hover:bg-yellow-700 text-xs md:text-sm"
      >
        Add to Cart
      </Button>
    </div>
  </div>
</div>

                    );
                  })
                )}
              </div>

              {/* Pagination */}
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