import { Button, Input } from "antd";
import { Link } from "react-router-dom";
import { useRef } from "react";

const VerifyCode = () => {
  const inputRefs = useRef([]);

  // Auto-focus next input
  const handleChange = (e, index) => {
    if (e.target.value && index < 4) {
      inputRefs.current[index + 1].focus();
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

      {/* Footer Image */}
      <img
        className="absolute z-10 top-6 right-6 w-16 sm:w-24 md:w-auto md:top-12 md:right-16"
        src="/image/footer.png"
        alt=""
      />

      {/* Verify Code Card */}
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
          Verify Code
        </h2>

        <p className="text-center text-xs sm:text-sm text-[#f3f3f3b0]">
          Please enter the 5-digit code sent to your email
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-2 sm:gap-3 max-w-sm mx-auto">
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <Input
                key={index}
                maxLength={1}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(e, index)}
                className="!h-11 !w-11 sm:!h-12 sm:!w-12 
                text-center text-base sm:text-lg font-bold 
                bg-white text-black border border-[#CBA135] rounded-md"
              />
            ))}
        </div>

        {/* Verify Button */}
        <div>
          <Link className="w-full" to="/reset">
            <Button
              className="w-full bg-[#CBA135] text-white font-medium py-3 sm:py-4 md:py-5 text-sm sm:text-base"
              type="primary"
            >
              Verify
            </Button>
          </Link>
        </div>

        {/* Resend */}
        <div className="text-center text-xs sm:text-sm pt-2 sm:pt-4">
          Didn't receive the code?{" "}
          <button className="text-[#CBA135] font-medium hover:underline">
            Resend
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
