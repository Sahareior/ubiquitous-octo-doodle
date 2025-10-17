import React, { useState, useMemo } from "react";
import PayoutTable from "./_components/PayoutTable";
import { useGetAllPayoutsQuery } from "../../../../redux/slices/Apis/dashboardApis";
import { Spin } from "antd";

const Payouts = () => {
  const { data: payouts, isLoading } = useGetAllPayoutsQuery();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ✅ Memoized filtering
  // const filteredPayouts = useMemo(() => {
  //   if (!payouts?.results) return [];

  //   return payouts.results.filter((item) => {
  //     const matchesSearch =
  //       item.note?.toLowerCase().includes(search.toLowerCase()) ||
  //       item.payment_method?.toLowerCase().includes(search.toLowerCase()) ||
  //       item.amount?.toString().includes(search);

  //     const matchesStatus = statusFilter
  //       ? item.status === statusFilter
  //       : true;

  //     return matchesSearch && matchesStatus;
  //   });
  // }, [payouts, search, statusFilter]);

    if(isLoading){
    return(
      <div className="flex h-screen justify-center items-center">
        <Spin size="large" />
      </div>
    )
  }


  return (
    <div className="p-6">
      {/* ✅ Title */}
      <h1 className="popbold flex items-center gap-2 text-[28px] sm:text-[34px] mb-11 mt-6">💰 Payout History</h1>

      {/* ✅ Search + Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search by amount, note, or method..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-1/4 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <option value="">All Status</option>
          <option value="approved">✅ Approved</option>
          <option value="pending">⏳ Pending</option>
          <option value="rejected">❌ Rejected</option>
        </select>
      </div>

      {/* ✅ Table */}
       <PayoutTable payouts={payouts?.results || []} />
    </div>
  );
};

export default Payouts;
