import { Button, Input, message } from "antd";
// import { MdOutlineRemoveRedEye, MdOutlineRemoveRedEyeOff } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSetNewpasswordMutation } from "../../redux/slices/Apis/customersApi";
import { useState } from "react";

const ResetPass = () => {
  const [setNewpassword, { isLoading }] = useSetNewpasswordMutation();
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};
  
  // State for form fields and visibility
  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.new_password) {
      newErrors.new_password = "Password is required";
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = "Password must be at least 6 characters";
    }
    
    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handelSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!email) {
      message.error("Email not found. Please try the reset process again.");
      return;
    }
    
    try {
      const payload = {
        email,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password
      };
      
      const response = await setNewpassword(payload).unwrap();
      
      message.success("Password updated successfully!");
      navigate("/congratulations", { 
        state: { 
          message: "Your password has been reset successfully!",
          from: "reset-password"
        } 
      });
    } catch (error) {
      console.error("Reset password error:", error);
      message.error(error.data?.message || "Failed to reset password. Please try again.");
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Background image */}
      <img
        className="w-full h-full object-cover absolute inset-0"
        src="/image/auth2.webp"
        alt=""
      />

      {/* Footer Image */}
      <img
        className="absolute z-10 top-6 right-6 w-16 sm:w-24 md:w-auto md:top-12 md:right-16"
        src="/image/footer.png"
        alt=""
      />

      {/* Reset Password Card */}
      <div
        className="absolute top-1/2 left-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2 
        w-[95%] sm:w-[90%] max-w-lg px-4 sm:px-8 md:px-12 py-10 sm:py-16 md:py-20 
        rounded-xl text-white space-y-6"
        style={{
          background:
            "linear-gradient(109.52deg, rgba(205, 205, 205, 0.37) 0%, rgba(25, 22, 15, 0.37) 100%)",
          backdropFilter: "blur(9px)",
          WebkitBackdropFilter: "blur(40px)",
        }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-[34px] font-semibold text-center">
          Reset Password
        </h2>

        <form onSubmit={handelSubmit} className="space-y-6">
          {/* Password Input */}
          <div>
            <label className="text-xs sm:text-sm block py-1">Password</label>
            <div className="relative">
              <Input
                name="new_password"
                className="h-[45px] sm:h-[48px] rounded-md bg-white text-black placeholder-[#CBA135]"
                placeholder="Enter your new password"
                type={showPassword ? "text" : "password"}
                value={formData.new_password}
                onChange={handleInputChange}
                status={errors.new_password ? "error" : ""}
              />
              {/* <div 
                onClick={togglePasswordVisibility}
                className="absolute top-3.5 right-4 text-gray-600 cursor-pointer"
              >
                {showPassword ? <MdOutlineRemoveRedEyeOff size={20} /> : <MdOutlineRemoveRedEye size={20} />}
              </div> */}
            </div>
            {errors.new_password && (
              <p className="text-red-300 text-xs mt-1">{errors.new_password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs sm:text-sm block pb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                name="confirm_password"
                className="h-[45px] sm:h-[48px] rounded-md bg-white text-black placeholder-[#CBA135]"
                placeholder="Confirm password"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirm_password}
                onChange={handleInputChange}
                status={errors.confirm_password ? "error" : ""}
              />
              <div 
                onClick={toggleConfirmPasswordVisibility}
                className="absolute top-3.5 right-4 text-gray-600 cursor-pointer"
              >
                {/* {showConfirmPassword ? <MdOutlineRemoveRedEyeOff size={20} /> : <MdOutlineRemoveRedEye size={20} />} */}
              </div>
            </div>
            {errors.confirm_password && (
              <p className="text-red-300 text-xs mt-1">{errors.confirm_password}</p>
            )}
          </div>

          {/* Update Password Button */}
          <div>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              className="w-full bg-[#CBA135] text-white font-medium py-3 sm:py-4 md:py-5 hover:bg-[#b8912f] transition-colors duration-200 text-sm sm:text-base"
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPass;