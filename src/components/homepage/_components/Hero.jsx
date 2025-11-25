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
          absolute top-1/2 -translate-y-1/2 
          left-4 sm:left-10 lg:left-16
          pb-9
       
          w-[92%] sm:w-[80%] md:w-[65%] lg:w-[45%]
          p-4 sm:p-6 md:p-8 flex flex-col gap-3 sm:gap-5 rounded-2xl
          bg-gradient-to-r from-[rgba(147,116,86,0.37)] via-[rgba(131,162,137,0.37)] to-[rgba(172,185,188,0.37)]
          border border-[rgba(184,200,205,0.6)] backdrop-blur-md shadow-xl
        "
      >
        <div className="popbold text-center sm:text-left">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            Timeless Furniture.
          </h3>
          <h4 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#CBA135] leading-tight">
            Delivered With Care.
          </h4>
        </div>

        <p className="popmed text-base sm:text-lg md:text-xl text-white text-center sm:text-left leading-relaxed">
          Discover premium furniture from trusted local vendors.
          <br className="hidden sm:block" />
          Transform your space with quality craftsmanship.
        </p>

        <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-3 sm:gap-5 mt-3 sm:mt-4">
          <button
            onClick={handleScroll}
            className="bg-[#CBA135] hover:bg-[#b18c2c] text-white px-6 sm:px-10 py-4 sm:py-5 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300"
          >
            Shop New Arrivals
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
