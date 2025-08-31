import { Button, Input } from 'antd';
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { addCustomerId, selectedLocation } from '../../redux/slices/customerSlice';
import { useCustomerLoginMutation } from '../../redux/slices/apiSlice';
import Swal from 'sweetalert2';

// ✅ Firebase

import { signInWithPopup, onAuthStateChanged, signOut, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from '../../firebase/auth';

const Login = () => {
  const dispatch = useDispatch();
  const [customerLogin] = useCustomerLoginMutation()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate()

  // ✅ Google Sign-In
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Save in localStorage
      localStorage.setItem("customerId", JSON.stringify(user));

      // Redux store
      dispatch(addCustomerId(user.uid));
      dispatch(selectedLocation("customer"));

      Swal.fire({
        icon: "success",
        title: "Google Login Successful",
        text: `Welcome, ${user.displayName || "Customer"}!`,
        confirmButtonColor: "#CBA135",
      });

      navigate("/");
    } catch (error) {
      console.error("Google Login Error:", error);
      Swal.fire({
        icon: "error",
        title: "Google Login Failed",
        text: error.message,
      });
    }
  };

  // ✅ Auth Watcher (keeps login state on refresh)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem("customerId", JSON.stringify(user));
        dispatch(addCustomerId(user.uid));
        dispatch(selectedLocation("customer"));
      } else {
        localStorage.removeItem("customerId");
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
<div className="relative w-full min-h-screen">
  {/* Background image */}
  <img
    className="w-full h-full object-cover absolute inset-0"
    src="/image/auth2.png"
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

    <p className="text-xs sm:text-sm text-center">
      Don’t have an account?{" "}
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
        />
      </div>

      {/* Password */}
      <div>
        <label className="text-xs sm:text-sm block pb-2">Password</label>
        <div className="relative">
          <Input
            className="h-[44px] sm:h-[48px] rounded-[12px] bg-white text-sm sm:text-base"
            placeholder="Enter your password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <MdOutlineRemoveRedEye
            size={18}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Login Button */}
      <button className="w-full bg-[#CBA135] text-white hover:bg-yellow-600 font-medium py-3 sm:py-4 rounded-md text-sm sm:text-base">
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
        <button type="button" onClick={handleGoogleLogin}>
          <img
            className="bg-white p-2 w-10 h-10 sm:w-12 sm:h-12 rounded-[12px] object-contain"
            src="/image/auth/g.png"
            alt="Google"
          />
        </button>
      </div>
    </form>
  </div>
</div>

  );
};

export default Login;
