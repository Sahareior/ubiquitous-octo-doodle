import React from 'react';

const Hero = () => {
  const handleScroll = () => {
    const section = document.getElementById('new-arrivals');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full h-screen overflow-hidden">
      <img
        src="/image/hh.webp"
        alt="Hero"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
      />

      <div
        className="
          absolute top-[20%] py-16 left-2 sm:left-8 md:left-12 lg:left-16 
          w-[95%] sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5 
          p-3 sm:p-6 lg:p-10 flex flex-col gap-3 sm:gap-6 rounded-xl
          bg-gradient-to-r from-[rgba(147,116,86,0.37)] via-[rgba(131,162,137,0.37)] to-[rgba(172,185,188,0.37)]
          border border-[rgba(184,200,205,0.6)] backdrop-blur-md
        "
      >
        <div className="popbold text-center sm:text-left">
          <h3 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white leading-snug sm:leading-tight">
            Timeless Furniture.
          </h3>
          <h4 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-[#CBA135] leading-snug sm:leading-tight">
            Delivered With Care.
          </h4>
        </div>

        <p className="popmed text-sm sm:text-lg md:text-xl lg:text-2xl text-white text-center sm:text-left">
          Discover premium furniture from trusted local vendors.
          <br className="hidden sm:block" />
          Transform your space with quality craftsmanship.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-2 sm:mt-4">
          <button
            onClick={handleScroll}
            className="bg-[#CBA135] hover:bg-[#b18c2c] text-white px-4 sm:px-10 w-[50%] md:w-full mx-auto py-5 sm:py-6 rounded-lg text-sm sm:text-base transition-all duration-300"
          >
            Shop New Arrivals
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
