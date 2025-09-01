import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const Congratulations = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/login");
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

      {/* Congratulations Card */}
      <div
        className="absolute top-1/2 left-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2 
        w-[95%] sm:w-[90%] max-w-lg px-4 sm:px-8 md:px-12 py-10 sm:py-14 md:py-16 
        rounded-xl text-white space-y-6 text-center"
        style={{
          background:
            "linear-gradient(109.52deg, rgba(205, 205, 205, 0.37) 0%, rgba(25, 22, 15, 0.37) 100%)",
          backdropFilter: "blur(9px)",
          WebkitBackdropFilter: "blur(40px)",
        }}
      >
        {/* Congratulation Image */}
        <img
          className="mx-auto w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 object-contain"
          src="/image/auth/congo.png"
          alt="Congratulations"
        />

        {/* Heading */}
        <h2 className="text-xl sm:text-2xl md:text-[28px] font-semibold">
          Congratulations!
        </h2>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-gray-200">
          You are ready to explore our web!
        </p>

        {/* Explore Button */}
        <Button
          onClick={handleClick}
          className="w-full bg-[#CBA135] text-white font-medium py-3 sm:py-4 md:py-5 
          hover:bg-[#b8912f] transition-colors duration-200 text-sm sm:text-base"
          type="primary"
        >
          Explore
        </Button>
      </div>
    </div>
  );
};

export default Congratulations;
