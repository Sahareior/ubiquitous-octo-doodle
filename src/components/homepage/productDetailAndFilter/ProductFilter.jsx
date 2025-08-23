import React, { useEffect, useState, useMemo } from 'react';
import { Button, Checkbox, Slider, Select, Rate, Radio, Pagination, Spin } from 'antd';
import { FaRegHeart } from "react-icons/fa6";
import { RxCross1 } from "react-icons/rx";
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

  // Filters state
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [availability, setAvailability] = useState(false);
  const [sort, setSort] = useState('Newest');

  // Fetch products
  const { data: allProducts, isLoading, isError } = useGetCustomerProductsQuery();
  const {data: fetchedCategories} = useGetCategoriesQuery();

  // Extract unique categories and brands dynamically
  const categoryMap = useMemo(() => {
    const map = {};
    fetchedCategories?.results?.forEach(cat => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [fetchedCategories]);

  const categories = useMemo(() => {
    if (!allProducts?.results) return [];
    
    const allCatIds = allProducts.results
      .map(p => p.categories || [])
      .flat();
    
    const uniqueCatIds = [...new Set(allCatIds.filter(Boolean))];
    
    return uniqueCatIds
      .map(id => categoryMap[id])
      .filter(Boolean);
  }, [allProducts, categoryMap]);

  const brands = useMemo(() => {
    if (!allProducts?.results) return [];
    
    const brs = allProducts.results.map(p => p.name);
    return [...new Set(brs)];
  }, [allProducts]);

  const selectedCategoryIds = useMemo(() => {
    return Object.entries(categoryMap)
      .filter(([id, name]) => selectedCategory.includes(name))
      .map(([id]) => Number(id));
  }, [selectedCategory, categoryMap]);

  const filteredProducts = useMemo(() => {
    if (!allProducts?.results) return [];
    
    return allProducts.results
      .filter(p => {
        // Handle cases where categories might be undefined
        const productCategories = p.categories || [];
        return !selectedCategoryIds.length || productCategories.some(c => selectedCategoryIds.includes(c));
      })
      .filter(p => !selectedBrand.length || selectedBrand.includes(p.name))
      .filter(p => !selectedRating || (p.average_rating || 0) >= selectedRating)
      .filter(p => !availability || p.is_stock)
      .filter(p => {
        // Use price1 as active_price if active_price doesn't exist
        const price = p.active_price || parseFloat(p.price1) || 0;
        return price >= priceRange[0] && price <= priceRange[1];
      })
      .sort((a, b) => {
        // Use price1 as active_price if active_price doesn't exist
        const priceA = a.active_price || parseFloat(a.price1) || 0;
        const priceB = b.active_price || parseFloat(b.price1) || 0;
        
        if (sort === 'Price: Low to High') return priceA - priceB;
        if (sort === 'Price: High to Low') return priceB - priceA;
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [allProducts, selectedCategoryIds, selectedBrand, selectedRating, availability, priceRange, sort]);

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
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className='bg-[#FAF8F2]'>
      <div className='flex p-6 gap-2 pb-6 pt-1'>
        <Breadcrumb />
      </div>

      {location.pathname === "/filter" && (
        <div className="flex gap-6 pb-12 px-20 ">
          {/* Filters */}
          <div className="w-72 bg-white p-4">
            <div className='flex justify-between '>
              <h3 className="text-lg popbold mb-2">Filters</h3>
              <Button className='border-none popmed' onClick={() => {
                setSelectedCategory([]);
                setSelectedBrand([]);
                setSelectedRating(null);
                setPriceRange([0,5000]);
                setAvailability(false);
              }}>Clear All</Button>
            </div>

            {/* Category */}
            <div className="my-4">
              <p className="popmed mb-2">Category</p>
              <div className="h-34 popreg text-[#666666] overflow-y-scroll space-y-1 bg-white rounded-md px-2">
                {categories?.map((item, index) => (
                  <label key={index} className="flex items-center space-x-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      value={item}
                      checked={selectedCategory.includes(item)}
                      onChange={e => {
                        const val = e.target.value;
                        setSelectedCategory(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]);
                      }}
                      className="w-4 h-4 border border-[#333] rounded-sm accent-[#CBA135] bg-white"
                    />
                    <span>{item}</span>
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
              <div className="h-40 text-[#666666] overflow-y-scroll bg-white rounded-md px-2">
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
                  <div key={stars}>
                    <Radio
                      checked={selectedRating === stars}
                      onChange={() => setSelectedRating(stars)}
                    >
                      <div className='flex gap-3'>
                        <Rate className='text-sm' disabled defaultValue={stars} />
                        <p className='text-[#666666] popreg'>{stars} stars</p>
                      </div>
                    </Radio>
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

          {/* Products */}
          <div className="flex-1 px-6">
            <div className="flex justify-between items-center mb-1">
              <div>
                <h2 className="text-2xl popbold">Search Results</h2>
                <p className="text-gray-500 popreg">{filteredProducts.length} products found</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#666666] popreg">Sort by:</span>
                <div className='relative'>
                  <Select className='w-36 popreg relative' value={sort} onChange={setSort} options={[{ value: 'Newest' }, { value: 'Price: Low to High' }, { value: 'Price: High to Low' }]} />
                  <RiArrowDropDownLine size={20} className='absolute top-2 right-2' />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <Spin size="large" />
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-3 text-center py-10">
                  <p>No products found matching your criteria</p>
                </div>
              ) : (
                filteredProducts.map(product => {
                  // Use price1 as active_price if active_price doesn't exist
                  const price = product.active_price || parseFloat(product.price1) || 0;
                  const rating = product.average_rating || 0;
                  
                  return (
                    <div key={product.id} className="bg-white rounded-2xl shadow-md relative">
                      <Link to='details' state={{product}}>
                        <img 
                          src={product.images?.[0]?.image || "https://via.placeholder.com/400x300"} 
                          alt={product.name} 
                          className="w-full rounded-t-2xl h-64 object-cover mb-4" 
                        />
                      </Link>
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
                      <div className="px-4 space-y-2 p-5">
                        <h3 className="popmed text-lg">{product.name}</h3>
                        <div className="flex gap-2">
                          <Rate disabled defaultValue={rating} className="text-yellow-500 text-sm mb-1" />
                        </div>
                        <div className="flex justify-between items-center gap-10">
                          <p className="text-[20px] popbold mb-3">${price}</p>
                          <Button onClick={() => handleCart(product)} className="bg-yellow-600 rounded-xl popreg max-w-[10rem] text-white py-2 px-4 hover:bg-yellow-700">
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-6 flex justify-center">
              <Pagination defaultCurrent={1} total={filteredProducts.length} pageSize={9} />
            </div>
          </div>
        </div>
      )}

      <Outlet />
    </div>
  );
};

export default ProductFilter;