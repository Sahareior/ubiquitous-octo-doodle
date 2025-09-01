import React from 'react';
import ProductsList from '../../../AdminDashboard/pages/products/ProductsList';
import { useLocation } from 'react-router-dom';

const VProductsList = () => { 
  const location = useLocation()
  const path = '/vendor-dashboard/vendor-products'
  console.log(location.pathname,'this is Loacaaa')
  return (
    <div>
      <ProductsList path={path}  />
    </div>
  );
};

export default VProductsList;