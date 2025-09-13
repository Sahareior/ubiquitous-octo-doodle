import { Link, useNavigate } from 'react-router-dom';
import { RxExit } from 'react-icons/rx';
import Swal from 'sweetalert2'; // Import SweetAlert2

const SellersNavbar = () => {
  const navigate = useNavigate();
  const storedRole = localStorage.getItem('user_role'); // "customer" or "vendor"

  const handleLogout = () => {
    // Show confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out from your account",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Perform logout if confirmed
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("customerId");
        navigate("/login");
        
        // Show success message
        Swal.fire(
          'Logged out!',
          'You have been successfully logged out.',
          'success'
        );
      }
    });
  };

  return (
    <div className="w-full md:px-20 py-3 shadow-md flex justify-between items-center bg-white">
      {/* Left Section: Logo */}
      <div className="flex justify-between w-2/6 items-center gap-6">
      <Link to='/'>
        <img src="/image/logo.png" alt="Logo" className="h-[32px] w-auto object-contain" />
      </Link>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center justify-end w-3/6 gap-6">
        <div className="flex items-center gap-4 text-sm font-medium">
          {storedRole === 'vendor' ? (
            <>
              <Link
                to='/vendor-dashboard'
                className="cursor-pointer bg-[#CBA135] px-4 py-2 rounded-[8px] popreg text-white hover:bg-[#b38d2c] transition"
              >
                 Dashboard
              </Link>
              <div 
                onClick={handleLogout}
                className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition"
                title="Logout"
              >
                <RxExit size={22} />
              </div>
            </>
          ) : (
            <>
              <Link to='/login' className="hover:text-blue-600 transition">
                <h4 className="cursor-pointer popreg">
                  Already a seller? Log in
                </h4>
              </Link>
              <Link
                to='/regester-seller'
                className="cursor-pointer bg-[#CBA135] px-4 py-2 rounded-[8px] popreg text-white hover:bg-[#b38d2c] transition"
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