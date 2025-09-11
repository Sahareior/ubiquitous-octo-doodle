import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useGetCategoriesQuery } from "../../../redux/slices/Apis/vendorsApi";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
// Import required modules
import { Navigation, Pagination } from "swiper/modules";

const CardSkeleton = () => (
  <div className="bg-white rounded-xl shadow animate-pulse h-[280px] w-[220px] flex-shrink-0"></div>
);

const Card = React.memo(({ category, loading = false }) => {
  if (loading) return <CardSkeleton />;

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group w-[220px] flex-shrink-0 will-change-transform mx-auto">
      <div className="relative w-full h-[192px] overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="w-full h-full object-cover rounded-t-xl transition-transform duration-500 will-change-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4 flex flex-col items-center mt-4 pb-5 gap-4">
        <h2 className="text-lg font-semibold text-gray-800 text-center line-clamp-1">
          {category.name}
        </h2>
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

const CategoryCarousel = React.memo(({ categories, loading }) => {
  // Memoize the rendered items to avoid re-renders
  const items = useMemo(() => {
    return (loading ? Array(10).fill({}) : categories).map((category, idx) => (
      <SwiperSlide key={category.id || idx} className="flex justify-center">
        <Card category={category} loading={loading} />
      </SwiperSlide>
    ));
  }, [categories, loading]);

  return (
    <div className="relative py-2 px-1">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={6}
        breakpoints={{
          480: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 25,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 30,
          },
          1280: {
            slidesPerView: 6,
            spaceBetween: 30,
          },
        }}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{
          clickable: true,
          el: '.swiper-pagination',
        }}
        className="mySwiper "
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
    <section className="px-6 md:px-10 py-12 bg-gray-50">
      <h2 className="text-center text-3xl md:text-4xl font-medium text-gray-900 pb-10">
        Shop by Category
      </h2>

      <CategoryCarousel categories={cate?.results || []} loading={categoriesLoading} />
    </section>
  );
};

export default React.memo(ShopCategory);