import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { LiaStarSolid } from 'react-icons/lia';
import { useGetReviewsQuery } from '../../redux/slices/Apis/customersApi';

export default function Sweeper() {
  const { data } = useGetReviewsQuery();

  console.log(data?.results, "API reviews");

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
        640: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
    >
      {data?.results?.map((item, idx) => (
        <SwiperSlide className='pb-4' key={idx}>
          <div className="flex justify-center px-1">
            <div className="w-full sm:w-11/12 md:w-11/12 lg:w-full p-6 bg-white rounded-xl shadow-md transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                  {item.user.first_name?.[0]}
                  {item.user.last_name?.[0] || ''}
                </div>
                <div>
                  <h4 className="popreg text-gray-800">{item.user.first_name} {item.user.last_name}</h4>
                  <div className="flex gap-1 text-[#CBA135]">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <LiaStarSolid key={i} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 popreg italic mb-4">“{item.comment}”</p>
              <img
                className="w-16 h-16 object-cover rounded-lg"
                src={`https://images.unsplash.com/photo-1501028391897-5c5eae694383?q=80&w=387&auto=format&fit=crop`}
                alt={item.product_name}
              />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
