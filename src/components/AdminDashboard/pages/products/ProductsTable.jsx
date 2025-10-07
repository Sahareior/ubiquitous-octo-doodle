import React, { useState, useEffect } from 'react';
import { Table, Select, message } from 'antd';
import { IoEyeOutline } from 'react-icons/io5';
import { MdDelete } from 'react-icons/md';
import { RiArrowDropDownLine } from 'react-icons/ri';
import { FaEdit } from 'react-icons/fa';
import ProductsModal from './ProductsModal/ProductsModal';
import Swal from 'sweetalert2';
import { useDeleteProductMutation, useGetCategoriesQuery } from '../../../../redux/slices/Apis/vendorsApi';
import { Link } from 'react-router-dom';
import { useBulkProductDeleteMutation, useBulkProductStatusMutation, useGetAllProductsQuery } from '../../../../redux/slices/Apis/dashboardApis';

const { Option } = Select;

const ProductsTable = ({ products,path }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [selected, setSelected] = useState({});
  const [deleteProduct] = useDeleteProductMutation();
     const {data:categories} = useGetCategoriesQuery()
     const [bulkAction, setBulkAction] = useState(undefined); // NEW
      const { data,refetch } = useGetAllProductsQuery();
     const [bulkProductStatus] = useBulkProductStatusMutation()
     const [bulkProductDelete] = useBulkProductDeleteMutation()

  // Map API products to table format


  const getCategories = (categorie) => {
  if (!categorie?.categories || !categories?.results) return [];

  const catNames = categorie.categories.map(catId => {
    const category = categories.results.find(c => c.id === catId);
    return category ? category.name : null;
  }).filter(Boolean); // remove any nulls

  return catNames;
};
// Map API products to table format
useEffect(() => {
  if (!products) return;

  // If products is an object with results, use results; otherwise, assume it's an array
  const productArray = products.results ? products.results : products;

const mappedData = productArray.map((p) => ({
  key: p.id,
  productId: p.prod_id,
  productName: p.name,
  category: getCategories(p).join(", "),
  approval: p.is_approve ? 'Approved' : 'Not Approved',
  price: parseFloat(p.active_price || p.price1 || 0),
  stock: p.is_stock ? `In Stock (${p.stock_quantity})` : 'Out of Stock',
  status:
    p.status === 'approved'
      ? 'Active'
      : p.status === 'active'
      ? 'Active'
      : p.status === 'draft'
      ? 'Draft'
      : 'Pending',
  fullData: p,
  productImage: p.images && p.images.length > 0 ? p.images[0].image : null, // ✅ first image
}));


  setDataSource(mappedData);
}, [products, categories]);


// 🗑 Bulk delete products
// Bulk delete
const handleBulkDelete = async () => {
  Swal.fire({
    title: 'Are you sure?',
    text: `Delete ${selectedRowKeys.length} selected product(s)?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete them!',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await bulkProductDelete({ product_ids: selectedRowKeys }).unwrap();

        Swal.fire('Deleted!', 'Selected products have been removed.', 'success');

        // update UI
        setDataSource((prev) =>
          prev.filter((item) => !selectedRowKeys.includes(item.key))
        );
        setSelectedRowKeys([]);
        setBulkAction(undefined); // ✅ reset dropdown
      } catch (error) {
        console.error('Bulk delete failed:', error);
        Swal.fire('Error!', 'Failed to delete selected products.', 'error');
        setBulkAction(undefined); // ✅ also reset on error
      }
    } else {
      setBulkAction(undefined); // ✅ reset if cancelled
    }
  });
};

const handleBulkAction = async (action) => {
  if (selectedRowKeys.length === 0) {
    message.warning('Please select at least one product.');
    setBulkAction(undefined); // ✅ reset immediately if no selection
    return;
  }

  if (action === 'delete') {
    handleBulkDelete();
    return;
  }

  try {
    await bulkProductStatus({
      product_ids: selectedRowKeys,
      status: action,
    }).unwrap();

    message.success(`Updated ${selectedRowKeys.length} product(s) to "${action}".`);

    setDataSource((prev) =>
      prev.map((item) =>
        selectedRowKeys.includes(item.key)
          ? { ...item, status: action.charAt(0).toUpperCase() + action.slice(1) }
          : item
      )
    );

    setSelectedRowKeys([]);
    setBulkAction(undefined); // ✅ reset dropdown
  } catch (error) {
    console.error("Bulk update failed:", error);
    message.error("Failed to update products. Try again.");
    setBulkAction(undefined); // ✅ reset on error
  }
};






const handleDelete = async (keys) => {
  if (!keys || keys.length === 0) return;

  Swal.fire({
    title: 'Are you sure?',
    text: "This action cannot be undone!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    customClass: {
      popup: 'rounded-2xl shadow-lg',
      confirmButton: 'px-4 py-2 rounded-lg',
      cancelButton: 'px-4 py-2 rounded-lg',
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await deleteProduct(keys[0]);

        if (res?.error?.data) {
          Swal.fire('Error', res.error.data[0], 'error');
        } else {
          Swal.fire('Deleted!', 'Product has been removed.', 'success');
          refetch();
        }

      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire('Error!', 'Server error occurred.', 'error');
      }
    }
  });
};



  // console.log('selected, ' , selected)

  const columns = [
    {
      title: 'Product ID',
      dataIndex: 'productId',
      key: 'productId',
      render: (text) => <span className="text-sm font-medium">{text}</span>,
    },
{
  title: 'Product Name',
  dataIndex: 'productName',
  key: 'productName',
  render: (text, record) => (
    <span className="flex items-center gap-3 text-sm font-medium">
      <img
        className="w-16 h-16 rounded-md object-cover border border-gray-200 shadow-sm"
        src={
          record.productImage ||
          "https://via.placeholder.com/150?text=No+Image"
        }
        alt={text}
      />
      {text}
    </span>
  ),
},
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <span className="text-sm popreg">{text}</span>,
    },

    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span className="text-sm font-semibold poopreg">${price.toFixed(2)} XAF</span>,
    },
    {
      title: 'Availability',
      dataIndex: 'stock',
      key: 'stock',
      render: (text) => <span className="text-sm popreg">{text}</span>,
    },
        {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => <span className="text-sm popreg">{text}</span>,
    },
    // {
    //   title: 'Status',
    //   dataIndex: 'status',
    //   key: 'status',
    //   render: (status, record) => {
    //     const statusColor = {
    //       Active: 'bg-green-100 text-green-600',
    //       Pending: 'bg-yellow-100 text-yellow-600',
    //       Draft: 'bg-red-100 text-red-600',
    //     };

    //     return (
    //       <Select
    //         value={status}
    //         size="small"
    //         onChange={(value) => {
    //           const newData = dataSource.map((item) =>
    //             item.key === record.key ? { ...item, status: value } : item
    //           );
    //           setDataSource(newData);
    //           message.success(`Status updated to ${value}`);
    //         }}
    //         bordered={false}
    //         dropdownMatchSelectWidth={false}
    //         className={`w-[110px] px-2 py-1 text-xs font-medium rounded ${statusColor[status]}`}
    //         suffixIcon={<RiArrowDropDownLine className="text-[16px] text-gray-600" />}
    //       >
    //         <Option value="Active">Active</Option>
    //         <Option value="Pending">Pending</Option>
    //         <Option value="Draft">Draft</Option>
    //       </Select>
    //     );
    //   },
    // },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <div className="flex items-center gap-6">
<IoEyeOutline
  onClick={() => {
    setIsModalOpen(true);
    setSelected(record.fullData); // ✅ pass full API product
  }}
  className="text-gray-500 hover:text-blue-500 cursor-pointer"
  size={20}
/>

{
  path === '/vendor-dashboard/vendor-products' ? <Link
  className="block"
  to="/vendor-dashboard/editproducts"
  state={{ productData: record.fullData }} // ✅ full API product
>
  <FaEdit className="text-gray-400 cursor-pointer" size={20} />
</Link>:
<Link
  className="block"
  to="/admin-dashboard/editAdminProducts"
  state={{ productData: record.fullData }} // ✅ full API product
>
  <FaEdit className="text-gray-400 cursor-pointer" size={20} />
</Link>
}
          <MdDelete
            className="text-red-500 hover:text-red-600 cursor-pointer"
            size={20}
            onClick={() => handleDelete([record.key])}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {/* Bulk Action Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
<Select
  placeholder="Bulk Actions"
  size="small"
  className="min-w-[180px]"
  value={bulkAction} // ✅ controlled value
  onChange={(val) => {
    setBulkAction(val);
    handleBulkAction(val);
  }}
  suffixIcon={<RiArrowDropDownLine />}
>
  <Option value="approved">Mark as Approved</Option>
  <Option value="pending">Mark as Pending</Option>
  <Option value="draft">Mark as Draft</Option>
  <Option value="rejected">Mark as Rejected</Option>
  <Option value="active">Mark as Active</Option>
  <Option value="inactive">Mark as Inactive</Option>
  <Option value="archived">Mark as Archived</Option>
  <Option value="delete">Delete Selected</Option>
</Select>

          <span className="text-sm text-gray-500">{selectedRowKeys.length} selected</span>
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
    showSizeChanger: false,
    position: ['bottomRight'],
    showQuickJumper: true,        // 🔥 allows jumping to a page
    showLessItems: false,         // 🔥 ensures more buttons are visible
    showTotal: (total, range) => 
      `Showing ${range[0]} to ${range[1]} of ${total} products`,
  }}
  footer={() => (
    <div className="flex justify-between items-center px-2">
      <div className="flex items-center gap-2 text-sm">
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


      <ProductsModal
      path={path}
        setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
        productData={selected}
      />
    </div>
  );
};

export default ProductsTable;
