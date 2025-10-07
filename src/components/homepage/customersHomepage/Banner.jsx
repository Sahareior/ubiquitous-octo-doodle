import React, { useState, useEffect, useCallback } from 'react';
import { useGetAllBannersQuery } from '../../../redux/slices/Apis/dashboardApis';

// Preload arrow icons as JSX to avoid SVG parsing overhead
const LeftArrow = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const RightArrow = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// Optimized image component with lazy loading and placeholder
const OptimizedBannerImage = ({ src, alt, className, onLoad, onError }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad && onLoad();
  };

  const handleError = () => {
    setHasError(true);
    onError && onError();
  };

  return (
    <>
      {!isLoaded && !hasError && (
        <div className={`${className} bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-all duration-700 ease-out object-cover`}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
};

// Memoized banner content to prevent unnecessary re-renders
const BannerContent = React.memo(({ banner, isTransitioning, onImageLoad, onImageError }) => {
  return (
    <a 
      href={banner.link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block w-full h-full relative overflow-hidden"
    >
      {/* Use optimized image component */}
      <OptimizedBannerImage
        src={banner.image}
        alt={banner.title}
        className="w-full h-full transform transition-all duration-1000 ease-out hover:scale-105"
        onLoad={onImageLoad}
        onError={onImageError}
      />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-transparent opacity-80 transition-all duration-700"></div>
    </a>
  );
});

BannerContent.displayName = 'BannerContent';

const Banner = () => {
  const { data: banners, isLoading, error } = useGetAllBannersQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState('next'); // 'next' or 'prev'
  const [loadedImages, setLoadedImages] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  // Handle image load events
  const handleImageLoad = useCallback((index) => {
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  }, []);

  const handleImageError = useCallback((index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  }, []);

  // Preload next images for smoother transitions
  useEffect(() => {
    if (!banners?.results) return;
    
    // Preload next and previous images
    const nextIndex = (currentIndex + 1) % banners.results.length;
    const prevIndex = (currentIndex - 1 + banners.results.length) % banners.results.length;
    
    [currentIndex, nextIndex, prevIndex].forEach(index => {
      if (!loadedImages[index] && !imageErrors[index]) {
        const img = new Image();
        img.src = banners?.results[index]?.image;
        img.onload = () => handleImageLoad(index);
        img.onerror = () => handleImageError(index);
      }
    });
  }, [banners, currentIndex, loadedImages, imageErrors, handleImageLoad, handleImageError]);

  // Enhanced slide navigation with direction tracking
  const goToPrevious = useCallback(() => {
    if (!banners?.results?.length || isTransitioning) return;
    
    setIsTransitioning(true);
    setDirection('prev');
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? banners.results.length - 1 : currentIndex - 1;
    
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 500);
  }, [banners, currentIndex, isTransitioning]);

  const goToNext = useCallback(() => {
    if (!banners?.results?.length || isTransitioning) return;
    
    setIsTransitioning(true);
    setDirection('next');
    const isLastSlide = currentIndex === banners.results.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 500);
  }, [banners, currentIndex, isTransitioning]);

  const goToSlide = useCallback((slideIndex) => {
    if (!banners?.results?.length || isTransitioning || slideIndex === currentIndex) return;
    
    setIsTransitioning(true);
    setDirection(slideIndex > currentIndex ? 'next' : 'prev');
    
    setTimeout(() => {
      setCurrentIndex(slideIndex);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 500);
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
      <div className="w-full h-64 md:h-[60rem] bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-furniture-dark border-r-furniture-primary border-b-furniture-accent border-l-furniture-light rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 animate-pulse">Loading beautiful furniture...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 md:h-[60rem] bg-gradient-to-r from-red-50 to-red-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-6 animate-fade-in">
          <svg className="w-16 h-16 mx-auto text-red-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="w-full h-64 md:h-[40rem] my-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-6 animate-fade-in">
          <svg className="w-16 h-16 mx-auto text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="relative w-full h-64 md:h-[40rem] bg-[#FAF8F2] overflow-hidden shadow-2xl group">
      {/* Slide Container with Enhanced Transitions */}
      <div className="relative w-full h-full">
        {/* Current Slide */}
        <div 
          className={`absolute inset-0 w-full h-full transition-all duration-700 ease-out ${
            isTransitioning 
              ? direction === 'next' 
                ? 'opacity-0 -translate-x-20 scale-105' 
                : 'opacity-0 translate-x-20 scale-105'
              : 'opacity-100 translate-x-0 scale-100'
          }`}
        >
          <BannerContent 
            banner={currentBanner} 
            isTransitioning={isTransitioning}
            onImageLoad={() => handleImageLoad(currentIndex)}
            onImageError={() => handleImageError(currentIndex)}
          />
        </div>
      </div>
      
      {/* Enhanced Animated Text Overlay */}
      {(!isTransitioning || loadedImages[currentIndex]) && !imageErrors[currentIndex] && (
        <div className="absolute top-0 inset-0 flex flex-col justify-center items-start text-left p-8 md:p-16">
          {/* Dynamic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent transition-all duration-1000"></div>

          <div className={`relative max-w-2xl transform transition-all duration-1000 ease-out ${
            isTransitioning ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'
          }`}>
            {/* Main Title with Staggered Animation */}
            <h2 
              className="text-3xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl transform transition-all duration-700 delay-300"
              style={{ 
                fontFamily: "'Playfair Display', serif",
                textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
              }}
            >
              {currentBanner.title}
            </h2>
            
            {/* Subtitle with Delayed Animation */}
            <p 
              className="text-lg md:text-2xl text-white mb-8 ml-4 drop-shadow-md transform transition-all duration-700 delay-500 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '500ms' }}
            >
              {currentBanner.subtitle}
            </p>
            
            {/* Animated CTA Button */}
            <a 
              href={currentBanner.link}
              className="inline-block bg-furniture-primary hover:bg-furniture-dark text-white font-semibold py-3 px-8 rounded-full transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl animate-fade-in-up"
              style={{ animationDelay: '700ms' }}
            >
              <span className="flex items-center">
                Shop Now
                <svg className="w-5 h-5 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      )}
      
      {/* Enhanced Navigation Arrows */}
      {banners.results.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-furniture-dark p-4 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xl hover:shadow-2xl hover:scale-110 hover:-translate-x-1"
            aria-label="Previous banner"
            disabled={isTransitioning}
          >
            <LeftArrow />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-furniture-dark p-4 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xl hover:shadow-2xl hover:scale-110 hover:translate-x-1"
            aria-label="Next banner"
            disabled={isTransitioning}
          >
            <RightArrow />
          </button>
        </>
      )}
      
      {/* Enhanced Furniture-style Indicators */}
      {banners.results.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 backdrop-blur-sm bg-black/30 rounded-full p-2">
          {banners.results.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-500 transform hover:scale-125 ${
                index === currentIndex 
                  ? 'bg-furniture-primary w-8 scale-110 shadow-lg' 
                  : 'bg-white/70 hover:bg-white hover:shadow-md'
              } ${isTransitioning ? 'pointer-events-none' : ''}`}
              aria-label={`Go to slide ${index + 1}`}
              disabled={isTransitioning}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Add custom CSS animations
const styles = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.8s ease-out forwards;
  }
  
  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
  }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default React.memo(Banner);