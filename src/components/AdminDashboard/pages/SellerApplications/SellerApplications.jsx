import React, { useState, useMemo } from "react";
import { Select } from "antd";
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa6";

import SellersTable from "./_components/SellersTable";
import { useBulkSellerApplicationsUpdateMutation, useGetAllSellerApplicationQuery } from "../../../../redux/slices/Apis/dashboardApis";

const { Option } = Select;

const SellerApplications = () => {
  const { data: applicants, isLoading } = useGetAllSellerApplicationQuery();
  const [bulkSellerApplicationsUpdate] = useBulkSellerApplicationsUpdateMutation()

  // filter states
  const [searchName, setSearchName] = useState("");
  const [jobTitle, setJobTitle] = useState(null);
  const [status, setStatus] = useState(null);

  // filter logic
  const filteredApplicants = useMemo(() => {
    if (!applicants?.results) return [];

    return applicants.results.filter((applicant) => {
      const matchesName = searchName
        ? applicant.legal_business_name
            .toLowerCase()
            .includes(searchName.toLowerCase())
        : true;

      const matchesJob = jobTitle ? applicant.job_title === jobTitle : true;

      const matchesStatus = status
        ? applicant.status.toLowerCase() === status.toLowerCase()
        : true;

      return matchesName && matchesJob && matchesStatus;
    });
  }, [applicants, searchName, jobTitle, status]);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="grid grid-cols-1 p-6 bg-white items-center rounded-md md:grid-cols-3 gap-5">
        {/* Business Name Search */}
        <div>
          <input
            type="text"
            placeholder="Enter Business Name"
            className="w-full border border-gray-300 rounded-xl px-4 py-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>

        {/* Job Title */}
        <div>
          <Select
            placeholder="Select Job Title"
            className="w-full"
            size="large"
            allowClear
            onChange={(val) => setJobTitle(val)}
          >
            <Option value="owner">Owner</Option>
            <Option value="manager">Manager</Option>
            <Option value="designer">Designer</Option>
          </Select>
        </div>

        {/* Status */}
        <div>
          <Select
            placeholder="Select Status"
            className="w-full"
            size="large"
            allowClear
            onChange={(val) => setStatus(val)}
          >
            <Option value="approved">Approved</Option>
            <Option value="rejected">Rejected</Option>
            <Option value="pending">Pending</Option>
          </Select>
        </div>
      </div>

      {/* Sellers Table */}
      <div>
        <SellersTable applicants={filteredApplicants} loading={isLoading} />
      </div>
    </div>
  );
};

export default SellerApplications;
