import { Button } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

const Coupon = () => {
    return (
        <div>
            <div className='bg-[#CBA135] popreg flex justify-center p-20 items- flex-col gap-3'>
                <h2 className='text-[36px] text-white'>Festival Sale - Up to 40% Off</h2>
                <p className='text-[20px] text-white'>Limited time offer on selected furniture collections</p>
                <Button className='bg-[#FFFFFF] popreg px-7 w-52  py-6 text-[#CBA135] border-none'>Shop Sale Items</Button>
            </div>
            <div className='bg-[#666666] popreg flex justify-center md:p-20 p-4 items-center flex-col gap-3'>
                <h2 className='text-[36px] text-white'>Ready to Transform Your Space?</h2>
                <p className='text-[20px] text-white'>Join thousands of satisfied customers and discover your perfect furniture</p>
                <div className='flex justify-center items-center gap-4'>
                    <Link to='/signup'>
                    <Button className='bg-[#CBA135] popreg px-7 py-6 text-white border-none'>Create Account</Button>
                    </Link>
                    <Button className='bg-[#2B2B2B] popreg px-7 py-6 text-white border-none'>Start Shopping</Button>
                </div>
            </div>
        </div>
    );
};

export default Coupon;