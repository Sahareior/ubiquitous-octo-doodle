import { Link } from "react-router-dom";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y, Keyboard, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { useGetCategoriesQuery } from "../../../redux/slices/Apis/vendorsApi";

const CardSkeleton = () => (
  <div className="bg-white rounded-xl shadow animate-pulse h-[280px]"></div>
);

const Card = React.memo(({ category, loading = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (loading) return <CardSkeleton />;

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      <div className="relative overflow-hidden w-full h-[192px]">
        {!imageLoaded && !imageError && <div className="absolute inset-0 bg-gray-200 animate-pulse z-10"></div>}
        <img
          src={category.image}
          alt={category.title}
          loading="lazy"
          className={`w-full h-full object-cover rounded-t-xl transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          style={{ willChange: "transform, opacity" }}
        />
        {imageError && (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-t-xl">
            <span className="text-gray-400">Image not available</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col items-center mt-4 pb-5 gap-4">
        <h2 className="text-lg font-semibold text-gray-800 text-center line-clamp-1">{category.name}</h2>
        <Link to={`/filter?category=${category.id}`} className="w-full flex justify-center">
          <button className="bg-[#CBA135] text-white px-6 py-2.5 rounded-md hover:bg-[#b38d2d] focus:ring-2 focus:ring-[#CBA135] w-full max-w-[120px]">
            Explore
          </button>
        </Link>
      </div>
    </div>
  );
});

Card.displayName = "CategoryCard";

const ShopCategory = () => {
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const { data: cate, isLoading: categoriesLoading } = useGetCategoriesQuery();

  const categories = useMemo(() => cate?.results || [], [cate]);
  const duplicatedCategories = useMemo(() => [...categories, ...categories.slice(0, Math.min(categories.length, 5))], [categories]);

  const breakpoints = {
    0: { slidesPerView: 1, spaceBetween: 20 },
    480: { slidesPerView: 2, spaceBetween: 20 },
    768: { slidesPerView: 3, spaceBetween: 20 },
    1024: { slidesPerView: 4, spaceBetween: 30 },
    1280: { slidesPerView: 5, spaceBetween: 30 },
  };

  return (
    <section className="px-6 md:px-10 py-12 bg-gray-50">
      <h2 className="text-center text-3xl md:text-4xl font-medium text-gray-900 pb-10">
        Shop by Category
      </h2>

      {/* Navigation */}
      <div className="flex justify-end gap-3 mb-4">
        <button className="category-prev bg-white p-2 rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#CBA135]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button className="category-next bg-white p-2 rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#CBA135]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Swipers */}
      {['top', 'bottom'].map((row, i) => (
        <div key={row} className="relative mb-10">
          <Swiper
            onSwiper={(sw) => (i === 0 ? (topRef.current = sw) : (bottomRef.current = sw))}
            modules={[Navigation, A11y, Keyboard, Autoplay]}
            navigation={i === 0 ? { prevEl: ".category-prev", nextEl: ".category-next" } : false}
            loop={true}
            speed={15000}
            spaceBetween={20}
            breakpoints={breakpoints}
            autoplay={{
              delay: 20,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
              reverseDirection: i === 1,
            }}
            freeMode={{ enabled: true, momentum: false }}
            slidesPerView="auto"
            resistance={false}
            simulateTouch={true}
            className="category-swiper"
            style={{ transitionTimingFunction: "linear", cursor: "grab" }}
          >
            {duplicatedCategories.map((c, idx) => (
              <SwiperSlide key={`${row}-${c.id}-${idx}`} style={{ width: "auto" }}>
                <Card category={c} loading={categoriesLoading} />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>
        </div>
      ))}
    </section>
  );
};

export default React.memo(ShopCategory);
