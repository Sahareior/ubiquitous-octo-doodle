import { Button } from 'antd';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const SellersHero = () => {
const navigate = useNavigate()
   const storedRole = localStorage.getItem('user_role'); // "customer" or "vendor"
   const location = useLocation()
   console.log(location.pathname)

const token = localStorage.getItem('access_token')

  const handelClick = () => {
    navigate('/regester-seller',{
      state: {location: location.state}
    });
  }
   
  return (
    <div className="relative">
      {/* Background Image */}
      <img
        className="w-full h-[90vh] object-cover"
        src="/image/sellHero.png"
        alt="Sell Hero"
      />

      {/* Overlay Content */}
      <div className="absolute top-2/4 md:left-28 left-6 -translate-y-1/2 text-white max-w-3xl space-y-16">
        <h2 className="text-3xl md:text-5xl popbold font-bold leading-tight drop-shadow">
          Sell on WIROKO — <br className="hidden md:block" />
          Reach Furniture Buyers Across Cameroon
        </h2>
        <p className="popreg md:text-lg drop-shadow-sm">
          Join our curated marketplace and grow your home business with trusted tools.
        </p>
        {/*  */}
{
  storedRole != 'vendor' ? (

        <Button
        onClick={handelClick}
          className="bg-[#CBA135] hover:bg-[#b8962e] py-6 md:mt-10 mt-5 popmed text-white font-medium px-9 rounded-md shadow-lg transition-all"
          type="primary"
        >
          Apply to Sell
        </Button>

  ):(
      <Link
                to='/vendor-dashboard'
                className="cursor-pointer bg-[#CBA135] block text-center w-44 px-4 py-2 rounded-[8px] popreg text-white hover:bg-[#b38d2c] transition"
              >
                 Dashboard
              </Link>
  )
}
      </div>
    </div>
  );
};

export default SellersHero;
