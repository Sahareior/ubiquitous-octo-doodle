import { useState } from "react";
import { Button, Input } from "antd";
import { MdOutlineRemoveRedEye, MdOutlineVisibilityOff } from "react-icons/md";
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
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);

  const navigate = useNavigate()
  // const [signupUser, { isLoading }] = useSignupUserMutation();
  const [customerSignup] = useCustomerSignupMutation(

  )

const isLoading = false
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault(); // 🚀 stop page refresh

  try {
    const res = await customerSignup(formData).unwrap();

    localStorage.setItem("access_token", res.access_token);

    // console.log(res.data)

    await Swal.fire({
      icon: "success",
      title: "Account Created!",
      text: "Your account has been created successfully.",
      confirmButtonColor: "#CBA135",
    });

    navigate("/login");
} catch (error) {
  console.error("Signup failed:", error);

  // Try to extract validation errors
  let errorMessage = "Something went wrong. Please try again.";

  if (error?.data) {
    // if email error exists
    if (error.data.email && Array.isArray(error.data.email)) {
      errorMessage = error.data.email[0]; 
    } else if (typeof error.data === "string") {
      errorMessage = error.data;
    }
  }

  Swal.fire({
    icon: "error",
    title: "Signup Failed",
    text: errorMessage,
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
      type={showPassword ? "text" : "password"}   // ✅ toggle here
      value={formData.password}
      onChange={(e) => handleChange("password", e.target.value)}
    />
    <span
      className="absolute top-3 sm:top-4 right-3 sm:right-4 cursor-pointer text-gray-500"
      onClick={() => setShowPassword(!showPassword)} // ✅ toggle state
    >
      {showPassword ? (
        <MdOutlineVisibilityOff size={18} />
      ) : (
        <MdOutlineRemoveRedEye size={18} />
      )}
    </span>
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
