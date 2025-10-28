import React, { Suspense } from 'react';
import CategoryDropdown from '../customersHomepage/Category/CategorySection';
import { Outlet, useLocation } from 'react-router-dom';
import FlashDeals from '../_components/FlashDeals';

// Lazy load components
const Navbar = React.lazy(() => import('../_components/Navbar'));
const Hero = React.lazy(() => import('../_components/Hero'));
const FeaturedProducts = React.lazy(() => import('../_components/FeaturedProducts'));
const WhyUs = React.lazy(() => import('../_components/WhyUs'));
const Customers = React.lazy(() => import('../_components/Customers'));
const Coupon = React.lazy(() => import('../_components/Coupon'));
const Footer = React.lazy(() => import('../_components/Footer'));
const GuestFeaturedProduct = React.lazy(() => import('../../others/GuestFeaturedProduct'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const GuestLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div>
      <Suspense fallback={<LoadingFallback />}>
        <Navbar />
        <CategoryDropdown />
        {isHomePage && (
          <>
            <Hero />
            <FlashDeals />
             <FeaturedProducts />
            <WhyUs />
            <Customers />
            <Coupon />
          </>
        )}
        <Outlet />
        <Footer />
      </Suspense>
    </div>
  );
};

export default GuestLayout;