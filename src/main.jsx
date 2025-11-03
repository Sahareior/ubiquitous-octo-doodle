import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import Dashboard from './components/AdminDashboard/AdminDashboard.jsx';
import DashHome from './components/AdminDashboard/pages/Overview/DashHome.jsx';
import Login from './components/auth/Login.jsx';
import Homepage from './components/homepage/Homepage.jsx';
import Signup from './components/auth/Signup.jsx';
import ForgetPass from './components/auth/ForgetPass.jsx';
import VerifyCode from './components/auth/VerifyCode.jsx';
import ResetPass from './components/auth/ResetPass.jsx';
import Congratulations from './components/auth/Congratulations.jsx';
import ProductFilter from './components/homepage/productDetailAndFilter/ProductFilter.jsx';
import Details from './components/homepage/productDetailAndFilter/Details.jsx';
import WhiteList from './components/CartNWhitelist/WhiteList.jsx';
import Cart from './components/CartNWhitelist/Cart.jsx';
import Checkout from './components/checkout/Checkout.jsx';
import ConfirmOrder from './components/checkout/ConfirmOrder.jsx';
import ConfirmationPage from './components/checkout/ConfirmationPage.jsx';
import OrderTracking from './components/checkout/OrderTracking.jsx';
import ActiveUsers from './components/ChatComponents/ActiveUsers.jsx';
import Profile from './components/profile/Profile.jsx';
import SellerReg from './components/homepage/sellersHomepage/sellerRoutes/SellerReg.jsx';
import Checkout1 from './components/checkout/Checkout1.jsx';
import AdminDashboard from './components/AdminDashboard/AdminDashboard.jsx';
import Orders from './components/AdminDashboard/pages/order/Orders.jsx';
import Analytics from './components/AdminDashboard/pages/analytics/Analytics.jsx';
import Customers from './components/homepage/_components/Customers.jsx';
import CustomerList from './components/AdminDashboard/pages/CustomerList/CustomerList.jsx';
import VendorList from './components/AdminDashboard/pages/vendorlist/VendorList.jsx';
import ProductsList from './components/AdminDashboard/pages/products/ProductsList.jsx';
import AddnewProducts from './components/AdminDashboard/pages/products/AddnewProducts.jsx';
import AllMessages from './components/AdminDashboard/pages/Messages/AllMessages.jsx';
import Content from './components/AdminDashboard/pages/content/Content.jsx';
import AdminProfile from './components/AdminDashboard/pages/Profile/AdminProfile.jsx';
import ReturnExchangeForm from './components/homepage/customersHomepage/ReturnExchangeForm.jsx';
import VendorDashboard from './components/VendorDashboard/VendorDashboard.jsx';
import VendorOverview from './components/VendorDashboard/Pages/VendorsOverview/VendorOverview.jsx';
import VOrders from './components/VendorDashboard/Pages/VendorsOrder/VOrders.jsx';
import VendorPayment from './components/VendorDashboard/Pages/VendorPayment/VendorPayment.jsx';
import PromotionsList from './components/VendorDashboard/Pages/Promotion/PromotionsList.jsx';
import CreatePromotion from './components/VendorDashboard/Pages/Promotion/CreatePromotion.jsx';
import VendorMessages from './components/VendorDashboard/Pages/VendorMessages/VendorMessages.jsx';
import TermsConditions from './components/AdminDashboard/pages/Settings/TermsConditions.jsx';
import PrivacyPolicySettings from './components/AdminDashboard/pages/Settings/PrivacyPolicySettings.jsx';
import ReturnPolicyOverview from './components/homepage/customersHomepage/ReturnPolicyOverview.jsx';
import { store } from './redux/store.js';
import VendorProfile from './components/VendorDashboard/Pages/Profile/VendorProfile.jsx';

