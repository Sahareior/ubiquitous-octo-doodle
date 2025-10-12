import React, { useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useGetCategoriesQuery } from "../../../redux/slices/Apis/vendorsApi";
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";

// Skeleton loader (lightweight, prevents layout shift)
const CardSkeleton = () => (
  <div className="bg-white rounded-xl shadow animate-pulse h-[280px] w-full flex-shrink-0" 
       style={{boxShadow: "0px 10px 15px 0px #0000001A"}}></div>
);

const Card = React.memo(({ category, loading = false }) => {
  if (loading) return <CardSkeleton />;

  return (
    <div 
      className="bg-white rounded-xl hover:shadow-md w-full transition relative mx-auto"
      style={{
        boxShadow: "0px 10px 15px 0px rgba(0, 0, 0, 0.1)",
        width: "calc(100% - 20px)", // Ensure some spacing for shadow visibility
        margin: "10px" // Add margin to allow shadow to be visible
      }}
    >
      <img
        src={`${category.image}?w=400&q=80&auto=format`}
        alt={category.name}
        loading="lazy"
        decoding="async"
        className="w-full h-[192px] object-cover rounded-t-xl"
      />

      <div className="p-4 flex flex-col items-center mt-4 pb-5 gap-4">
        <h2 className="text-lg popreg font-semibold text-gray-800 text-center">
          {category.name}
        </h2>

        <Link to={`/filter?category=${category.id}`}>
          <button className="bg-[#CBA135] popreg text-white border-none px-6 py-1.5 rounded">
            Explore
          </button>
        </Link>
      </div>
    </div>
  );
});
Card.displayName = "CategoryCard";

const CategoryCarousel = React.memo(({ categories, loading }) => {
  // Memoize items to avoid unnecessary re-renders
  const items = useMemo(() => {
    return (loading ? Array(10).fill({}) : categories).map((category, idx) => (
      <SwiperSlide key={category.id || idx} className="!h-auto py-4">
        <Card category={category} loading={loading} />
      </SwiperSlide>
    ));
  }, [categories, loading]);

  return (
    <div className="relative  px-1">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20} // Increased space between slides
        slidesPerView={1} // Start with fewer slides on mobile
        speed={500} // Faster transitions
        resistance={false} // Disable resistance for smoother feel
        preloadImages={false}
        lazy={{
          loadPrevNext: true,
          loadPrevNextAmount: 1, // Only preload adjacent slides
        }}
        breakpoints={{
          380: { slidesPerView: 2, spaceBetween: 20 },
          480: { slidesPerView: 2, spaceBetween: 20 },
          640: { slidesPerView: 3, spaceBetween: 20 },
          768: { slidesPerView: 3, spaceBetween: 25 },
          1024: { slidesPerView: 3, spaceBetween: 30 },
          1280: { slidesPerView: 3, spaceBetween: 30 },
          1536: { slidesPerView: 3, spaceBetween: 30 },
        }}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        pagination={{
          clickable: true,
          el: ".swiper-pagination",
          dynamicBullets: true, // Better performance for many bullets
        }}
        className="mySwiper"
        style={{
          padding: "10px 0", // Add padding to ensure shadows are visible
          overflow: "hidden" // Important: Allow shadows to extend beyond slide boundaries
        }}
      >
        {items}
      </Swiper>

      {/* Custom navigation buttons */}
      <div className="swiper-button-prev !text-[#CBA135] !w-10 !h-10 after:!text-xl"></div>
      <div className="swiper-button-next !text-[#CBA135] !w-10 !h-10 after:!text-xl"></div>

      {/* Custom pagination */}
      <div className="swiper-pagination !relative !mt-6"></div>
    </div>
  );
});

const ShopCategory = () => {
  const { data: cate, isLoading: categoriesLoading } = useGetCategoriesQuery();

  return (
    <section className="px-6 md:px-16 py-8 bg-gray-50">
      <h3 className="text-center text-[30px] popmed pb-9">Shop by Category</h3>

      <CategoryCarousel
        categories={cate?.results || []}
        loading={categoriesLoading}
      />
    </section>
  );
};

export default React.memo(ShopCategory);