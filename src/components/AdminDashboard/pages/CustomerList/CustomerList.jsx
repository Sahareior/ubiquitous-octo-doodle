import React, { useState, useMemo } from 'react';
import { Select } from 'antd';
import { RiArrowDropDownLine } from 'react-icons/ri';
import { useGetAllCustomersQuery } from '../../../../redux/slices/Apis/dashboardApis';
import CustomerTable from './CustomerTable';

const { Option } = Select;

const CustomerList = () => {
  const { data, refetch } = useGetAllCustomersQuery();
  const customers = data?.results || [];

  // Local states for searching & filtering
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Derived filtered data
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // Search filter (case-insensitive, matches customer_name or customer_email)
      const matchesSearch =
        customer.customer_name.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.customer_email.toLowerCase().includes(searchText.toLowerCase());

      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'Active') {
        matchesStatus = customer.is_active === true;
      } else if (statusFilter === 'Trial/Inactive') {
        matchesStatus = customer.is_active === false;
      }

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchText, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Filter and Search */}
      <div className="flex rounded-xl bg-white p-5 flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center flex-col sm:flex-row w-full gap-4">
          {/* Search Input */}
          <input
            placeholder="Search by Name or Email"
            className="w-full sm:w-1/2 border border-[#D1D5DB] rounded-md px-4 h-[45px] placeholder:pl-1 focus:outline-none focus:ring-0 focus:border-[#D1D5DB]"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            className="w-full sm:w-1/2 h-[45px]"
            suffixIcon={<RiArrowDropDownLine size={22} />}
          >
            <Option value="All Status">All Status</Option>
            <Option value="Active">Active</Option>
            <Option value="Trial/Inactive">Trial/Inactive</Option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div>
        <CustomerTable customerList={filteredCustomers} />
      </div>
    </div>
  );
};

export default CustomerList;
