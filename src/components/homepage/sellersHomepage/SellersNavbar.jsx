import { Link, useNavigate } from 'react-router-dom';
import { RxExit } from 'react-icons/rx';

const SellersNavbar = () => {
  const navigate = useNavigate();
  const storedRole = localStorage.getItem('user_role'); // "customer" or "vendor"

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("customerId");
    navigate("/login");
  };

  return (
    <div className="w-full px-28 py-3 shadow-md flex justify-between items-center bg-white">
      {/* Left Section: Logo */}
      <div className="flex justify-between w-2/6 items-center gap-6">
        <img src="/image/logo.png" alt="Logo" className="h-[32px] w-auto object-contain" />
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center justify-end w-3/6 gap-9">
        <div className="flex items-center gap-[1rem] text-sm font-medium">
          {storedRole === 'vendor' ? (
            <>
              <Link
                to='/vendor-dashboard'
                className="cursor-pointer bg-[#CBA135] px-4 py-2 rounded-[8px] popreg text-white hover:text-blue-600 transition"
              >
                Vendor Dashboard
              </Link>
 <Link onClick={handleLogout} to='/login'>
                      <RxExit size={22} />
                    </Link>
            </>
          ) : (
            <>
              <Link to='/login'>
                <h4 className="cursor-pointer popreg hover:text-blue-600 transition">
                  Already a seller? Log in
                </h4>
              </Link>
              <Link
                to='/regester-seller'
                className="cursor-pointer bg-[#CBA135] px-4 py-2 rounded-[8px] popreg text-white hover:text-blue-600 transition"
              >
                Apply to Sell
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellersNavbar;
