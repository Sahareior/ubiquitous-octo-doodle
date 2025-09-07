import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGetCategoriesQuery } from "../../../redux/slices/Apis/vendorsApi";

const CardSkeleton = () => (
  <div className="bg-white rounded-xl shadow animate-pulse h-[280px]"></div>
);

const Card = React.memo(({ category, loading = false }) => {
  if (loading) return <CardSkeleton />;
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 relative overflow-hidden group w-[220px]">
      <div className="relative overflow-hidden w-full h-[192px]">
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="w-full h-full object-cover rounded-t-xl transition-transform duration-500 "
        />
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

// Marquee Component
const Marquee = ({ categories, reverse = false, loading }) => {
  const marqueeRef = useRef(null);
  const [duration, setDuration] = useState(30); // default duration

  useEffect(() => {
    if (!marqueeRef.current) return;
    const containerWidth = marqueeRef.current.scrollWidth / 2; // because we duplicated slides
    // Adjust duration: 50px per second speed
    const newDuration = containerWidth / 50; 
    setDuration(newDuration);
  }, [categories]);

  const slides = [...categories, ...categories];

  return (
    <div className="overflow-hidden relative" ref={marqueeRef}>
      <div
        className={`flex gap-5 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{
          minWidth: "max-content",
          animationDuration: `${duration}s`,
        }}
      >
        {slides.map((category, idx) => (
          <Card key={idx} category={category} loading={loading} />
        ))}
      </div>

      {/* Gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee linear infinite;
        }
        .animate-marquee-reverse {
          display: flex;
          animation: marquee-reverse linear infinite;
        }
      `}</style>
    </div>
  );
};

const ShopCategory = () => {
  const { data: cate, isLoading: categoriesLoading } = useGetCategoriesQuery();

  return (
    <section className="px-6 md:px-10 py-12 bg-gray-50">
      <h2 className="text-center text-3xl md:text-4xl font-medium text-gray-900 pb-10">
        Shop by Category
      </h2>

      <div className="mb-10">
        <Marquee categories={cate?.results || []} loading={categoriesLoading} />
      </div>

      <div className="mb-10">
        <Marquee categories={cate?.results || []} loading={categoriesLoading} reverse />
      </div>
    </section>
  );
};

export default React.memo(ShopCategory);
