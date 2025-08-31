import { Button, Input } from "antd";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { Link } from "react-router-dom";

const ResetPass = () => {
  return (
    <div className="relative w-full min-h-screen">
      {/* Background image */}
      <img
        className="w-full h-full object-cover absolute inset-0"
        src="/image/auth2.png"
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

        <div className="space-y-6">
          {/* Password Input */}
          <div>
            <label className="text-xs sm:text-sm block py-1">Password</label>
            <Input
              className="h-[45px] sm:h-[48px] rounded-md bg-white text-black placeholder-[#CBA135]"
              placeholder="Enter your new password"
              type="password"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs sm:text-sm block pb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                className="h-[45px] sm:h-[48px] rounded-md bg-white text-black placeholder-[#CBA135]"
                placeholder="Confirm password"
                type="password"
              />
              <MdOutlineRemoveRedEye
                size={20}
                className="absolute top-3.5 right-4 text-gray-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Update Password Button */}
          <div>
            <Link to="/congratulations" className="w-full block">
              <Button
                type="primary"
                className="w-full bg-[#CBA135] text-white font-medium py-3 sm:py-4 md:py-5 hover:bg-[#b8912f] transition-colors duration-200 text-sm sm:text-base"
              >
                Update Password
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPass;
