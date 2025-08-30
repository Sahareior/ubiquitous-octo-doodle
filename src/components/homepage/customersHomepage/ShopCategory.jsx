import { Link } from "react-router-dom";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y, Keyboard, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { useGetCategoriesQuery } from "../../../redux/slices/Apis/vendorsApi";

// Skeleton loader component for better UX
const CardSkeleton = () => (
  <div className="bg-white rounded-xl shadow hover:shadow-md transition relative animate-pulse">
    <div className="w-full h-[192px] bg-gray-200 rounded-t-xl"></div>
    <div className="p-4 flex flex-col items-center mt-4 pb-5 gap-4">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-9 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
);

const Card = React.memo(({ category, loading = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (loading) {
    return <CardSkeleton />;
  }

  return (
    <div
      className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
      style={{ boxShadow: "0px 10px 15px 0px #0000001A" }}
    >
      <div className="relative overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse z-10"></div>
        )}
        <img
          src={category.image}
          alt={category.title}
          loading="lazy"
          className={`w-full h-[192px] object-cover rounded-t-xl transition-transform duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        {imageError && (
          <div className="w-full h-[192px] bg-gray-100 flex items-center justify-center rounded-t-xl">
            <span className="text-gray-400">Image not available</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col items-center mt-4 pb-5 gap-4">
        <h2 className="text-lg font-semibold text-gray-800 text-center line-clamp-1">
          {category.name}
        </h2>
        <Link to={`/filter?category=${category.id}`} className="w-full flex justify-center">
          <button className="bg-[#CBA135] text-white border-none px-6 py-2.5 rounded-md transition-all duration-300 hover:bg-[#b38d2d] focus:ring-2 focus:ring-[#CBA135] focus:ring-opacity-50 focus:outline-none w-full max-w-[120px]">
            Explore
          </button>
        </Link>
      </div>
    </div>
  );
});

Card.displayName = 'CategoryCard';

const ShopCategory = () => {
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const { data: cate, isLoading: categoriesLoading } = useGetCategoriesQuery();

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const breakpoints = {
    0: { slidesPerView: 1, spaceBetween: 20 },
    480: { slidesPerView: 2, spaceBetween: 20 },
    768: { slidesPerView: 3, spaceBetween: 20 },
    1024: { slidesPerView: 4, spaceBetween: 30 },
    1280: { slidesPerView: 5, spaceBetween: 30 },
  };

  // Optimized: Reduce duplication and use useMemo
  const categories = cate?.results || [];
  const duplicatedCategories = useMemo(() => {
    // Only duplicate enough to create seamless loop (2-3x instead of 3x)
    return [...categories, ...categories.slice(0, Math.min(categories.length, 10))];
  }, [categories]);

  // Slower, more performant autoplay speed
  const autoplaySpeed = 12000;

  return (
    <section aria-labelledby="shop-by-category-heading" className="px-6 md:px-10 py-12 bg-gray-50">
      <div className="w-full mx-auto">
        <h2 id="shop-by-category-heading" className="text-center text-3xl md:text-4xl font-medium text-gray-900 pb-10">
          Shop by Category
        </h2>

        {/* Navigation Controls */}
        <div className="flex justify-end gap-3 mb-4">
          <button 
            className="category-prev bg-white p-2 rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#CBA135]"
            aria-label="Previous categories"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            className="category-next bg-white p-2 rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#CBA135]"
            aria-label="Next categories"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* TOP ROW - Right to Left */}
        <div 
          className="relative mb-10"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Swiper
            onSwiper={(sw) => {
              topRef.current = sw;
            }}
            modules={[Navigation, A11y, Keyboard, Autoplay]}
            navigation={{
              prevEl: ".category-prev",
              nextEl: ".category-next",
            }}
            a11y={{
              prevSlideMessage: 'Previous categories',
              nextSlideMessage: 'Next categories',
            }}
            keyboard={{
              enabled: true,
              onlyInViewport: true,
            }}
            loop={true}
            speed={autoplaySpeed}
            spaceBetween={20}
            breakpoints={breakpoints}
            autoplay={{
              delay: 1,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
              reverseDirection: false
            }}
            freeMode={{
              enabled: true,
              momentum: false,
            }}
            slidesPerView="auto"
            resistance={false}
            resistanceRatio={0}
            simulateTouch={true}
            allowTouchMove={true}
            className="category-swiper"
            style={{ 
              transitionTimingFunction: 'linear',
              cursor: 'grab'
            }}
          >
            {duplicatedCategories.map((c, index) => (
              <SwiperSlide key={`top-${c.id}-${index}`} style={{ width: 'auto' }}>
                <Card category={c} loading={isLoading || categoriesLoading} />
              </SwiperSlide>
            ))}
          </Swiper>
          
          {/* Gradient overlay for top row */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>
        </div>

        {/* BOTTOM ROW - Left to Right */}
        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Swiper
            onSwiper={(sw) => {
              bottomRef.current = sw;
            }}
            modules={[Navigation, A11y, Keyboard, Autoplay]}
            navigation={false}
            a11y={{
              enabled: false,
            }}
            loop={true}
            speed={autoplaySpeed}
            spaceBetween={20}
            breakpoints={breakpoints}
            autoplay={{
              delay: 1,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
              reverseDirection: true // This makes it go left to right
            }}
            freeMode={{
              enabled: true,
              momentum: false,
            }}
            slidesPerView="auto"
            resistance={false}
            resistanceRatio={0}
            simulateTouch={true}
            allowTouchMove={true}
            className="category-swiper"
            style={{ 
              transitionTimingFunction: 'linear',
              cursor: 'grab'
            }}
          >
            {duplicatedCategories.map((c, index) => (
              <SwiperSlide key={`bottom-${c.id}-${index}`} style={{ width: 'auto' }}>
                <Card category={c} loading={isLoading || categoriesLoading} />
              </SwiperSlide>
            ))}
          </Swiper>
          
          {/* Gradient overlay for bottom row */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>
        </div>
      </div>

      <style jsx>{`
        .category-swiper {
          padding: 10px 5px 20px;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .swiper-wrapper {
          transition-timing-function: linear !important;
        }
      `}</style>
    </section>
  );
};

export default React.memo(ShopCategory);