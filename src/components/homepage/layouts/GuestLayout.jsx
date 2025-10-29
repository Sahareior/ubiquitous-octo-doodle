import React, { Suspense, useState, useEffect } from "react";
import CategoryDropdown from "../customersHomepage/Category/CategorySection";
import { Outlet, useLocation } from "react-router-dom";
import FlashDeals from "../_components/FlashDeals";

// Critical components - load immediately
const Navbar = React.lazy(() => import("../_components/Navbar"));
const Footer = React.lazy(() => import("../_components/Footer"));

// Above-the-fold components - preload after critical
const Hero = React.lazy(() => import("../_components/Hero"));

// Below-the-fold components - load after interaction or when needed
const FeaturedProducts = React.lazy(() =>
  import("../_components/FeaturedProducts")
);
const WhyUs = React.lazy(() => import("../_components/WhyUs"));
const Customers = React.lazy(() => import("../_components/Customers"));
const Coupon = React.lazy(() => import("../_components/Coupon"));

// Component-specific loading states
const HeroLoading = () => (
  <div className="h-96 bg-gray-200 animate-pulse flex items-center justify-center">
    <div className="text-gray-500">Loading hero section...</div>
  </div>
);

const SectionLoading = () => (
  <div className="h-64 bg-gray-100 animate-pulse my-4"></div>
);

const GuestLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [isHeroLoaded, setIsHeroLoaded] = useState(false);

  // Preload critical home page components
  useEffect(() => {
    if (isHomePage) {
      // Preload hero component
      import("../_components/Hero");
    }
  }, [isHomePage]);

  

  return (
    <div>
      {/* Critical components with minimal suspense */}
      <Suspense fallback={<NavbarLoading />}>
        <Navbar />
      </Suspense>

      <CategoryDropdown />

      <main>
        {isHomePage && (
          <>
            {/* Hero with higher priority */}
            <Suspense fallback={<HeroLoading />}>
              <Hero onLoad={() => setIsHeroLoaded(true)} />
            </Suspense>

            <FlashDeals />

            {/* Below-fold components with intersection observer */}
            <LazySection>
              <FeaturedProducts />
            </LazySection>

            <LazySection>
              <WhyUs />
            </LazySection>

            <LazySection>
              <Customers />
            </LazySection>

            <LazySection>
              <Coupon />
            </LazySection>
          </>
        )}

        <Outlet />
      </main>

      <Suspense fallback={<FooterLoading />}>
        <Footer />
      </Suspense>
    </div>
  );
};

// Intersection Observer wrapper for lazy loading
const LazySection = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" } // Load 100px before entering viewport
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{isVisible ? children : <SectionLoading />}</div>;
};

// Minimal loading components
const NavbarLoading = () => (
  <div className="h-16 bg-white border-b animate-pulse"></div>
);

const FooterLoading = () => (
  <div className="h-40 bg-gray-100 animate-pulse"></div>
);

export default GuestLayout;
