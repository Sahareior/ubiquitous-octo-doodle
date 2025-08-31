import React from 'react';
import { Avatar, Button, Input, Select } from 'antd';
import CustomerTable from '../CustomerList/CustomerTable';

import { FaChevronDown, FaDownload } from 'react-icons/fa';
import ReturnReqTable from './_component/ReturnReqTable';
// import CustomerTable from './CustomerTable';

const { Option } = Select;

const ReturnReq = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between mt-3 px-2 items-center">
        <h2 className="popbold flex items-center gap-2 text-[28px] sm:text-[34px]">
          Return Requests
        </h2>

    <Button className='bg-[#CBA135] popmed text-[16px] flex items-center text-white px-7 py-5'><FaDownload /> Vendor Data</Button>
      </div>

     


      <div>
        <ReturnReqTable />
      </div>
    </div>
  );
};

export default ReturnReq;
