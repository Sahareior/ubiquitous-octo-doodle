import React, { useState, useMemo } from "react";
import { Button, Select, Spin } from "antd";
import { FaChevronDown, FaDownload } from "react-icons/fa";
import { useGetAllVendorsQuery } from "../../../../redux/slices/Apis/dashboardApis";
import VendorTable from "./VendorTable";
import dayjs from "dayjs";

const { Option } = Select;

const VendorList = () => {
  const { data: vendors,isLoading } = useGetAllVendorsQuery();

  // State for search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Filtered vendors list
  const filteredVendors = useMemo(() => {
    if (!vendors?.results) return [];

    return vendors.results.filter((vendor) => {
      const matchesSearch =
        vendor.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.user_id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All"
          ? true
          : statusFilter === "Active"
          ? vendor.approval_status !== null
          : vendor.approval_status === null;

      return matchesSearch && matchesStatus;
    });
  }, [vendors, searchTerm, statusFilter]);

  // ✅ Export CSV function
  const handleExportVendors = () => {
    if (!filteredVendors.length) {
      alert("No vendor data available to export!");
      return;
    }

    // Define CSV headers
    const headers = [
      "Vendor ID",
      "Vendor Name",
      "User ID",
      "Approval Status",
      "Created Date"
    ];

    // Map vendor data
    const rows = filteredVendors.map((vendor) => [
      vendor.id,
      vendor.vendor_name,
      vendor.user_id,
      vendor.approval_status ? "Active" : "Inactive",
      vendor.created_at ? dayjs(vendor.created_at).format("YYYY-MM-DD") : ""
    ]);

    // Convert to CSV string
    const csvContent =
      [headers, ...rows].map((row) => row.map((val) => `"${val || ""}"`).join(",")).join("\n");

    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `vendors_${dayjs().format("YYYY-MM-DD")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

    if(isLoading){
      return(
        <div className="flex h-screen justify-center items-center">
          <Spin size="large" />
        </div>
      )
    }
  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between mt-3 px-2 items-center">
        <h2 className="popbold flex items-center gap-2 text-[28px] sm:text-[34px]">
          Vendor list
        </h2>

        <Button
          onClick={handleExportVendors}
          className="bg-[#CBA135] popmed text-[16px] flex items-center text-white px-7 py-5"
        >
          <FaDownload /> Vendor Data
        </Button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-md shadow-sm">
        {/* Left */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Search Input */}
          <input
            placeholder="Search Vendor"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border popreg border-[#D1D5DB] rounded-md px-4 pl-10 h-[45px] placeholder:text-sm focus:outline-none focus:ring-0 focus:border-[#CBA135]"
          />

          {/* Status Filter */}
          <div className="relative w-full sm:w-[220px]">
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              className="w-full h-10 rounded-md"
            >
              <Option value="All">All Status</Option>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Trial/Inactive</Option>
            </Select>
            <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Right: Info */}
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{filteredVendors.length}</span> of{" "}
          <span className="font-medium">{vendors?.results?.length || 0}</span>{" "}
          vendors
        </p>
      </div>

      {/* Vendor Table */}
      <div>
        <VendorTable vendors={filteredVendors} />
      </div>
    </div>
  );
};

export default VendorList;
