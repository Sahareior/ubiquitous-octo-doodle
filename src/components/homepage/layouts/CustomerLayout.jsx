import React, { Suspense, lazy, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import CustomersNavbar from '../customersHomepage/CustomersNavbar';
import Footer from '../_components/Footer';
import FloatingChat from '../../others/FolatingChat/FloatingChat';
import { useGetAppCartQuery } from '../../../redux/slices/Apis/customersApi';
import CategoryDropdown from '../customersHomepage/Category/CategorySection';
import CategoryNavigation from '../../profile/CategoryNavigation';
import FlashDeals from '../_components/FlashDeals';
import { useAllFeaturedProductsQuery, useGetNewArrivalsQuery } from '../../../redux/slices/Apis/vendorsApi';
import Swal from 'sweetalert2';

const CustomerHero = lazy(() => import('../customersHomepage/CustomerHero'));
const ShopCategory = lazy(() => import('../customersHomepage/ShopCategory'));
const FeaturedProducts = lazy(() => import('../_components/FeaturedProducts'));
const WhyUs = lazy(() => import('../_components/WhyUs'));
const StayUpdated = lazy(() => import('../customersHomepage/StayUpdated'));
const Customers = lazy(() => import('../_components/Customers'));
const Banner = lazy(() => import('../customersHomepage/Banner'));

const CustomerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { data: cartData, error: cartError, isFetching, isUninitialized } = useGetAppCartQuery();
  
  const {
    data: allProducts,
    isLoading,
    isError,
  } = useAllFeaturedProductsQuery();

  const {
    data: allnewArrivals,
    isLoading: newLoading,
    isError: newError,
  } = useGetNewArrivalsQuery();

  const storedRole = localStorage.getItem('user_role');

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    // Don't run on initial mount or while fetching
    if (isUninitialized || isFetching) return;

    // Check for 401 error
    if (cartError?.status === 401 || cartError?.originalStatus === 401) {
      const showSessionExpiredAlert = async () => {
        const result = await Swal.fire({
          icon: "warning",
          title: "Session Expired",
          text: "Please login again.",
          confirmButtonText: "OK",
          allowOutsideClick: false,
          showCancelButton: false,
          focusConfirm: true
        });
        
        // Only redirect if user confirmed
        if (result.isConfirmed) {
          localStorage.clear();
          navigate('/login', { replace: true });
          // Alternatively, you can use window.location.href for full page reload:
          // window.location.href = "/login";
        }
      };

      showSessionExpiredAlert();
    }
  }, [cartError, isFetching, isUninitialized, navigate]);

  return (
    <div className="relative">
      <CustomersNavbar cartCount={cartData?.count} />
      <CategoryDropdown />

      {isHomePage && (
        <Suspense fallback={<div className="p-6 text-center">Loading homepage...</div>}>
          <CustomerHero />
          <FlashDeals />
          <FeaturedProducts 
            title={"Featured Products"} 
            subtitle={"Explore our featured products"}  
            allProducts={allProducts} 
            isLoading={isLoading} 
            isError={isError}
          />
          <Banner />
          <div id="new-arrivals">
            <FeaturedProducts
              title={"New Arrivals"}
              subtitle={"Explore our newly added products"}
              allProducts={allnewArrivals}
              isLoading={newLoading}
              isError={newError}
            />
          </div>
          <WhyUs />
          <StayUpdated />
          <Customers />

          <div className="bg-[#E6E3DD] space-y-4 py-16">
            <h2 className="text-center popmed text-[30px] font-semibold">About Us</h2>
            <p className="text-center popreg max-w-5xl mx-auto text-[16px]">
              At WIROKO, we believe your home should reflect your taste, warmth, and comfort.
              That's why we created a platform where trusted furniture makers meet quality-conscious shoppers.
              With timeless designs and a commitment to excellence, we help you furnish your space beautifully —
              with ease and elegance.
            </p>
          </div>

          {storedRole === 'customer' && (
            <div className="fixed bottom-52 md:right-6 right-0 animate-float z-50">
              <FloatingChat />
            </div>
          )}
        </Suspense>
      )}

      <Outlet />
      <Footer />
    </div>
  );
};

export default CustomerLayout;