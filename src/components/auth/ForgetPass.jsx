import { Button, Input } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useForgetPassRequestMutation } from '../../redux/slices/Apis/customersApi';

const ForgetPass = () => {
  const [forgetPassRequest] = useForgetPassRequestMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();

    if (!email) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Email",
        text: "Please enter your email address",
        confirmButtonColor: "#CBA135",
      });
    }

    try {
      const res = await forgetPassRequest({ email }).unwrap();

      Swal.fire({
        icon: "success",
        title: "OTP Sent",
        text: "We have sent an OTP to your email.",
        confirmButtonColor: "#CBA135",
      });

      navigate('/verify',{
        state: {email}
      });  // ✅ fixed the missing quote
      console.log("ForgetPass Response:", res);

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error?.data?.message || "Something went wrong. Try again.",
        confirmButtonColor: "#CBA135",
      });
      console.error("ForgetPass Error:", error);
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
    className="absolute z-10 top-6 right-6 w-20 sm:w-28 md:w-auto md:top-12 md:right-16"
    src="/image/footer.png"
    alt=""
  />

  {/* Forget Password Card */}
  <div
    className="absolute top-1/2 left-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2 
      w-[95%] sm:w-[90%] max-w-xl px-4 sm:px-6 md:px-12 py-10 sm:py-16 md:py-24 
      rounded-xl text-white space-y-5"
    style={{
      background:
        "linear-gradient(109.52deg, rgba(205, 205, 205, 0.37) 0%, rgba(25, 22, 15, 0.37) 100%)",
      backdropFilter: "blur(9px)",
      WebkitBackdropFilter: "blur(40px)",
    }}
  >
    <h2 className="text-2xl sm:text-3xl md:text-[34px] font-semibold text-center">
      Forget Password
    </h2>

    <form onSubmit={handleSubmit} className="py-5 space-y-6">
      <div>
        <label className="text-xs sm:text-sm block py-1 sm:py-2">Email</label>
        <Input
          className="h-[44px] sm:h-[48px] placeholder-[#CBA135] bg-white text-sm sm:text-base"
          name="email"
          placeholder="Enter your email"
        />
      </div>

      <Button
        htmlType="submit"
        className="w-full bg-[#CBA135] text-white font-medium py-3 sm:py-4 md:py-5 text-sm sm:text-base"
        type="primary"
      >
        Get Reset Link
      </Button>
    </form>

    <p className="text-center text-xs sm:text-sm">
      Remembered password?{" "}
      <Link to="/login" className="text-[#CBA135] font-medium">
        Login
      </Link>
    </p>
  </div>
</div>

  );
};

export default ForgetPass;
