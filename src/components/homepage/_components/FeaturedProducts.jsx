import { AiFillHeart } from 'react-icons/ai';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart, addToWishList } from '../../../redux/slices/customerSlice';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  useAddProductToCartMutation,
  useGetAppCartQuery,
  useGetCustomerProductsQuery,
  useSavetoWishListMutation
} from '../../../redux/slices/Apis/customersApi';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const MySwal = withReactContent(Swal);

// Memoized Product Card
const ProductCard = React.memo(({ item, handleCart, handleWishlist }) => (
  <div className="shadow-md">
    <div className="bg-white rounded-xl transition relative">
      {/* Wishlist Icon */}
      <div
        onClick={() => handleWishlist(item)}
        className="absolute top-3 right-3 rounded-full p-2 shadow-sm cursor-pointer transition text-white bg-white/10 backdrop-blur-md hover:text-red-400"
      >
        <AiFillHeart size={18} />
      </div>

      {/* Image */}
      <Link to={`/details`} state={item}>
        <img
          src={item?.images?.[0]?.image || 'https://via.placeholder.com/300x200'}
          alt={item.name}
          className="w-full h-[192px] object-cover rounded-md mb-4"
          loading="lazy"
        />
      </Link>

      {/* Info */}
      <div className="p-5">
        <h2 className="text-[16px] popbold text-gray-800">{item.name}</h2>
        <p className="text-sm popreg text-gray-500 mb-3">{item.sku}</p>
        <div className="flex justify-between items-center">
          <h4 className="text-[#CBA135] popbold text-[16px]">XAF {item.price1}</h4>
          <button
            onClick={() => handleCart(item)}
            className="bg-[#CBA135] rounded-md popbold text-white border-none px-4 py-1"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  </div>
));
ProductCard.displayName = 'ProductCard';

const FeaturedProducts = () => {
  const [addProductToCart] = useAddProductToCartMutation();
  const [savetoWishList] = useSavetoWishListMutation();
  const dispatch = useDispatch();
  const { refetch } = useGetAppCartQuery();
  const { data: allProducts, isLoading, isError } = useGetCustomerProductsQuery();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Create refs for scrolling
  const componentTopRef = useRef(null);
  const productsGridRef = useRef(null);

  // Search state
  const queryParams = new URLSearchParams(location.search);
  const searchFromUrl = queryParams.get('search') || '';
  const [searchText, setSearchText] = useState(searchFromUrl);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Update search when URL changes
  useEffect(() => {
    setSearchText(searchFromUrl);
  }, [searchFromUrl]);

  // Memoized cart handler
  const handleCart = useCallback(async (data) => {
    const payload = { ...data, id: data.id, quantity: 1, product_id: data.id };
    delete payload.prod_id;

    await addProductToCart(payload);
    refetch();
    dispatch(addToCart(payload));

    MySwal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Item added to cart!',
      showConfirmButton: false,
      timer: 1800,
      toast: true,
    });
  }, [addProductToCart, dispatch, refetch]);

  const handleWishlist = async (item) => {
    const payload = {
      item,
      product_id: item.id,
    };

    try {
      await savetoWishList(payload).unwrap();

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

  // Filtered products (partial search)
  const filteredProducts = useMemo(() => {
    if (!allProducts?.results) return [];
    return allProducts.results.filter(product =>
      product.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [allProducts, searchText]);

  // Scroll to top of component on page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    
    // Scroll to the top of the products grid within the component
    if (productsGridRef.current) {
      const yOffset = -80; // Adjust this value as needed
      const y = productsGridRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'auto'
      });
    }
  }, []);

  // Paginated products
  const { currentProducts, totalPages } = useMemo(() => {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);
    return { currentProducts, totalPages };
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Pagination buttons
  const paginationButtons = useMemo(() => {
    const buttons = [];
    const maxVisiblePages = 5; // Maximum number of page buttons to show
    
    // Always show first page
    buttons.push(
      <button
        key={1}
        onClick={() => handlePageChange(1)}
        className={`px-4 py-2 rounded-md border ${
          currentPage === 1
            ? 'bg-[#CBA135] text-white border-[#CBA135]'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
      >
        1
      </button>
    );
    
    // Calculate start and end of visible page range
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust if we're near the start
    if (currentPage <= 3) {
      endPage = Math.min(totalPages - 1, 4);
    }
    
    // Adjust if we're near the end
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - 3);
    }
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      buttons.push(
        <span key="start-ellipsis" className="px-2 py-2">
          ...
        </span>
      );
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-md border ${
            currentPage === i
              ? 'bg-[#CBA135] text-white border-[#CBA135]'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      buttons.push(
        <span key="end-ellipsis" className="px-2 py-2">
          ...
        </span>
      );
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-4 py-2 rounded-md border ${
            currentPage === totalPages
              ? 'bg-[#CBA135] text-white border-[#CBA135]'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  }, [totalPages, currentPage, handlePageChange]);

  if (isLoading) return <p className="p-20 text-center">Loading products...</p>;
  if (isError) return <p className="p-20 text-center text-red-500">Failed to load products</p>;

  return (
    <div className="md:p-20 p-3 bg-[#FAF8F2] space-y-6" ref={componentTopRef}>
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-[30px] popbold font-extrabold">Featured Products</h2>
          <p className="text-[18px] text-gray-600">Explore our curated furniture categories</p>
        </div>
      </div>

      {/* Product Grid with ref */}
      <div ref={productsGridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentProducts.length === 0 ? (
          <div className="col-span-4 text-center py-10">
            No products found matching "{searchText}"
          </div>
        ) : (
          currentProducts.map(item => (
            <ProductCard
              key={item.id}
              item={item}
              handleCart={handleCart}
              handleWishlist={handleWishlist}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2 flex-wrap">
          {/* Previous button */}
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md border ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft />
          </button>
          
          {paginationButtons}
          
          {/* Next button */}
          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md border ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            <ArrowRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(FeaturedProducts);