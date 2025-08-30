import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addCustomerId, selectedLocation } from '../../redux/slices/customerSlice';
import { Outlet } from 'react-router-dom';
import CustomerLayout from './layouts/CustomerLayout';
import GuestLayout from './layouts/GuestLayout';
import SellersLayout from './layouts/SellersLayout';

const Homepage = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state?.customer?.location);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    const customerId = localStorage.getItem('customerId');

    if (token && role && customerId) {
      dispatch(selectedLocation(role));
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
