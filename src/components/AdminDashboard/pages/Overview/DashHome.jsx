import { MdOutlineAttachMoney } from "react-icons/md";
import SalesOverview from "./_subComponents/SalesOverview";
import DashTable from "./_subComponents/DashTable";
import {
 
  MdOutlineShoppingCart,
  MdPeopleAlt,
  MdStore,
  MdInventory,
  MdReplay,
} from "react-icons/md";
import { FaCheck, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAdminOverViewQuery } from "../../../../redux/slices/Apis/dashboardApis";
import AdminSellsOverview from "./_subComponents/AdminSellsOverview";
import useNotificationSocket from "../../../../Websocket/useNotificationSocket";

const DashHome = () => {
  const {data} = useAdminOverViewQuery()


  const cards = [
    {
      title: "Total Revenue",
      value: data?.total_revenue?.value,
      change: data?.total_revenue?.change,
      color: "#16A34A",
      icon: <MdOutlineAttachMoney className="text-[#CBA135]" size={26} />,
      footerText: data?.total_revenue?.note,
    },
    {
      title: "Total Orders",
      value: data?.total_orders?.value,
      change: data?.total_orders?.change,
      color: "#3B82F6",
      icon: <MdOutlineShoppingCart className="text-[#3B82F6]" size={26} />,
      footerText: data?.total_orders?.note,
    },
    {
      title: "New Customers",
      value: data?.new_customers?.value,
      change: data?.new_customers?.change,
      color: "#10B981",
      icon: <MdPeopleAlt className="text-[#10B981]" size={26} />,
      footerText: data?.new_customers?.note,
    },
    {
      title: "Active Sellers",
      value: data?.active_sellers?.value,
      change: data?.active_sellers?.change,
      color: "#EF4444",
      icon: <MdStore className="text-[#EF4444]" size={26} />,
      footerText: data?.active_sellers?.note,
    },
    {
      title: "Low Stock",
      value: data?.low_stock?.value,
      change: data?.low_stock?.change,
      color: "#8B5CF6",
      icon: <MdInventory className="text-[#8B5CF6]" size={26} />,
      footerText: data?.low_stock?.note,
    },
    {
      title: "Pending Returns",
      value: data?.pending_returns?.value,
      change: data?.pending_returns?.change,
      color: "#F59E0B",
      icon: <MdReplay className="text-red-400" size={26} />,
      footerText: data?.pending_returns?.note,
    },
  ];

  return (
    <div className="bg-[#FAF8F2] min-h-screen p-6">
      {/* === Top Cards === */}                  
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-10">
  {cards.map((card, index) => (
    <div
      key={index}
      className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition duration-300 space-y-3 py-11 w-full"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">{card.title}</p>
        {card.icon}
      </div>
      <h3 className="text-3xl font-extrabold popbold text-gray-800">{card.value}</h3>
      <p className="text-sm font-medium" style={{ color: card.color }}>
        {card.change} – {card.footerText}
      </p>
    </div>
  ))}
</div>


      {/* === Bottom Section === */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
        {/* === Left Column === */}
        <div className="flex-1 flex flex-col space-y-6">
          <AdminSellsOverview />

          <div className="bg-white p-6 rounded-xl shadow-md flex-1">
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-semibold text-gray-800">Latest Orders</p>
              <button className="text-[#CBA135] text-sm font-medium hover:underline">
                View All
              </button>
            </div>
            <DashTable />
          </div>
        </div>

        {/* === Right Sidebar === */}
        <div className="w-full lg:w-1/4 flex flex-col justify-between space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
 <Link to='/admin-dashboard/add-product'  className="block">
                <button className="bg-[#CBA135] text-white py-3 w-full sm:w-72 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition">
          <FaPlus /> Add New Product
        </button>
        </Link>
             {/* <Link to= 'd' className="block">
              <button className="bg-[#EAE7E1] text-gray-800 py-3 px-4 rounded-xl w-full flex items-center gap-2 hover:opacity-90">
                <FaCheck /> Approve Sellers
              </button>
             </Link> */}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-lg font-semibold pb-2">Recent Alerts</p>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-600 mt-2" />
                  <div>
                    <p className="text-sm text-gray-700">Low stock alert for "Modern Sofa Set"</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Categories & Top Sellers */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div>
              <p className="text-lg font-semibold pb-2">Top Categories</p>
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500" />
                    <p className="text-sm text-gray-700">Living Room</p>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">34%</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-lg font-semibold pb-2">Top Seller/Vendor</p>
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                    <p className="text-sm text-gray-700">Living Room</p>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">34%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashHome;
