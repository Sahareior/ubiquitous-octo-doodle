import React from 'react';
import { Form, Input, Checkbox, Button, Select } from 'antd';
import Breadcrumb from '../others/Breadcrumb';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGetAddressQuery, usePostAddressMutation } from '../../redux/slices/Apis/customersApi';
import Swal from 'sweetalert2';

const { Option } = Select;

const Checkout = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate()
  const [postAddress] = usePostAddressMutation()
    const { data: address, refetch } = useGetAddressQuery();
  const location = useLocation()

  const isDetails = location.state?.productData ? true : false;
  


const onFinish = async (values) => {
  const payload = {
    full_name: values.fullname,
    phone_number: values.phone,
    email: values.email,
    street_address: values.street,
    landmark: values.landmark,
    apartment_name: values.apartment,
    floor_number: values.floor,
    flat_number: values.flat,
    city: values.city,
    zip_code: values.zip,
    billing_same_as_shipping: values.sameAsShipping || false,
  };

  try {
    const res = await postAddress(payload);
    console.log("Mapped Payload:", res);
    refetch()

    // ✅ Show success notification
    Swal.fire({
      title: "Success!",
      text: "Address has been saved successfully.",
      icon: "success",
      confirmButtonText: "OK",
    }).then(() => {

      if(isDetails){
        navigate(`/details`,{
          state: location.state.productData
        })
        refetch()
      }
      else{
        navigate("/cart/checkout1", {
  state: {
    ...location.state
  }
  
});
      }


    });
  } catch (error) {
    // ❌ Show error notification
    Swal.fire({
      title: "Error!",
      text: "Failed to save address. Please try again.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};

  return (
<div className='bg-[#FAF8F2] pb-12'>
  <div className=' pb-7 md:px-20 '>
     <Breadcrumb />
   <div className='py-4 pb-6'>
    <h2 className='text-[30px] pb-3 popbold font-bold'>Checkout</h2>
    <p className='popreg'>Almost there! Confirm your details to complete your order</p>

   </div>
       <div className=' flex gap-8'>
        <div className=" bg-[#EAE7E1] p-6 md:p-5 w-full  mx-auto rounded-lg">
      <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item name="fullname" label="Full Name" rules={[{ required: true, message: 'Please enter your full name' }]}>
            <Input className='h-[40px] custom-input' placeholder="Enter full name" />
          </Form.Item>

          <Form.Item name="phone" label="Phone Number" rules={[{ required: true, message: 'Please enter your phone number' }]}>
<Input className='h-[40px] custom-input' placeholder="Enter phone number" />
          </Form.Item>
        </div>

        <Form.Item name="email" label="Email Address" rules={[{ type: 'email', message: 'Enter a valid email' }]}>
          <Input className='h-[40px] custom-input' placeholder="example@email.com" />
        </Form.Item>

        <Form.Item name="street" label="Street Address">
          <Input className='h-[40px] custom-input' placeholder="House number and street name" />
        </Form.Item>

        <Form.Item name="landmark" label="Landmark">
          <Input className='h-[40px] custom-input' placeholder="Near Central Mosque, opposite University" />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item name="apartment" label="Apartment name">
            <Input className='h-[40px] custom-input' placeholder="Aqua Tower" />
          </Form.Item>

          <Form.Item name="floor" label="Floor Number">
            <Input className='h-[40px] custom-input' placeholder="5" />
          </Form.Item>

          <Form.Item name="flat" label="Flat number">
            <Input className='h-[40px] custom-input' placeholder="C4" />
          </Form.Item>
        </div>

        <div className="grid w-8/12 grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item name="city" label="City">
            <Input className='h-[40px] custom-input' placeholder="Dhaka" />
          </Form.Item>

          <Form.Item name="zip" label="Zip Code">
            <Input className='h-[40px] custom-input' placeholder="00000" />
          </Form.Item>
        </div>

        <div className="bg-white p-4 py-6 rounded-md border border-gray-300">
          <h3 className="font-medium mb-2">Billing Information</h3>
          <Form.Item name="sameAsShipping" valuePropName="checked" noStyle>
            <Checkbox>Same as shipping address</Checkbox>
          </Form.Item>
        </div>

        <Form.Item className="mt-4 mx-auto flex justify-center items-center">
          <button
            type="primary"
            htmlType="submit"
            className="bg-[#CBA135] hover:bg-yellow-600 mx-auto text-white rounded-md px-16 h-[48px] text-md font-semibold"
          >
            Save Address
          </button>
        </Form.Item>
      </Form>
    </div>
{/*  */}

</div>
</div>




</div>
  );
};

export default Checkout;
