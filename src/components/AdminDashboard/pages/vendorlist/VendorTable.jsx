import React, { useState } from "react";
import { Table, Select, message } from "antd";
import { FaStar } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { RiArrowDropDownLine } from "react-icons/ri";
import VendorModal from "./VendorModal/VendorModal";
import {
  useDeleteBulkUsersMutation,
  useDeleteUsersMutation,
  useGetAllVendorsQuery,
} from "../../../../redux/slices/Apis/dashboardApis";
import Swal from "sweetalert2";

const { Option } = Select;

const VendorTable = ({ vendors }) => {
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState({});
  const [deleteBulkUsers] = useDeleteBulkUsersMutation();
  const [bulkAction, setBulkAction] = useState(undefined); // ✅ NEW
  const [deleteUsers] = useDeleteUsersMutation();
    const { data,refetch } = useGetAllVendorsQuery();

  // Transform API data for table
 const dataSource =
  vendors?.map((v) => {
    const deleteId = v.actions?.delete_url?.split("/")[3]; // "25"
    return {
      key: v.user_id,       // keep key as unique
      id: v.user_id,        // "Wrioko1025"
      deleteId,             // numeric id from URL
      vendor: v.vendor_name,
      status: v.approval_status,
      products: v.products_count,
      orders: v.orders_count,
      rating: v.ratings,
      actions: v.actions,
      signup_data: v.signup_date,
      email: v.email
    };
  }) || [];


  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <a className="text-[16px] popreg">{text}</a>,
    },
    {
      title: "Vendor",
      dataIndex: "vendor",
      key: "vendor",
      render: (text) => <a className="popreg text-[16px]">{text}</a>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          className={`px-3 py-1 popreg rounded-xl text-[16px] font-medium ${
            status === "approved"
              ? "bg-green-100 text-green-600"
              : status === "pending"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Products",
      dataIndex: "products",
      key: "products",
      render: (text) => <span className="popreg text-[16px]">{text}</span>,
    },
    {
      title: "Orders",
      dataIndex: "orders",
      key: "orders",
      render: (text) => <span className="popreg text-[16px]">{text}</span>,
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => (
        <div className="flex items-center">
          <span className="px-2 text-[16px] popreg">{rating}</span>
          <FaStar
            className={rating > 0 ? "text-yellow-400" : "text-gray-300"}
            size={14}
          />
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <IoEyeOutline
            onClick={() => {
              setIsModalOpen(true);
              setSelectedVendor(record);
            }}
            className="text-gray-400 cursor-pointer"
            size={20}
          />
          <MdDelete
            className="text-red-400 cursor-pointer"
            size={20}
            onClick={() => handleDelete(record)}
          />
        </div>
      ),
    },
  ];

  // Single delete
  const handleDelete = async (record) => {
    const url = record?.actions?.delete_url;
    const id = url?.split("/")[3]; // extract "17"

    if (!id) {
      message.error("Delete URL missing!");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteUsers(id);
          refetch()
          // console.log("Deleted:", id, res);
          Swal.fire("Deleted!", "The vendor has been deleted.", "success");
        } catch (error) {
          console.error("Delete failed:", error);
          Swal.fire("Error!", "Failed to delete the vendor.", "error");
        }
      }
    });
  };

  // Bulk delete
const handleBulkDelete = async () => {
  Swal.fire({
    title: "Are you sure?",
    text: `Delete ${selectedRowKeys.length} selected vendors?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete them!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        // Map selectedRowKeys (user_id) to their deleteId
        const idsToDelete = dataSource
          .filter((row) => selectedRowKeys.includes(row.key))
          .map((row) => row.deleteId);

        const res = await deleteBulkUsers({ user_ids: idsToDelete });
        refetch()
        // console.log("Bulk delete response:", res);

        Swal.fire(
          "Deleted!",
          `${idsToDelete.length} vendors have been deleted.`,
          "success"
        );
        setSelectedRowKeys([]);
        setBulkAction(undefined);
      } catch (error) {
        console.error("Bulk delete failed:", error);
        Swal.fire("Error!", "Failed to delete vendors.", "error");
        setBulkAction(undefined);
      }
    } else {
      setBulkAction(undefined);
    }
  });
};


  // Handle dropdown action
  const handleBulkAction = (action) => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one row.");
      return;
    }
    if (action === "delete") {
      handleBulkDelete();
    } else if (action === "edit") {
      message.info("Bulk edit not implemented.");
    }
  };

  return (
    <div className="bg-white p-4 rounded relative shadow-md">
      {/* Bulk Actions Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Select
            placeholder="Bulk Actions"
            size="small"
            className="min-w-[140px]"
            value={bulkAction} // ✅ controlled value
            onChange={(val) => {
              setBulkAction(val);
              handleBulkAction(val);
            }}
            suffixIcon={<RiArrowDropDownLine />}
          >
            <Option value="delete">Delete</Option>
            {/* <Option value="edit">Edit</Option> */}
          </Select>
          <span className="text-sm text-gray-500">
            {selectedRowKeys.length} selected
          </span>
        </div>
      </div>

      {/* Table */}
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        columns={columns}
        dataSource={dataSource}
        pagination={{
          pageSize,
          total: dataSource.length,
          showTotal: (total, range) =>
            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
          showSizeChanger: false,
          position: ["bottomRight"],
        }}
        footer={() => (
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center relative gap-2 text-sm">
              <span>Show</span>
              <Select
                value={pageSize}
                onChange={(value) => setPageSize(value)}
                size="small"
                style={{ width: 70 }}
                suffixIcon={<RiArrowDropDownLine />}
              >
                {[10, 20, 50].map((size) => (
                  <Option key={size} value={size}>
                    {size}
                  </Option>
                ))}
              </Select>
              <span>entries</span>
            </div>
          </div>
        )}
      />
      <VendorModal
        setIsModalOpen={setIsModalOpen}
        vendorsData={selectedVendor}
        isModalOpen={isModalOpen}
      />
    </div>
  );
};

export default VendorTable;
