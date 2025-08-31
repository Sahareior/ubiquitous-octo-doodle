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
  <div className="relative w-full min-h-screen bg-gray-50">
      {/* Background image */}
      <img
        className="w-full h-full object-cover absolute inset-0"
        src="/image/auth2.png"
        alt="Background"
      />

      {/* Footer Image */}
      <img
        className="top-12 right-4 sm:right-8 md:right-16 absolute z-10 w-20 sm:w-24 md:w-28"
        src="/image/footer.png"
        alt="Footer"
      />

      {/* Signup Card */}
      <div
        className="absolute top-1/2 left-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2 
                   p-6 sm:p-8 md:p-12 py-12 sm:py-16 rounded-xl w-[90%] max-w-md text-white space-y-5"
        style={{
          background: "linear-gradient(109.52deg, rgba(205, 205, 205, 0.37) 0%, rgba(25, 22, 15, 0.37) 100%)",
          backdropFilter: "blur(9px)",
          WebkitBackdropFilter: "blur(40px)",
        }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center">Create your account</h2>
        <p className="text-sm sm:text-base text-center text-white/80">
          Already have an account?{" "}
          <Link to="/login" className="text-[#CBA135] cursor-pointer font-medium hover:underline">
            Sign In
          </Link>
        </p>

        <div className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="text-sm sm:text-base block pb-1">Full Name</label>
            <Input
              className="h-12 sm:h-14 rounded-lg placeholder-[#A7A1A1] bg-white"
              placeholder="Enter Your Full Name"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm sm:text-base block pb-1">Email Address</label>
            <Input
              className="h-12 sm:h-14 rounded-lg placeholder-[#A7A1A1] bg-white"
              placeholder="Enter your email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm sm:text-base block pb-1">Password</label>
            <div className="relative">
              <Input
                className="h-12 sm:h-14 rounded-lg placeholder-[#A7A1A1] bg-white"
                placeholder="Enter your password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
              <MdOutlineRemoveRedEye
                size={20}
                className="absolute top-3.5 sm:top-4 right-3 text-gray-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-center gap-2 pt-2 text-sm sm:text-base">
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

          {/* Sign Up Button */}
          <Button
            className="w-full bg-[#CBA135] text-white font-medium py-3 sm:py-4 rounded-lg hover:bg-[#b8912f] transition-colors duration-200"
            type="primary"
            disabled={!agree || isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? "Creating..." : "Sign Up"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
