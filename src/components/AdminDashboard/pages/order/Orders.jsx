import React, { useState, useMemo } from 'react';
import { Input, Select, DatePicker, Button } from 'antd';
import { IoSearch } from 'react-icons/io5';
import OrdersTable from './OrdersTable';
import { FaDownload } from 'react-icons/fa';
import { RiArrowDropDownLine } from 'react-icons/ri';
import { useGetAllOrdersQuery } from '../../../../redux/slices/Apis/dashboardApis';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Orders = () => {
  const { data: ordersData } = useGetAllOrdersQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState([]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (!ordersData?.results) return [];
    
    return ordersData.results.filter(order => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesOrderId = order.order_id?.toLowerCase().includes(searchLower);
        const matchesCustomer =
          order.customer?.first_name?.toLowerCase().includes(searchLower) ||
          order.customer?.last_name?.toLowerCase().includes(searchLower) ||
          order.customer?.email?.toLowerCase().includes(searchLower);

        if (!matchesOrderId && !matchesCustomer) return false;
      }

      if (statusFilter !== 'all' && order.order_status !== statusFilter) {
        return false;
      }

      if (dateRange && dateRange.length === 2) {
        const orderDate = dayjs(order.order_date);
        const startDate = dateRange[0].startOf('day');
        const endDate = dateRange[1].endOf('day');

        if (!orderDate.isBetween(startDate, endDate, null, '[]')) {
          return false;
        }
      }

      return true;
    });
  }, [ordersData, searchTerm, statusFilter, dateRange]);

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleStatusChange = (value) => setStatusFilter(value);
  const handleDateChange = (dates) => setDateRange(dates);
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange([]);
  };

  // ✅ Export to CSV function
  const handleExport = () => {
    if (!filteredOrders.length) {
      alert("No data available to export!");
      return;
    }

    // Define CSV headers
    const headers = [
      "Order ID",
      "Customer Name",
      "Customer Email",
      "Status",
      "Order Date",
      "Total Amount"
    ];

    // Map data
    const rows = filteredOrders.map(order => [
      order.order_id,
      `${order.customer?.first_name || ""} ${order.customer?.last_name || ""}`,
      order.customer?.email || "",
      order.order_status,
      order.order_date,
      order.total_amount
    ]);

    // Convert to CSV string
    const csvContent =
      [headers, ...rows].map(e => e.map(val => `"${val || ""}"`).join(",")).join("\n");

    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orders_${dayjs().format("YYYY-MM-DD")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="px-6 py-4">
      <div className="border w-full relative py-14 bg-[#FFFFFF] rounded-xl border-[#E5E7EB]">
        <div className="flex justify-between w-full items-center absolute top-5 p-4">
          <p className="popbold text-slate-400 text-xl">
            Manage and track all customer orders
          </p>
          <Button
            onClick={handleExport}
            className="bg-[#CBA135] text-white popmed px-7 right-6 py-5"
          >
            <FaDownload /> Export Now
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex rounded-xl bg-white p-5 flex-col sm:flex-row mt-6 justify-between items-start sm:items-center gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full px-4 sm:px-10">
          {/* Search */}
          <div className="w-full">
            <p className="text-sm font-medium text-gray-700 mb-1">Search Orders</p>
            <input
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by Order ID / Customer"
              className="w-full border popreg border-[#D1D5DB] rounded-md px-4 pl-10 h-[45px] placeholder:text-sm focus:outline-none focus:ring-0 focus:border-[#CBA135]"
            />
          </div>

          {/* Status */}
          <div className="w-full">
            <p className="text-sm font-medium text-gray-700 mb-1">Order Status</p>
            <Select
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full popreg h-[45px]"
              suffixIcon={<RiArrowDropDownLine size={22} />}
            >
              <Option value="all">All Statuses</Option>
              <Option value="processing">Processing</Option>
              <Option value="shipped">Shipped</Option>
              <Option value="delivered">Delivered</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </div>

          {/* Date */}
          <div className="w-full">
            <p className="text-sm font-medium text-gray-700 mb-1">Date Range</p>
            <RangePicker
              value={dateRange}
              onChange={handleDateChange}
              className="w-full h-[45px] rounded-md border popreg border-[#D1D5DB]"
              style={{ height: "45px", width: "100%" }}
            />
          </div>

          {/* Reset */}
          <div className="w-full flex items-end">
            <Button
              onClick={handleResetFilters}
              className="h-[45px] popreg border border-[#D1D5DB]"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-12 bg-white p-6 shadow-md">
        <OrdersTable orders={filteredOrders} />
      </div>
    </div>
  );
};

export default Orders;
