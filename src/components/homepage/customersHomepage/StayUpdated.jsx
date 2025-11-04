import React, { useState } from 'react';
import { Button } from 'antd';
import Swal from 'sweetalert2';
import { toast, Toaster } from 'react-hot-toast';
import { useEmailSubscribeMutation } from '../../../redux/slices/Apis/vendorsApi';

const StayUpdated = () => {
  const [email, setEmail] = useState('');
  const [emailSubscribe, { isLoading }] = useEmailSubscribeMutation();

const handleSubscribe = async () => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    toast.error('Please enter your email address', {
      duration: 4000,
      position: 'top-right',
      icon: '✉️',
      style: {
        background: '#FEF2F2',
        color: '#B91C1C',
        border: '1px solid #FECACA',
      }
    });
    return;
  }
  
  if (!emailPattern.test(email)) {
    toast.error(`"${email}" is not a valid email address`, {
      duration: 5000,
      icon: '❌',
      style: {
        background: '#FFFBEB',
        color: '#B45309',
        border: '1px solid #FDE68A',
      }
    });
    return;
  }

  const loadingToast = toast.loading('Subscribing...', {
    position: 'top-right'
  });

  try {
    const res = await emailSubscribe({ email }).unwrap();
    
    toast.success(res?.message || 'Successfully subscribed!', {
      id: loadingToast,
      duration: 6000,
      icon: '🎉',
      style: {
        background: '#F0FDF4',
        color: '#065F46',
        border: '1px solid #A7F3D0',
      }
    });
    
    setEmail('');
    
  } catch (err) {
    const errorMessage = err?.data?.message || 'Subscription failed. Please try again.';
    
    toast.error(errorMessage, {
      id: loadingToast,
      duration: 6000,
      icon: '⚠️',
      style: {
        background: '#FEF2F2',
        color: '#B91C1C',
        border: '1px solid #FECACA',
      }
    });
  }
};
  return (
    <div className='bg-[#666666] py-12 px-4 text-white'>
        <Toaster />
      <h2 className='text-[30px] text-center popbold mb-2'>Stay Updated</h2>
      <p className='text-[18px] text-center popreg mb-6'>
        Get the latest furniture trends and exclusive offers delivered to your inbox.
      </p>

      <div className='flex justify-center items-center max-w-xl mx-auto'>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='h-[48px] w-full max-w-md px-4 rounded-l-md text-black focus:outline-none'
        />
        <Button
          onClick={handleSubscribe}
          loading={isLoading}
          className='px-6 rounded-none popbold rounded-r-md bg-[#CBA135] text-white h-[48px] border-none hover:bg-[#b9922d]'
        >
          Subscribe
        </Button>
      </div>
    </div>
  );
};

export default StayUpdated;
