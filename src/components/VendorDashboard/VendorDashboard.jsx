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
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { GoGraph } from 'react-icons/go';
import { FaCartShopping } from 'react-icons/fa6';
import { FaBell, FaBox, FaEdit, FaFantasyFlightGames } from 'react-icons/fa';
import { IoIosPeople } from 'react-icons/io';
import { IoExit, IoPricetagSharp } from 'react-icons/io5';
import { LuMessageSquareText } from 'react-icons/lu';
import { GrAnalytics } from 'react-icons/gr';
import VendorOverViewModal from '../AdminDashboard/pages/Overview/_subComponents/VendorOverView';
import { MdLogout } from 'react-icons/md';
import useNotificationSocket from '../../Websocket/useNotificationSocket';
import Notification from '../AdminDashboard/pages/Notifications/Notification';
import Swal from 'sweetalert2'; // Import SweetAlert2

const { Header, Content, Sider } = Layout;

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
    icon: <LuMessageSquareText size={16} />,
    label: (
      <Link className="flex w-full items-center gap-7" to="vendor-message">
        Message{' '}
        <p className="w-4 h-4 gap-5 p-3 flex justify-center text-xs items-center rounded-full bg-[#CBA135] text-white">
          7
        </p>
      </Link>
    ),
    path: 'vendor-message',
  },
];

const VendorDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate();
  const location = useLocation();
  const currentKey = location.pathname.split('/')[1];
  const currentPath = location.pathname.split('/')[2]; // vendor-dashboard/**vendor-products**
  const activeItem = items.find(item => item.path === currentPath);
  const selectedKey = activeItem ? [activeItem.key] : [];
  const { notifications, connected } = useNotificationSocket();


    const userInfo = JSON.parse(localStorage.getItem('customerId'))

  console.log(userInfo.user.first_name) 


  const handleLogout = () => {
    // Show confirmation dialog
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
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
       <div className='p-4 flex flex-col gap-10 justify-center items-center'>
      <Link to='/'>   <img className='w-[80%]' src="/image/footer.png" alt="" /></Link>

<div className='flex justify-center items-center gap-3 flex-col'>
           <img className='h-[60px] w-[60px] rounded-full' src="/image/decor.png" alt="" />

        
</div>
       </div>
       <hr className='pb-3' />
     <div className='flex flex-col gap-40 justify-around'>
    <div className="flex-1 justify-between  h-screen overflow-auto">
    <Menu
      theme="light"
      mode="inline"
      
      selectedKeys={selectedKey}
      items={items}
      className="popreg text-lg space-y-2"
      
    />
  </div>
  <div 
    onClick={handleLogout}
    className='text-red-600 mb-9 hover:text-green-400 flex justify-center items-center gap-2 cursor-pointer'
  >
    <MdLogout className='-mt-1' size={16} />
    <h3 className='popmed'>Logout</h3>
  </div>
</div>
      </Sider>
      <Layout>
        <Header
         className='bg-white px-9'
        >
       <div className='flex justify-between items-center'>
        <h5 className='text-[20px] font-semibold'>Vendor Dastboard</h5>
        <div className='flex justify-center items-center gap-3'>

        <Notification />
     
  
        </div>
       </div>
        </Header>

        <Content className="bg-[#FAF8F2] h-[85vh] overflow-y-scroll px-2" style={{ margin: '0' }}>
          <Outlet />
        </Content>
      </Layout>
      <VendorOverViewModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} location={'a'} />
    </Layout>
  );
};

export default VendorDashboard;