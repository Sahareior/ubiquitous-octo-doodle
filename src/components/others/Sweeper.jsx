import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { LiaStarSolid } from 'react-icons/lia';
import { useGetReviewsQuery } from '../../redux/slices/Apis/customersApi';

export default function Sweeper({ details, reviews }) {
  const { data: apiReviews, isLoading, error,refetch } = useGetReviewsQuery();
  
  // Determine which data to use based on the details prop
  const displayData = details ? reviews : apiReviews?.results;
  
  // Format the review data to match the expected structure
  const formattedReviews = displayData?.map(review => {
    if (details) {
      // Format the reviews from the details prop
      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        user: {
          first_name: review.user?.name?.split(' ')[0] || 'User',
          last_name: review.user?.name?.split(' ')[1] || '',
        },
        time_since: new Date(review.created_at).toLocaleDateString(),
        product: {
          name: 'Product' // You might want to pass product name through props
        },
        images: [] // No images in the details data structure
      };
    }
    return review; // API data is already in the correct format
  });

  if (isLoading && !details) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CBA135] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error && !details) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-red-500">
          <p>Failed to load reviews. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!formattedReviews || formattedReviews.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-gray-500">
          <p>No reviews available.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Swiper
        slidesPerView={3}
        spaceBetween={30}
        loop={formattedReviews.length > 1}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        modules={[Autoplay, Pagination]}
        className="mySwiper"
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {formattedReviews.map((item, idx) => (
          <SwiperSlide key={idx} className="pb-12">
            <div className="flex justify-center h-full px-1">
              <div className="w-full h-full p-6 bg-white rounded-xl shadow-md flex flex-col">
                
                {/* User info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#CBA135] flex items-center justify-center text-white font-bold text-lg">
                    {item.user?.first_name?.[0] || 'U'}
                    {item.user?.last_name?.[0] || ''}
                  </div>
                  <div>
                    <h4 className="popreg text-gray-800">
                      {item.user?.first_name || 'User'} {item.user?.last_name || ''}
                    </h4>
                    <div className="flex gap-1 text-[#CBA135]">
                      {Array.from({ length: item.rating || 0 }).map((_, i) => (
                        <LiaStarSolid key={i} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">{item.time_since || 'Recently'}</p>
                  </div>
                </div>

                {/* Comment */}
                <div className="flex-1 min-h-0 mb-4">
                  <p className="text-gray-700 popreg italic break-words overflow-y-auto max-h-20 pr-2 custom-scrollbar">
                    "{item.comment || 'No comment provided'}"
                  </p>
                </div>

                {/* Product info - Only show if we have product data */}
                {item.product?.name && (
                  <div className="mb-2 text-sm font-medium text-gray-600">
                    Product: {item.product.name}
                  </div>
                )}

                {/* Review Images - Only show if we have images */}
                {item.images && item.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {item.images.map(img => (
                      <img
                        key={img.id}
                        src={img.image}
                        alt={`review-${img.id}`}
                        className="w-20 h-20 object-cover rounded-lg shadow-sm"
                      />
                    ))}
                  </div>
                )}

              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* CSS for custom scrollbar */}
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cba135;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a8842a;
          }
          .mySwiper .swiper-slide {
            height: auto;
          }
          .mySwiper .swiper-pagination-bullet {
            background: #cba135;
            opacity: 0.5;
            width: 10px;
            height: 10px;
          }
          .mySwiper .swiper-pagination-bullet-active {
            opacity: 1;
          }
        `}
      </style>
    </>
  );
}