import VProductsList from './components/VendorDashboard/Pages/Vendorproducts/VProductsList.jsx';
import TermsAndConditions from './components/homepage/customersHomepage/TermsAndConditions.jsx';
import PrivacyPolicy from './components/homepage/customersHomepage/PrivacyPolicy.jsx';
import VAddnewProducts from './components/VendorDashboard/Pages/Vendorproducts/VAddnewProducts.jsx';
import ApproveSellers from './components/AdminDashboard/pages/Overview/_subComponents/ApproveSellers.jsx';
import VEditProducts from './components/VendorDashboard/Pages/Vendorproducts/VEditProducts.jsx';
import SellerApplications from './components/AdminDashboard/pages/SellerApplications/SellerApplications.jsx';
import NewVendorAddProducts from './components/VendorDashboard/Pages/Vendorproducts/NewVendorAddProducts.jsx';
import EditContent from './components/AdminDashboard/pages/content/EditContent.jsx';
import EditAdminProducts from './components/AdminDashboard/pages/products/EditAdminProducts.jsx';
import CategoryManagement from './components/AdminDashboard/pages/Category/CategoryManagement.jsx';
import EditCategory from './components/AdminDashboard/pages/Category/Page/EditCategory.jsx';
import CreateCategory from './components/AdminDashboard/pages/Category/CreateCategory.jsx';
import Payouts from './components/AdminDashboard/pages/payouts/Payouts.jsx';
import ReturnReq from './components/AdminDashboard/pages/return_req/ReturnReq.jsx';
import AboutUs from './components/homepage/_components/AboutUs.jsx';
import { WebSocketProvider } from './context/WebSocketContext.jsx';
import AdminProtectedRoute from './components/homepage/layouts/AdminProtectedRoute.jsx';
import VendorProtectedRoute from './components/homepage/layouts/VendorProtectedRoute.jsx';
import GuestLayout from './components/homepage/layouts/GuestLayout.jsx';
import SellersPage from './components/homepage/layouts/SellersPage.jsx';
import FlashDealsAdmin from './components/AdminDashboard/pages/flashDeals/FlashDealsAdmin.jsx';
import Featured_Management from './components/AdminDashboard/pages/featuredProduct/Featured_Management.jsx';
import ContactUs from './components/homepage/ContactUs/ContactUs.jsx';
import CancelPage from './components/checkout/CancelPage.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/", 
        element: <Homepage />,
        children: [
          { path: "filter", element: <ProductFilter /> },
      // ✅ Make these PUBLIC (guest-accessible) routes:
                { path: "return-policy", element: <ReturnPolicyOverview /> },
      { path: "terms&conditions", element: <TermsAndConditions /> },
      { path: "privacy", element: <PrivacyPolicy /> },
      { path: "aboutUs", element: <AboutUs /> },
      {
        path:"contactUs", element: <ContactUs />
      },


          { path: "wishlist", element: <WhiteList /> },
          { path: "cart", element: <Cart /> },
          { path: "checkout", element: <Checkout /> },
          { path: "details", element: <Details /> },
          { path: "cart/checkout1", element: <Checkout1 /> },
          { path: "confirm-order", element: <ConfirmOrder /> },
          { path: "order-track", element: <OrderTracking /> },
          { path: "payments/success", element: <ConfirmationPage /> },
          {
            path: "payments/cancel", element: <CancelPage /> 
          },
          { path: "active", element: <ActiveUsers /> },
          { path: "profile", element: <Profile /> },
          { path: "return", element: <ReturnExchangeForm /> },
        ],
      },
      
      // ✅ Make these PUBLIC (guest-accessible) routes:
      { path: "regester-seller", element: <SellerReg /> }, 
      { path: "return-policy", element: <ReturnPolicyOverview /> },
      { path: "terms&conditions", element: <TermsAndConditions /> },
      { path: "privacy", element: <PrivacyPolicy /> },
      { path: "aboutUs", element: <AboutUs /> },
      { path: "wishlist", element: <WhiteList /> },
      {
        path:'vendorpage', element: <SellersPage />
      },

      // ✅ Authentication routes
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "verify", element: <VerifyCode /> },
      { path: "forget", element: <ForgetPass /> },
      { path: "reset", element: <ResetPass /> },
      { path: "congratulations", element: <Congratulations /> },
    ],
  },

  // ✅ Admin Dashboard
  {
    path: "admin-dashboard",
    element: (
      <AdminProtectedRoute>
        <AdminDashboard />
      </AdminProtectedRoute>
    ),
    children: [
      { path: "admin-overview", element: <DashHome /> },
      { path: "seller-req", element: <ApproveSellers /> },
      { path: "admin-orders", element: <Orders /> },
      { path: "return", element: <ReturnReq /> },
      {
        path:'flashDeals', element: <FlashDealsAdmin />
      },
    {
      path:'featuredManagement', element: <Featured_Management />
    },
      { path: "analytics", element: <Analytics /> },
      { path: "customers", element: <CustomerList /> },
      { path: "category", element: <CategoryManagement /> },
      { path: "vendors", element: <VendorList /> },
      { path: "create-category", element: <CreateCategory /> },
      { path: "edit-category/:id", element: <EditCategory /> },
      { path: "sellers-apply", element: <SellerApplications /> },
      { path: "productslist", element: <ProductsList /> },
      { path: "add-product", element: <AddnewProducts /> },
      { path: "editAdminProducts", element: <EditAdminProducts /> },
      { path: "payouts", element: <Payouts /> },
       { path: "promotion", element: <PromotionsList /> },
        { path: "create-promotion", element: <CreatePromotion /> },
      { path: "messages", element: <AllMessages /> },
      { path: "content", element: <Content /> },
      { path: "edit-banner", element: <EditContent /> },
      { path: "admin-profile", element: <AdminProfile /> },
      { path: "terms", element: <TermsConditions /> },
      { path: "privacy", element: <PrivacyPolicySettings /> },
    ],
  },

  // ✅ Vendor Dashboard
  {
    path: "vendor-dashboard",
    element: (
      <VendorProtectedRoute>
        <VendorDashboard />
      </VendorProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="vendor-overview" replace /> },
      { path: "vendor-overview", element: <VendorOverview /> },
      { path: "vendor-order", element: <VOrders /> },
      { path: "vendor-payment", element: <VendorPayment /> },
      { path: "addproducts", element: <NewVendorAddProducts /> },
      { path: "editproducts", element: <VEditProducts /> },
      { path: "vendor-products", element: <VProductsList /> },
      { path: "promotion", element: <PromotionsList /> },
      { path: "create-promotion", element: <CreatePromotion /> },
      { path: "vendor-message", element: <VendorMessages /> },
      { path: "vendor-profile", element: <VendorProfile /> },
    ],
  },
]);





createRoot(document.getElementById('root')).render(
  <StrictMode>
        <Provider store={store}>
          
 <WebSocketProvider>
     <RouterProvider router={router} />
 </WebSocketProvider>

  
    </Provider>
  </StrictMode>
)
