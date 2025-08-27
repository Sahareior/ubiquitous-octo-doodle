import { AiFillHeart } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart, addToWishList } from '../../../redux/slices/customerSlice';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAddProductToCartMutation, useGetAppCartQuery, useGetCustomerProductsQuery } from '../../../redux/slices/Apis/customersApi';

const MySwal = withReactContent(Swal);

const FeaturedProducts = () => {
  const [addProductToCart] = useAddProductToCartMutation();
  const dispatch = useDispatch();
  const { data: cartData , refetch} = useGetAppCartQuery();
  const { data: allProducts, isLoading, isError } = useGetCustomerProductsQuery();

  // 🔹 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const handleCart = async (data) => {
    const payload = {
      ...data,
      id: data.id,
      quantity: 1,
      product_id: data.id,
    };

    delete payload.prod_id;

    const res = await addProductToCart(payload);
    console.log(res);
    refetch()

    dispatch(addToCart(payload));

    MySwal.fire({
      position: 'top-end',
      icon: 'success',
      title: '<span style="font-family: Poppins, sans-serif;">Item added to cart!</span>',
      background: '#FFFFFF',
      customClass: {
        popup: 'rounded-xl shadow-lg',
        title: 'text-lg text-gray-800',
        icon: 'text-green-500',
      },
      showConfirmButton: false,
      timer: 1800,
      toast: true,
      didOpen: (toast) => {
        toast.style.border = '1px solid #e0e0e0';
        toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
      },
    });
  };

  if (isLoading) return <p className="p-20 text-center">Loading products...</p>;
  if (isError) return <p className="p-20 text-center text-red-500">Failed to load products</p>;

  // 🔹 Pagination logic
  const products = allProducts?.results || [];
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-20 bg-[#FAF8F2] space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-[30px] popbold font-extrabold">Featured Products</h2>
          <p className="text-[18px] text-gray-600">Explore our curated furniture categories</p>
        </div>
        <Link to="/filter">
          <h3 className="text-[#CBA135] font-medium cursor-pointer hover:underline">View All</h3>
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentProducts.map((item) => (
          <div className="shadow-md" key={item.id}>
            <div className="bg-white rounded-xl transition relative">
              {/* Wishlist Icon */}
              <div
                onClick={() => {
                  dispatch(addToWishList(item));
                  MySwal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: '<span style="font-family: Poppins, sans-serif;">Item added to Wishlist!</span>',
                    background: '#FFFFFF',
                    customClass: {
                      popup: 'rounded-xl shadow-lg',
                      title: 'text-lg text-gray-800',
                      icon: 'text-green-500',
                    },
                    showConfirmButton: false,
                    timer: 1800,
                    toast: true,
                    didOpen: (toast) => {
                      toast.style.border = '1px solid #e0e0e0';
                      toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                    },
                  });
                }}
                className="absolute top-3 right-3 rounded-full p-2 shadow-sm cursor-pointer transition text-white bg-white/10 backdrop-blur-md hover:text-red-400"
              >
                <AiFillHeart size={18} />
              </div>

              {/* Image */}
              <Link to={`/details`} state={item}>
                <img
                  src={item?.images[0]?.image || 'https://via.placeholder.com/300x200'}
                  alt={item.name}
                  className="w-full h-[192px] object-cover rounded-md mb-4"
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
                    className="bg-[#CBA135] rounded-md popbold text-white border-none px-4 py-1 "
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2">
          {Array.from({ length: totalPages }, (_, index) => (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedProducts;
