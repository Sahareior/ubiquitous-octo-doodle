import { Button, Input } from 'antd';
import { MdOutlineRemoveRedEye, MdOutlineVisibilityOff } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { use, useEffect, useState } from 'react';
import { addCustomerId, selectedLocation } from '../../redux/slices/customerSlice';
import { useCustomerLoginMutation } from '../../redux/slices/apiSlice';
import Swal from 'sweetalert2';

// Firebase
import { signInWithPopup, onAuthStateChanged, signOut, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from '../../firebase/auth';
import { useAddProductToCartMutation, useGetAppCartQuery } from '../../redux/slices/Apis/customersApi';

const Login = () => {
  const dispatch = useDispatch();
  const [customerLogin] = useCustomerLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [addProductToCart] = useAddProductToCartMutation();
  const { data: cartData, refetch } = useGetAppCartQuery();
  const location = useLocation();



  const userType = localStorage.getItem('user_role')

  // Get guest cart from localStorage as fallback
  const getGuestCart = () => {
    return JSON.parse(localStorage.getItem('guest_cart')) || [];
  };

 
  // Function to add guest cart items to user cart after login
  const addGuestCartToUserCart = async () => {

    if(userType === 'admin'){
      return
    }
    // Try to get cart data from location state first, then from localStorage
    let guestCartItems = [];
    
    if (location.state && Array.isArray(location.state)) {
      guestCartItems = location.state;
   
    } else {
      guestCartItems = getGuestCart();
    
    }

    if (guestCartItems.length === 0) {
      console.log('No guest cart items found');
      return;
    }

    try {
     
      
      const results = [];
      
      for (let item of guestCartItems) {
        try {
          // Construct proper payload based on your API requirements
          const payload = {
            product_id: item.id || item.product_id, // Use both possibilities
            quantity: item.quantity || 1,
            // Include price snapshot if your API requires it
            price_snapshot: item.price1 || item.new_price || item.price
          };

          console.log('Adding item to cart:', payload);
          const result = await addProductToCart(payload).unwrap();
          results.push({ success: true, item: item.name, result });
          
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (itemError) {
          console.error(`Failed to add item ${item.id}:`, itemError);
          results.push({ 
            success: false, 
            item: item.name, 
            error: itemError.data?.message || 'Failed to add item' 
          });
        }
      }
      refetch()

      // Clear guest cart from localStorage after successful transfer
      localStorage.removeItem('guest_cart');
      
      const successfulItems = results.filter(r => r.success).length;
      const failedItems = results.filter(r => !r.success).length;

      if (failedItems === 0) {
        Swal.fire({
          icon: "success",
          title: "Cart Items Moved",
          text: `All ${successfulItems} items from your guest cart have been added to your account!`,
          confirmButtonColor: "#CBA135",
        });
      } else if (successfulItems > 0) {
        Swal.fire({
          icon: "warning",
          title: "Partial Cart Transfer",
          text: `${successfulItems} items added successfully, ${failedItems} items failed.`,
          confirmButtonColor: "#CBA135",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Cart Transfer Failed",
          text: "None of your guest cart items could be added. Please try adding them manually.",
          confirmButtonColor: "#CBA135",
        });
      }

    } catch (error) {
      console.error('Error in guest cart transfer process:', error);
      Swal.fire({
        icon: "error",
        title: "Transfer Process Failed",
        text: "There was a problem transferring your cart items. Please try adding them manually.",
        confirmButtonColor: "#CBA135",
      });
    }
  };

  // ✅ Google Sign-In - Modified to get ID token
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Get the Google ID token
      const idToken = await user.getIdToken();
      
      // Prepare userInfo object with necessary details from Firebase
      const userInfo = {
        uid: user.uid,
        email: user.email,
        display_name: user.displayName,
        photo_url: user.photoURL,
        phone_number: user.phoneNumber || null,
        email_verified: user.emailVerified,
        provider_data: user.providerData.map(provider => ({
          provider_id: provider.providerId,
          uid: provider.uid,
          display_name: provider.displayName,
          email: provider.email,
          phone_number: provider.phoneNumber,
          photo_url: provider.photoURL
        }))
      };
      
      // Send to your backend for verification
      const googleLoginData = {
        email: user.email,
        id_token: idToken,
        user_info: userInfo
      };
      
      // Call your backend API with Google credentials
      const res = await customerLogin(googleLoginData).unwrap();
      
      // Save tokens and user data
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      localStorage.setItem("user_role", res.user.role);
      localStorage.setItem("customerId", JSON.stringify(res));

      Swal.fire({
        icon: "success",
        title: "Google Login Successful",
        text: `Welcome, ${res?.user?.first_name || user.displayName || "Customer"}!`,
        confirmButtonColor: "#CBA135",
      });

      dispatch(selectedLocation(res?.user?.role));
      dispatch(addCustomerId(res?.user?.id));

      // Add guest cart items to user cart after Google login
      await addGuestCartToUserCart();
      
      navigate("/");
      
    } catch (error) {
      console.error("Google Login Error:", error);
      
      // If backend login fails, sign out from Firebase
      await signOut(auth);
      
      Swal.fire({
        icon: "error",
        title: "Google Login Failed",
        text: error.data?.message || "Authentication failed. Please try again.",
        confirmButtonColor: "#CBA135",
      });
    }
  };

  // ✅ Auth Watcher (keeps login state on refresh)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Only maintain Firebase state if needed for other purposes
        // Your actual authentication is now handled by your backend
      } else {
        // console.log("Firebase user logged out");
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  // ✅ Your existing email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    const loginData = { email, password };

    try {
      const res = await customerLogin(loginData).unwrap();
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      localStorage.setItem("user_role", res.user.role);
      localStorage.setItem("customerId", JSON.stringify(res));

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: `Welcome back, ${res?.user?.first_name || "Customer"}!`,
        confirmButtonColor: "#CBA135",
      });

      dispatch(selectedLocation(res?.user?.role));
      dispatch(addCustomerId(res?.user?.id));

      // Add guest cart items to user cart after successful login
      await addGuestCartToUserCart();
      
      navigate("/");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error?.data?.message || "Invalid email or password.",
        confirmButtonColor: "#CBA135",
      });
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Background image */}
      <img
        className="w-full h-full object-cover absolute inset-0"
        src="/image/auth2.webp"
        alt=""
      />

      {/* Footer decoration */}
      <img
        className="top-6 md:top-12 right-6 md:right-16 absolute z-10 w-20 md:w-auto object-contain"
        src="/image/footer.png"
        alt=""
      />

      {/* Login Card */}
      <div
        className="absolute top-1/2 left-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2 
          w-[95%] sm:w-[90%] max-w-xl p-4 sm:p-8 md:p-12 rounded-xl text-white space-y-5"
        style={{
          background:
            "linear-gradient(109.52deg, rgba(205, 205, 205, 0.37) 0%, rgba(25, 22, 15, 0.37) 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl md:text-[34px] font-semibold text-center">
          Welcome Back
        </h2>

        {/* Show guest cart notification if items exist */}
        {(location.state && location.state.length > 0) || getGuestCart().length > 0 ? (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 text-center">
            <p className="text-sm">
              You have {(location.state?.length || getGuestCart().length)} item(s) in your guest cart that will be saved to your account after login.
            </p>
          </div>
        ) : null}

        <p className="text-xs sm:text-sm text-center">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-[#CBA135] cursor-pointer font-medium"
          >
            Sign Up
          </Link>
        </p>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="space-y-6 px-2 sm:px-6 md:px-11"
        >
          {/* Email */}
          <div>
            <label className="text-xs sm:text-sm block py-1">Email</label>
            <Input
              className="h-[44px] sm:h-[48px] rounded-[12px] bg-white text-black text-sm sm:text-base"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs sm:text-sm block pb-2">Password</label>
            <div className="relative">
              <Input.Password
                className="h-[44px] sm:h-[48px] rounded-[12px] bg-white text-sm sm:text-base"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                iconRender={(visible) =>
                  visible ? (
                    <MdOutlineVisibilityOff
                      size={18}
                      className="text-gray-500 cursor-pointer"
                    />
                  ) : (
                    <MdOutlineRemoveRedEye
                      size={18}
                      className="text-gray-500 cursor-pointer"
                    />
                  )
                }
              />
            </div>
          </div>

          {/* Login Button */}
          <button 
            type="submit"
            className="w-full bg-[#CBA135] text-white hover:bg-yellow-600 font-medium py-3 sm:py-4 rounded-md text-sm sm:text-base"
          >
            Login
          </button>

          {/* Forget Password */}
          <Link
            to="/forget"
            className="block text-right text-xs sm:text-sm mt-1"
          >
            Forget Password?
          </Link>

          {/* Divider */}
          <p className="text-center text-xs sm:text-sm">
            ____________________ OR __________________
          </p>

          {/* Google Button */}
          <div className="flex justify-center gap-4 pt-4 sm:pt-6">
            <button 
              type="button" 
              onClick={handleGoogleLogin}
              className="bg-white p-2 w-10 h-10 sm:w-12 sm:h-12 rounded-[12px] flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <img
                className="w-6 h-6 object-contain"
                src="/image/auth/g.png"
                alt="Google Login"
              />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;