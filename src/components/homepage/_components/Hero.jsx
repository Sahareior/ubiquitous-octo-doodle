import { Button } from 'antd';
import React from 'react';

const Hero = () => {
  return (
    <div>
      <div className="relative">
        <img
          className="w-full h-[90vh] object-cover"
          src="/image/heroImg.png"
          alt="Hero"
        />

        {/* Glass container */}
        <div
          className="absolute top-1/4 left-2 sm:left-8 md:left-12 lg:left-16 
          w-[95%] sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5 
          p-3 sm:p-6 lg:p-10 
          flex flex-col gap-3 sm:gap-6 rounded-xl"
          style={{
            background:
              'linear-gradient(109.56deg, rgba(147, 116, 86, 0.37) 0.39%, rgba(131, 162, 137, 0.37) 50.67%, rgba(172, 185, 188, 0.37) 100%)',
            border: '1.5px solid',
            borderImageSource:
              'linear-gradient(109.49deg, rgba(138, 103, 75, 0.6) 0%, rgba(184, 200, 205, 0.6) 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}
        >
          {/* Title */}
          <div className="popbold text-center sm:text-left">
            <h3 className="text-2xl sm:text-4xl lg:text-6xl leading-snug sm:leading-tight font-bold text-white">
              Timeless Furniture.
            </h3>
            <h4 className="text-2xl sm:text-4xl lg:text-6xl leading-snug sm:leading-tight font-bold text-[#CBA135]">
              Delivered With Care.
            </h4>
          </div>

          {/* Subtitle */}
          <p className="popmed text-sm sm:text-lg md:text-xl lg:text-2xl text-white text-center sm:text-left">
            Discover premium furniture from trusted local vendors. <br className="hidden sm:block" />
            Transform your space with quality craftsmanship.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-2 sm:mt-4">
            <Button className="bg-[#CBA135] text-white px-4 sm:px-10 py-3 sm:py-6 border-none rounded-lg text-sm sm:text-base">
              Shop New Arrivals
            </Button>
            <Button className="bg-[#2B2B2B] text-white px-4 sm:px-12 py-3 sm:py-6 border-none rounded-lg text-sm sm:text-base">
              View Wishlist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
