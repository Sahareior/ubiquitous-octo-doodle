import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { LiaStarSolid } from 'react-icons/lia';
import { useGetReviewsQuery } from '../../redux/slices/Apis/customersApi';

export default function Sweeper() {
  const { data } = useGetReviewsQuery();

  return (
    <Swiper
      slidesPerView={3}
      spaceBetween={30}
      loop={true}
      autoplay={{
        delay: 3500,
        disableOnInteraction: false,
      }}
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
      {data?.results?.map((item, idx) => (
        <SwiperSlide className="pb-12" key={idx}>
          <div className="flex justify-center h-full px-1">
            <div className="w-full h-full p-6 bg-white rounded-xl shadow-md flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#CBA135] flex items-center justify-center text-white font-bold text-lg">
                  {item.user.first_name?.[0]}
                  {item.user.last_name?.[0] || ""}
                </div>
                <div>
                  <h4 className="popreg text-gray-800">
                    {item.user.first_name} {item.user.last_name}
                  </h4>
                  <div className="flex gap-1 text-[#CBA135]">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <LiaStarSolid key={i} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Comment section with fixed height and scroll */}
              <div className="flex-1 min-h-0 mb-4">
                <p className="text-gray-700 popreg italic break-words overflow-y-auto max-h-20 pr-2 custom-scrollbar">
                  "{item.comment}"
                </p>
              </div>

              {/* Product image */}
              <div className="mt-auto">
                <img
                  className="w-16 h-16 object-cover rounded-lg"
                  src={`https://images.unsplash.com/photo-1501028391897-5c5eae694383?q=80&w=387&auto=format&fit=crop`}
                  alt={item.product_name}
                />
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

// Add this CSS to your global styles or use a CSS module
const styles = `
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
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);