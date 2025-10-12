import { Button, Spin } from 'antd';
import React from 'react';
import { GoHeart } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useGetCustomerProductsQuery } from '../../redux/slices/Apis/customersApi';

const GuestFeaturedProduct = () => {
  const navigate = useNavigate();
  const { data: allProducts, isLoading, isError } = useGetCustomerProductsQuery();

  const handleGuestClick = () => {
    Swal.fire({
      title: 'Please Sign In',
      text: 'You need to sign in to view details.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#CBA135',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sign In',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/login');
      }
    });
  };

  // ✅ Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spin size="large" />
      </div>
    );
  }

  // ✅ Error State
  if (isError || !allProducts?.results?.length) {
    return (
      <div className="text-center text-gray-600 mt-10">
        <p>Failed to load products or no products available.</p>
      </div>
    );
  }

  return (
    <div className="md:p-20 p-3 mt-8 bg-[#FAF8F2] space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-[30px] popbold font-extrabold">Featured Products</h2>
          <p className="text-[18px] text-gray-600">
            Explore our curated furniture categories
          </p>
        </div>
        <h3
          className="text-[#CBA135] font-medium cursor-pointer hover:underline"
          onClick={handleGuestClick}
        >
          View All
        </h3>
      </div>

      {/* ✅ Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allProducts.results.map((item) => {
          // ✅ Use first image or fallback placeholder
          const imageUrl =
            item.images?.length > 0
              ? item.images[0].image
              : 'https://via.placeholder.com/400x300?text=No+Image';

          return (
            <div className="shadow-sm" key={item.id}>
              <div className="bg-white rounded-xl transition relative hover:shadow-md duration-300">
                {/* Wishlist Icon */}
                <div
                  onClick={handleGuestClick}
                  className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-sm cursor-pointer hover:text-[#CBA135] transition"
                >
                  <GoHeart />
                </div>

                {/* Product Image */}
                <div onClick={handleGuestClick}>
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-full h-[192px] object-cover rounded-md mb-4"
                  />
                </div>

                <div className="p-5">
                  {/* Title + Subtitle */}
                  <h2 className="text-[16px] popbold text-gray-800 truncate">
                    {item.name}
                  </h2>
                  <p className="text-sm popreg text-gray-500 mb-3 truncate">
                    {item.short_description || 'No description available'}
                  </p>

                  {/* Price + Button */}
                  <div className="flex justify-between items-center">
                    <h4 className="text-[#CBA135] popbold text-[16px]">
                      XAF {item.new_price}
                    </h4>
                    <button
                      className="bg-[#CBA135] popbold text-white border-none px-4 py-[6px] rounded hover:bg-[#b8932b] transition"
                      onClick={handleGuestClick}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GuestFeaturedProduct;
