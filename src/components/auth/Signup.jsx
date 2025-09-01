import { useState } from "react";
import { Button, Input } from "antd";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useCustomerSignupMutation } from "../../redux/slices/apiSlice";
import Swal from "sweetalert2";

const Signup = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    agree_to_terms: true
  });
  const [agree, setAgree] = useState(false);

  const navigate = useNavigate()
  // const [signupUser, { isLoading }] = useSignupUserMutation();
  const [customerSignup] = useCustomerSignupMutation(

  )

const isLoading = false
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

const handleSubmit = async () => {
  try {
    const res = await customerSignup(formData).unwrap();

    // Save access token to localStorage
    localStorage.setItem("access_token", res.access_token);

    // Show success alert
    await Swal.fire({
      icon: "success",
      title: "Account Created!",
      text: "Your account has been created successfully.",
      confirmButtonColor: "#CBA135",
    });

    console.log("Signup successful:", res);
    navigate('/login')

  } catch (error) {
    console.error("Signup failed:", error);

    // Show error alert
    Swal.fire({
      icon: "error",
      title: "Signup Failed",
      text: error?.data?.message || "Something went wrong. Please try again.",
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
    alt="Background"
  />

  {/* Footer decoration */}
  <img
    className="top-6 md:top-12 right-6 md:right-16 absolute z-10 w-20 md:w-auto object-contain"
    src="/image/footer.png"
    alt="Footer"
  />

  {/* Signup Card */}
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
      Create Your Account
    </h2>

    <p className="text-xs sm:text-sm text-center">
      Already have an account?{" "}
      <Link
        to="/login"
        className="text-[#CBA135] cursor-pointer font-medium"
      >
        Sign In
      </Link>
    </p>

    {/* Form */}
    <form
      onSubmit={handleSubmit}
      className="space-y-6 px-2 sm:px-6 md:px-11"
    >
      {/* Full Name */}
      <div>
        <label className="text-xs sm:text-sm block py-1">Full Name</label>
        <Input
          className="h-[44px] sm:h-[48px] rounded-[12px] bg-white text-black text-sm sm:text-base"
          placeholder="Enter your full name"
          value={formData.full_name}
          onChange={(e) => handleChange("full_name", e.target.value)}
        />
      </div>

      {/* Email */}
      <div>
        <label className="text-xs sm:text-sm block py-1">Email</label>
        <Input
          className="h-[44px] sm:h-[48px] rounded-[12px] bg-white text-black text-sm sm:text-base"
          placeholder="Enter your email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
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
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />
          <MdOutlineRemoveRedEye
            size={18}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Terms */}
      <div className="flex items-center gap-2 text-xs sm:text-sm">
        <input
          type="checkbox"
          id="agree"
          className="accent-[#CBA135] w-4 h-4 sm:w-5 sm:h-5"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        <label htmlFor="agree" className="text-white/90">
          I agree to the{" "}
          <span className="text-[#CBA135] underline cursor-pointer hover:text-yellow-500">
            Terms and Conditions
          </span>
        </label>
      </div>

      {/* Signup Button */}
      <button
        type="submit"
        disabled={!agree || isLoading}
        className="w-full bg-[#CBA135] text-white hover:bg-yellow-600 font-medium py-3 sm:py-4 rounded-md text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? "Creating..." : "Sign Up"}
      </button>

      {/* Divider */}
      <p className="text-center text-xs sm:text-sm">
        ____________________ OR __________________
      </p>

      {/* Google Button */}

    </form>
  </div>
</div>

  );
};

export default Signup;
