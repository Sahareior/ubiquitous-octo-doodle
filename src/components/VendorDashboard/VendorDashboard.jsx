import React, { useEffect, useState } from 'react';
import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  BellOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Layout, Menu, theme, Input, Badge, Avatar } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { GoGraph } from 'react-icons/go';
import { FaCartShopping } from 'react-icons/fa6';
import { FaBox } from 'react-icons/fa';
import { IoIosPeople } from 'react-icons/io';
import { IoPricetagSharp } from 'react-icons/io5';
import { LuMessageSquareText } from 'react-icons/lu';
import VendorOverViewModal from '../AdminDashboard/pages/Overview/_subComponents/VendorOverView';
import { MdLogout } from 'react-icons/md';
import Notification from '../AdminDashboard/pages/Notifications/Notification';
import Swal from 'sweetalert2';
import { useGetProfileQuery } from '../../redux/slices/Apis/customersApi';
import { useWebSocketContext } from '../../context/WebSocketContext';

const { Header, Content, Sider } = Layout;

const VendorDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { data: profileData } = useGetProfileQuery();

  const {
    globalMessages,
    sendMessage,
    connected,
    setUserId,
    setIncoming,
    incoming,
  } = useWebSocketContext();

  const userInfo = JSON.parse(localStorage.getItem('customerId'));
  const annomalyImage = "/image/ann.png";

  const profileImage = userInfo?.user?.profile_image
    ? `${profileData?.profile_image}`
    : annomalyImage;


    console.log(incoming, "incomingggggg");

  // ✅ Define items BEFORE using them
  const items = [
    {
      key: '1',
      icon: <GoGraph size={16} />,
      label: <Link to="vendor-overview">Home</Link>,
      path: 'vendor-overview',
    },
    {
      key: '2',
      icon: <FaCartShopping size={16} />,
      label: <Link to="vendor-order">Orders</Link>,
      path: 'vendor-order',
    },
    {
      key: '3',
      icon: <IoIosPeople size={16} />,
      label: <Link to="vendor-payment">Payment</Link>,
      path: 'vendor-payment',
    },
    {
      key: '4',
      icon: <IoPricetagSharp size={16} />,
      label: <Link to="promotion">Promotions</Link>,
      path: 'promotion',
    },
    {
      key: '5',
      icon: <FaBox size={16} />,
      label: <Link to="vendor-products">Products</Link>,
      path: 'vendor-products',
    },
    {
      key: '6',
      icon: (
        <div className="relative">
          <LuMessageSquareText size={16} />
          {incoming && (
            <span className="absolute top-1 -right-28 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </div>
      ),
      label: (
        <Link onClick={()=> setIncoming(false)} className="flex w-full items-center gap-2" to="vendor-message">
          Message
        </Link>
      ),
      path: 'vendor-message',
    },
  ];

  // ✅ Now safely use items
  const currentPath = location.pathname.split('/')[2]; 
  const activeItem = items.find(item => item.path === currentPath);
  const selectedKey = activeItem ? [activeItem.key] : [];

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out from the vendor dashboard",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("customerId");
        navigate("/login");

        Swal.fire(
          'Logged out!',
          'You have been successfully logged out.',
          'success'
        );
      }
    });
  };

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout>
      <Sider
        className="bg-white"
        breakpoint="lg"
        width={250}
        collapsedWidth="0"
      >
        {/* Top logo and user info */}
        <div className='p-4 flex flex-col gap-10 justify-center items-center'>
          <Link to='/'>
            <img className='w-[80%] mx-auto' src="/image/footer.png" alt="" />
          </Link>

          <div className='flex justify-center items-center gap-3 flex-col'>
            <img
              className='h-16 w-16 bg-cover rounded-full'
              src={profileImage}
            />
          </div>
        </div>

        <hr className='pb-3' />

        {/* Menu + Logout */}
        <div className="flex flex-col justify-between h-[calc(100vh-150px)]">
          {/* Menu */}
          <div className="flex-1 overflow-auto">
            <Menu
              theme="light"
              mode="inline"
              selectedKeys={selectedKey}
              items={items}
              className="popreg text-lg space-y-2"
            />
          </div>

          {/* Logout at bottom */}
          <div 
            onClick={handleLogout}
            className='text-red-600 mb-16 hover:text-green-400 flex justify-center items-center gap-2 cursor-pointer'
          >
            <MdLogout className='-mt-1' size={16} />
            <h3 className='popmed'>Logout</h3>
          </div>
        </div>
      </Sider>

      <Layout>
        <Header className='bg-white px-9'>
          <div className='flex justify-between items-center'>
            <h5 className='text-[20px] font-semibold'>Vendor Dashboard</h5>
            <div className='flex justify-center items-center gap-3'>
              <Notification />
            </div>
          </div>
        </Header>

        <Content className="bg-[#FAF8F2] h-[80vh] overflow-y-scroll px-2" style={{ margin: '0' }}>
          <Outlet />
        </Content>
      </Layout>

      <VendorOverViewModal 
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen} 
        location={'a'} 
      />
    </Layout>
  );
};

export default VendorDashboard;
