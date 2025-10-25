import React, { Suspense, lazy } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import CustomersNavbar from '../customersHomepage/CustomersNavbar';
import Footer from '../_components/Footer';
import FloatingChat from '../../others/FolatingChat/FloatingChat';
import { useGetAppCartQuery } from '../../../redux/slices/Apis/customersApi';


const CustomerHero = lazy(() => import('../customersHomepage/CustomerHero'));
const ShopCategory = lazy(() => import('../customersHomepage/ShopCategory'));
const FeaturedProducts = lazy(() => import('../_components/FeaturedProducts'));
const WhyUs = lazy(() => import('../_components/WhyUs'));
const StayUpdated = lazy(() => import('../customersHomepage/StayUpdated'));
const Customers = lazy(() => import('../_components/Customers'));
const Banner = lazy(() => import('../customersHomepage/Banner'));

const CustomerLayout = () => {
  const location = useLocation();
  const { data: cartData } = useGetAppCartQuery();

   const storedRole = localStorage.getItem('user_role');


   console.log(storedRole,'this is role')

  const isHomePage = location.pathname === '/';

  return (
    <div className="relative">
      
      <CustomersNavbar cartCount={cartData?.count} />

      {isHomePage && (
        <Suspense fallback={<div className="p-6 text-center">Loading homepage...</div>}>
          <CustomerHero />
          <ShopCategory />
          <FeaturedProducts />
          <Banner />
          <WhyUs />
          <StayUpdated />
          <Customers />

 
          <div className="bg-[#E6E3DD] space-y-4 py-16">
            <h2 className="text-center popmed text-[30px] font-semibold">About Us</h2>
            <p className="text-center popreg max-w-5xl mx-auto text-[16px]">
              At WIROKO, we believe your home should reflect your taste, warmth, and comfort.
              That’s why we created a platform where trusted furniture makers meet quality-conscious shoppers.
              With timeless designs and a commitment to excellence, we help you furnish your space beautifully —
              with ease and elegance.
            </p>
          </div>

     
   {
    storedRole === 'customer' &&       <div className="fixed bottom-52 md:right-6 right-0 animate-float z-50">
            <FloatingChat />
          </div>
   }
        </Suspense>
      )}


      <Outlet />


      <Footer />
    </div>
  );
};

export default CustomerLayout;
