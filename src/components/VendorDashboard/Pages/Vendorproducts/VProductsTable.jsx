import React, { useState } from "react";
import { Table, Select, message } from "antd";
import { IoEyeOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { RiArrowDropDownLine } from "react-icons/ri";
import ProductsModal from "./VProductsModal/VProductsModal";
import Swal from "sweetalert2";
import {
  useDeleteProductMutation,
  useGetAllProductsQuery,
  useGetCategoriesQuery,
} from "../../../../redux/slices/Apis/vendorsApi";
import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import VProductsModal from "./VProductsModal/VProductsModal";

const { Option } = Select;

const VProductsTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, error, refetch } = useGetAllProductsQuery();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selected, setSelected] = useState({});
  const [deleteProduct, { isLoading: deleteLoading }] =
    useDeleteProductMutation();
    

    const {data:categories} = useGetCategoriesQuery()

  console.log("allProducts", data?.results);
  console.log("allCategories", categories?.results);

const getCategories = (product) => {
  if (!product?.categories || !categories?.results) return [];

  return product.categories
    .map((catId) => {
      const category = categories.results.find((c) => c.id === catId);
      return category ? category.name : null;
    })
    .filter(Boolean); // remove nulls
};


  // Transform API data to match table structure product?.categories?.join(", ") || "N/A",
  const dataSource =
    data?.results?.map((product) => ({
      key: product?.id,
      images: product?.images?.length > 0 ? product.images[0].image : null,
      productName: product?.name || "N/A",
      productId: product?.prod_id || "N/A",
      category: getCategories(product).length > 0 ? getCategories(product).join(", ") : "N/A",
      price: parseFloat(product?.price1 || 0), // show price1, fallback 0
      stock: product?.is_stock
        ? product?.stock_quantity > 10
          ? "In Stock"
          : product?.stock_quantity > 0
          ? "Low Stock"
          : "Out of Stock"
        : "Out of Stock",
      status:
        product?.status === "approved"
          ? "Approved"
          : product?.status === "draft"
          ? "Draft"
          : product?.status === "active"
          ? "Active"
          : "Pending",
      originalData: product,
    })) || [];


  const handleDelete = async (keys) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteProduct(keys[0]); // fire delete request

        // Now refetch data
        const refreshed = await refetch();

        // Check if item is really deleted
        const stillExists = refreshed?.data?.some(
          (item) => item.id === keys[0]
        );

        if (!stillExists) {
          setSelectedRowKeys([]);
          message.success(`${keys.length} product(s) deleted.`);
          Swal.fire({
            title: "Deleted!",
            text: "Your product has been deleted.",
            icon: "success",
          });
        } else {
          message.error("Delete failed. Product still exists.");
        }
      } catch (error) {
        console.error(error);
        message.error("Failed to delete product.");
      }
    }
  };



  const handleBulkAction = (action) => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one row.");
      return;
    }

    if (action === "delete") {
      handleDelete(selectedRowKeys);
    } else if (action === "edit") {
      message.info("Bulk edit not implemented.");
    }
  };

const columns = [
  {
    title: "ID",
    dataIndex: "productId",
    key: "productId",
    render: (text) => <span className="popmed text-[16px]">{text}</span>,
  },
  {
    title: "Product Name",
    dataIndex: "productName",
    key: "productName",
    render: (_, record) => (
      <span className="popmed flex items-center gap-3 text-[16px]">
        <img
          className="w-7 h-7 rounded-full object-cover"
          src={record.images || "/fallback.png"}
          // alt={record.productName}
        />
        {record.productName}
      </span>
    ),
  },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <span className="text-sm">{text}</span>,
    },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
    render: (price) => <span>$ {price.toFixed(2)}</span>,
  },
  {
    title: "Stock",
    dataIndex: "stock",
    key: "stock",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <div className="flex items-center gap-3">
        <IoEyeOutline
          onClick={() => {
            setIsModalOpen(true);
            setSelected(record);
          }}
          className="text-gray-400 cursor-pointer"
          size={23}
        />
        <Link
          to="/vendor-dashboard/editproducts"
          state={{ productData: record.originalData }}
        >
          <FaEdit className="text-gray-400 cursor-pointer" size={20} />
        </Link>
        <MdDelete
          className="text-red-400 cursor-pointer"
          size={20}
          onClick={() => handleDelete([record.key])}
        />
      </div>
    ),
  },
];


  if (isLoading) return <p>Loading products...</p>;
  if (error) return <p>Error loading products</p>;

  return (
    <div className="bg-white p-4 rounded relative shadow-md">
      {/* Bulk Action Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Select
            placeholder="Bulk Actions"
            size="small"
            className="min-w-[110px]"
            onChange={handleBulkAction}
            suffixIcon={<RiArrowDropDownLine />}
          >
            <Option value="delete">All</Option>
            <Option value="delete">None</Option>
            <Option value="delete">Stock</Option>
            <Option value="delete">Out of Stock</Option>
            <Option value="delete">Low Stock</Option>
            <Option value="delete">Approved</Option>
            <Option value="delete">Reject</Option>
            <Option value="delete">Pending</Option>
          </Select>
          <span className="text-sm text-gray-500">
            {selectedRowKeys.length} selected
          </span>
        </div>
      </div>

      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
        }}
        columns={columns}
        dataSource={dataSource}
        className="relative"
        pagination={{
          pageSize,
          total: dataSource.length,
          showTotal: (total, range) =>
            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
          showSizeChanger: false,
          itemRender: (current, type, originalElement) => originalElement,
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
      <VProductsModal
        product={selected}
        setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
      />
    </div>
  );
};

export default VProductsTable;
