import { Button, Input, message, Spin } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { useVerifyOtpMutation } from "../../redux/slices/Apis/customersApi";
import { LoadingOutlined } from "@ant-design/icons";

const VerifyCode = () => {
  const inputRefs = useRef([]);
  const [otpValues, setOtpValues] = useState(Array(6).fill(""));
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  // const [resendOtp] = useResendOtpMutation();

  // Redirect if no email is provided
  useEffect(() => {
    if (!email) {
      message.error("No email provided. Redirecting...");
      navigate("/forgot-password"); // Adjust this to your actual route
    }
  }, [email, navigate]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-focus next input & update OTP values
  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return; // allow only digits

    const updated = [...otpValues];
    updated[index] = value;
    setOtpValues(updated);

    // Auto-tab to next input if value entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    
    // Auto-tab to previous input if backspace pressed
    if (e.nativeEvent.inputType === "deleteContentBackward" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste event for OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtpValues = pastedData.split("").slice(0, 6);
      setOtpValues([...newOtpValues, ...Array(6 - newOtpValues.length).fill("")]);
      
      // Focus on the last input with a value
      const lastFilledIndex = newOtpValues.length - 1;
      if (lastFilledIndex < 5) {
        inputRefs.current[lastFilledIndex + 1]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    }
  };

  const handleVerify = async () => {
    const otpCode = otpValues.join("");
    if (otpCode.length !== 6) {
      message.error("Please enter the full 6-digit code.");
      return;
    }

    try {
      const res = await verifyOtp({
        email,
        otp: otpCode,
      }).unwrap();

      message.success("OTP verified successfully!");
      // console.log("OTP verified:", res);
      if(res.message){
      
      navigate("/reset", { state: { email } }); // Adjust route as needed
      }
      
      
    } catch (err) {
      console.error("Verification failed:", err);
      message.error(err.data?.message || "Invalid verification code");
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    try {
      // await resendOtp({ email }).unwrap();
      message.success("Verification code sent successfully!");
      setCountdown(30); // 30 seconds countdown
    } catch (err) {
      console.error("Resend failed:", err);
      message.error(err.data?.message || "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  // Handle key down for navigation between inputs
  const handleKeyDown = (e, index) => {
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1].focus();
    }
  };

  if (!email) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center p-4">
      <img
        className="w-full h-full object-cover absolute inset-0"
        src="/image/auth2.webp"
        alt="Authentication background"
      />

      <div
        className="relative z-20 w-full max-w-md px-6 py-8 rounded-xl text-white space-y-6"
        style={{
          background:
            "linear-gradient(109.52deg, rgba(205, 205, 205, 0.37) 0%, rgba(25, 22, 15, 0.37) 100%)",
          backdropFilter: "blur(9px)",
          WebkitBackdropFilter: "blur(40px)",
        }}
      >
        <h2 className="text-2xl sm:text-3xl font-semibold text-center">
          Verify Code
        </h2>

        <p className="text-center text-sm text-[#f3f3f3b0]">
          Please enter the 6-digit code sent to <br />
          <span className="font-medium">{email}</span>
        </p>

        <div className="flex justify-center gap-2 max-w-sm mx-auto">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <Input
                key={index}
                maxLength={1}
                ref={(el) => (inputRefs.current[index] = el)}
                value={otpValues[index]}
                onChange={(e) => handleChange(e, index)}
                onPaste={index === 0 ? handlePaste : undefined} // Only attach to first input
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="!h-12 !w-12 text-center text-lg font-bold bg-white text-black border border-[#CBA135] rounded-md focus:border-2 focus:border-yellow-500"
                autoFocus={index === 0}
              />
            ))}
        </div>

        <div>
          <Button
            loading={isLoading}
            onClick={handleVerify}
            className="w-full bg-[#CBA135] hover:bg-[#b58c2d] text-white font-medium py-3 text-base h-12"
            type="primary"
            size="large"
          >
            Verify
          </Button>
        </div>

        <div className="text-center text-sm pt-4">
          Didn't receive the code?{" "}
          <button 
            className={`text-[#CBA135] font-medium hover:underline ${countdown > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleResendCode}
            disabled={countdown > 0 || isResending}
          >
            {isResending ? "Sending..." : `Resend ${countdown > 0 ? `(${countdown}s)` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;