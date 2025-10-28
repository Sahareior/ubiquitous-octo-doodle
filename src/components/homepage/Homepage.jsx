import React, { useEffect, useState } from 'react';
import CustomerLayout from './layouts/CustomerLayout';
import GuestLayout from './layouts/GuestLayout';
import SellersLayout from './layouts/SellersLayout';

const Homepage = () => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedRole = localStorage.getItem('user_role'); // "customer" or "vendor"
    const customerId = localStorage.getItem('customerId');

    if (token && storedRole && customerId) {
      let finalRole = storedRole;

      try {
        const userInfo = JSON.parse(customerId);
        if (userInfo?.user?.email === 'admin@gmail.com') {
          finalRole = 'customer'; // Force admin@gmail.com to be customer
        }
      } catch (error) {
        console.error('Failed to parse customerId from localStorage', error);
      }

      setRole(finalRole);
    } else {
      setRole(null); // Guest if no token/role
    }
  }, []);

  return (
    <div>
      {role === 'vendor' ? (
        <SellersLayout />
      ) : role === 'customer' ? (
        <CustomerLayout />
      ) : (
        <GuestLayout />
      )}
    </div>
  );
};

export default Homepage;