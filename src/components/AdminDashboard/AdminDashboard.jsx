import React, { useEffect } from 'react';
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
import { FaCartShopping, FaMoneyBill } from 'react-icons/fa6';
import { FaBox, FaCaretSquareRight, FaEdit, FaFantasyFlightGames } from 'react-icons/fa';
import { IoIosPeople } from 'react-icons/io';
import { IoPricetagSharp } from 'react-icons/io5';
import { LuMessageSquareText } from 'react-icons/lu';
import { GrAnalytics } from 'react-icons/gr';
import { MdLogout } from 'react-icons/md';
import { TbCategoryPlus } from "react-icons/tb";
import useNotificationSocket from '../../Websocket/useNotificationSocket';
import { isLoading } from './../../../node_modules/sweetalert2/src/utils/dom/getters';
import { useGetAllNotificationQuery } from '../../redux/slices/Apis/dashboardApis';
import Notification from './pages/Notifications/Notification';
import { RxExit } from 'react-icons/rx';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { useGetProfileQuery } from '../../redux/slices/Apis/customersApi';

const { Header, Content, Sider } = Layout;

const items = [
  {
    key: 'admin-overview',
    icon: <GoGraph size={16} />,
    label: <Link to="">Home</Link>,
  },
  {
    key: 'admin-orders',
    icon: <FaCartShopping size={16}/>,
    label: <Link to="admin-orders">Orders</Link>,
  },
  {
    key: 'customers',
    icon: <IoIosPeople size={16}/>,
    label: <Link to="customers">Customers</Link>,
  },
  {
    key: 'vendors',
    icon: <IoPricetagSharp size={16}/>,
    label: <Link to="vendors">Vendor</Link>,
  },
  {
    key: 'category',
    icon: <TbCategoryPlus  size={16}/>,
    label: <Link to="category">Categorys</Link>,
  },
  {
    key: 'return',
    icon: <TbCategoryPlus  size={16}/>,
    label: <Link to="return">Return Product</Link>,
  },
  {
    key: 'sellers-apply',
    icon: <IoPricetagSharp size={16}/>,
    label: <Link to="sellers-apply">Sellers Apply</Link>,
  },
  {
    key: 'productslist',
    icon: <FaBox  size={16}/>,
    label: <Link to="productslist">Products</Link>,
  },
  {
    key: 'messages',
    icon: <LuMessageSquareText size={16}/>,
    label: <Link className='flex w-full items-center gap-2' to="messages">Message </Link>,
  },
  {
    key: 'analytics',
    icon: <GrAnalytics size={16}/>,
    label: <Link to="analytics">Analytics</Link>,
  },
  {
    key: 'payouts',
    icon: <FaMoneyBill size={16}/>,
    label: <Link to="payouts">Payouts</Link>,
  },
  {
    key: 'content',
    icon: <FaEdit size={16}/>,
    label: <Link to="content">Banners</Link>,
  },
 {
    key: 'settings',
    icon: <FaFantasyFlightGames size={16} />,
    label: 'Settings',
    children: [
      {
        key: 'terms',
        label: <Link to="terms">Terms and Conditions</Link>,
      },
      {
        key: 'privacy',
        label: <Link to="privacy">Privacy Policy</Link>,
      },
    ],
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathKey = location.pathname.split('/')[2] || 'admin-overview';
  const { data: profileData, error, refetch } = useGetProfileQuery();
  const {data:notificationData, isLoading} = useGetAllNotificationQuery()
    const { notifications, connected } = useNotificationSocket();

    localStorage.setItem('notify', JSON.stringify(notifications))

  const storedRole = localStorage.getItem('user_role'); // "customer" or "vendor"

  const userInfo = JSON.parse(localStorage.getItem('customerId'))


// 

 const annomalyImage = "/image/ann.png"

const profileImage = userInfo?.user?.profile_image
  ? `${profileData?.profile_image}`
  : annomalyImage;


  const handleLogout = () => {
    // Show confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out from the admin dashboard",
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

  // 👇 Redirect if directly landing on /admin-dashboard
  if (location.pathname === '/admin-dashboard') {
    return <Navigate to="/admin-dashboard/admin-overview" replace />;
  }

  return (
    <Layout>
      <Layout.Sider
        className="bg-white"
        breakpoint="lg"
        width={250}
        collapsedWidth="0"
      >
               <div className='p-4 flex flex-col gap-10 justify-center items-center'>
         <Link to='/'>
         <img className='w-[80%] mx-auto' src="/image/footer.png" alt="" />
         </Link>

<div className='flex justify-center items-center gap-3 flex-col'>
           <Avatar
  src={profileImage}
  size={64}
  style={{ border: "2px solid #e5e7eb" }}
/>


         <p className='popmed text-lg text-[#666666]'>Hi {userInfo?.user?.first_name}</p>
</div>
       </div>
 
        <div className="flex flex-col">
          <div className="flex-1 overflow-auto ">
            <Menu
              theme="light"
              mode="inline"
              selectedKeys={[pathKey]}
              items={items}
                    className="popreg text-lg space-y-2"
            />
          </div>
        </div>
      </Layout.Sider>

      <Layout>
        <Layout.Header className="bg-white px-3">
          <div className="flex px-3 justify-between items-center">
            <h5 className="text-[20px] font-semibold">Admin Dashboard</h5>
            <div className="flex items-center gap-3">
    
 <div className='flex justify-center items-center gap-4'>
     <div className=''>
      <Notification />
     </div>
              <div onClick={handleLogout} className="cursor-pointer">
                <RxExit size={20} />
              </div>
 </div>
            </div>
          </div>
        </Layout.Header>

        <Layout.Content className="bg-[#FAF8F2] h-[86vh] overflow-y-scroll px-2" style={{ margin: '0' }}>
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;