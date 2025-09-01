import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className="w-full md:px-28 py-3 shadow-md flex justify-between items-center bg-white">
      {/* Left Section: Logo */}
      <div className="flex items-center gap-6">
        <img src="/image/logo.png" alt="Logo" className="h-[32px] w-auto object-contain" />
      </div>

      {/* Right Section: Search + Actions */}
      <div className="flex items-center gap-6 ml-auto">
        <Link to="/login">
          <h4 className="cursor-pointer hover:text-blue-600 transition">Login</h4>
        </Link>
        <Link to="/signup">
          <h4 className="cursor-pointer bg-[#CBA135] px-4 py-1 rounded-[8px] text-white hover:bg-[#b18f2a] transition">
            Register
          </h4>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
