import { AiFillHeart } from 'react-icons/ai';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
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

  // Paginated products
  const { currentProducts, totalPages } = useMemo(() => {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);
    return { currentProducts, totalPages };
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Pagination buttons
  const paginationButtons = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => (
      <button
        key={index + 1}
        onClick={() => setCurrentPage(index + 1)}
        className={`px-4 py-2 rounded-md border ${
          currentPage === index + 1
            ? 'bg-[#CBA135] text-white border-[#CBA135]'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
      >
        {index + 1}
      </button>
    ));
  }, [totalPages, currentPage]);

  // Search submit handler
  const handleSearch = () => {
    navigate(`/filter?search=${searchText}`);
    setCurrentPage(1);
  };

  if (isLoading) return <p className="p-20 text-center">Loading products...</p>;
  if (isError) return <p className="p-20 text-center text-red-500">Failed to load products</p>;

  return (
    <div className="p-20 bg-[#FAF8F2] space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-[30px] popbold font-extrabold">Featured Products</h2>
          <p className="text-[18px] text-gray-600">Explore our curated furniture categories</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search products..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="border px-3 py-2 rounded-md focus:outline-none"
          />
          <button onClick={handleSearch} className="bg-[#CBA135] text-white px-3 py-2 rounded-md">
            Search
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
        <div className="flex justify-center mt-10 gap-2">
          {paginationButtons}
        </div>
      )}
    </div>
  );
};

export default React.memo(FeaturedProducts);
