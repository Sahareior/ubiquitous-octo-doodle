import React, { useState, useEffect, useCallback } from 'react';
import { useGetAllBannersQuery } from '../../../redux/slices/Apis/dashboardApis';

const Banner = () => {
  const { data: banners, isLoading, error } = useGetAllBannersQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Memoize slide navigation functions to prevent unnecessary re-renders
  const goToPrevious = useCallback(() => {
    if (!banners?.results?.length || isTransitioning) return;
    
    setIsTransitioning(true);
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? banners.results.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    
    // Reset transitioning state after animation completes
    setTimeout(() => setIsTransitioning(false), 700);
  }, [banners, currentIndex, isTransitioning]);

  const goToNext = useCallback(() => {
    if (!banners?.results?.length || isTransitioning) return;
    
    setIsTransitioning(true);
    const isLastSlide = currentIndex === banners.results.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    
    // Reset transitioning state after animation completes
    setTimeout(() => setIsTransitioning(false), 700);
  }, [banners, currentIndex, isTransitioning]);

  const goToSlide = useCallback((slideIndex) => {
    if (!banners?.results?.length || isTransitioning || slideIndex === currentIndex) return;
    
    setIsTransitioning(true);
    setCurrentIndex(slideIndex);
    
    // Reset transitioning state after animation completes
    setTimeout(() => setIsTransitioning(false), 700);
  }, [banners, currentIndex, isTransitioning]);

  // Auto-advance the carousel with useCallback to maintain reference
  useEffect(() => {
    if (!banners?.results?.length || banners.results.length <= 1) return;
    
    const interval = setInterval(() => {
      goToNext();
    }, 6000);
    
    return () => clearInterval(interval);
  }, [banners, goToNext]);

  if (isLoading) {
    return (
      <div className="w-full h-64 md:h-[40rem] my-5 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-furniture-dark border-r-furniture-primary border-b-furniture-accent border-l-furniture-light rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading beautiful furniture...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 md:h-[40rem] my-5 bg-red-50 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <svg className="w-16 h-16 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-xl font-semibold text-red-800">Unable to load banners</h3>
          <p className="mt-2 text-red-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (!banners?.results?.length) {
    return (
      <div className="w-full h-64 md:h-[40rem] my-5 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-4 text-xl font-semibold text-gray-700">No banners available</h3>
          <p className="mt-2 text-gray-500">Check back later for our latest furniture collections</p>
        </div>
      </div>
    );
  }

  const currentBanner = banners.results[currentIndex];

  return (
    <div className="relative w-full h-64 md:h-[40rem] my-5 overflow-hidden rounded-xl shadow-2xl group">
      {/* Banner Image with Link - Using fade animation */}
      <a 
        href={currentBanner.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block w-full h-full relative"
      >
        <div 
          className="w-full h-full bg-cover bg-center transition-all duration-700 ease-in-out transform"
          style={{ backgroundImage: `url(${currentBanner.image})` }}
        ></div>
        
        {/* Gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/50"></div>
      </a>
      
      {/* Animated Text Overlay */}
      <div className="absolute inset-0 flex flex-col justify-center items-start text-left p-8 md:p-16">
        <div className="max-w-2xl">
          <h2 
            className="text-3xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl transform transition-all duration-700 ease-out translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
            style={{ 
              fontFamily: "'Playfair Display', serif",
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              animation: 'textSlideUp 0.8s forwards',
              animationDelay: '0.3s'
            }}
          >
            {currentBanner.title}
          </h2>
          <p 
            className="text-lg md:text-2xl text-white mb-8 drop-shadow-md transform transition-all duration-700 ease-out translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
            style={{
              animation: 'textSlideUp 0.8s forwards',
              animationDelay: '0.5s'
            }}
          >
            {currentBanner.subtitle}
          </p>
          <a 
            href={currentBanner.link}
            className="inline-block bg-furniture-primary hover:bg-furniture-dark text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 opacity-0"
            style={{
              animation: 'fadeIn 0.8s forwards',
              animationDelay: '0.7s'
            }}
          >
            Shop Now
            <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
      
      {/* Navigation Arrows with furniture-themed styling */}
      {banners.results.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 text-furniture-dark p-3 rounded-full hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg"
            aria-label="Previous banner"
            disabled={isTransitioning}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 text-furniture-dark p-3 rounded-full hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg"
            aria-label="Next banner"
            disabled={isTransitioning}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
      
      {/* Furniture-style Indicators */}
      {banners.results.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {banners.results.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-10 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-furniture-primary w-12' 
                  : 'bg-white/70 hover:bg-white'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              disabled={isTransitioning}
            />
          ))}
        </div>
      )}

      {/* CSS animations for performance - using transform and opacity */}
      <style jsx>{`
        @keyframes textSlideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        /* Prevent animation on initial load for better performance */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Banner;