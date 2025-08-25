// Homepage.jsx
import { Outlet } from 'react-router-dom';
import CustomerLayout from './layouts/CustomerLayout';
import GuestLayout from './layouts/GuestLayout';
import SellersLayout from './layouts/SellersLayout';
import { useDispatch, useSelector } from 'react-redux';
import { addCustomerId, selectedLocation } from '../../redux/slices/customerSlice';
import { useEffect } from 'react';

const Homepage = () => {
  // const user = 'customer'; // hardcoded for now
  const dispatch = useDispatch();

  // const user = useSelector(state => state?.customer?.location)
  const user ='customer'

console.log('this isdatasa', user)

 useEffect(() => {
    const token = localStorage.getItem('token');
    const customerId = localStorage.getItem('customerId');

    if (token && customerId) {
      dispatch(selectedLocation('customer'));
      dispatch(addCustomerId(customerId));
    }
  }, [dispatch]);

  if (user === 'customer') {
    return (
      <CustomerLayout>
        <Outlet />
      </CustomerLayout>
    );
  } else if (user === 'vendor') {
    return (
      <SellersLayout>
        <Outlet />
      </SellersLayout>
    );
  } else {
    return (
      <GuestLayout>
        <Outlet />
      </GuestLayout>
    );
  }
};

export default Homepage;
