import React, { useState, useEffect } from 'react';
import { Table, Select, message } from 'antd';
import { IoEyeOutline } from 'react-icons/io5';
import { MdDelete } from 'react-icons/md';
import { RiArrowDropDownLine } from 'react-icons/ri';
import { FaEdit } from 'react-icons/fa';
import ProductsModal from './ProductsModal/ProductsModal';
import Swal from 'sweetalert2';
import { useDeleteProductMutation } from '../../../../redux/slices/Apis/vendorsApi';
import { Link } from 'react-router-dom';

const { Option } = Select;

const ProductsTable = ({ products }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [selected, setSelected] = useState({});
  const [deleteProduct] = useDeleteProductMutation();

  // Map API products to table format
  useEffect(() => {
    if (products?.results) {
      const mappedData = products.results.map((p) => ({
        key: p.id,
        productId: p.prod_id,
        productName: p.name,
        category: p.categories?.length ? p.categories.join(', ') : '—',
        approval: p.is_approve ? 'Approved' : 'Not Approved',
        price: parseFloat(p.active_price || 0),
        stock: p.is_stock ? `In Stock (${p.stock_quantity})` : 'Out of Stock',
        status:
          p.status === 'approved'
            ? 'Active'
            : p.status === 'active'
            ? 'Active'
            : p.status === 'draft'
            ? 'Draft'
            : 'Pending',
      }));
      setDataSource(mappedData);
    }
  }, [products]);

  // 🔥 Reusable Delete with Swal2
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
        const res = await deleteProduct(keys[0]); // don’t unwrap yet
        console.log('this is deleted response', res)

        if (res?.data?.status === 200 || res?.status === 200) {
          Swal.fire('Deleted!', 'Product has been removed.', 'success');
          setDataSource((prev) =>
            prev.filter((item) => !keys.includes(item.key))
          );
          setSelectedRowKeys([]);
        } else {
          Swal.fire('Error!', 'Failed to delete product.', 'error');
        }
      } catch (error) {
        Swal.fire('Error!', 'Server error occurred.', 'error');
      }
    }
  });
};


  const handleBulkAction = (action) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one product.');
      return;
    }

    if (action === 'delete') {
      handleDelete(selectedRowKeys);
    } else {
      message.info('Bulk action not implemented.');
    }
  };

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
      render: (text) => (
        <span className="flex items-center gap-3 text-sm font-medium">
          <img
            className="w-7 h-7 rounded-full object-cover"
            src="https://plus.unsplash.com/premium_photo-1661964014750-963a28aeddea?q=80&w=1170&auto=format&fit=crop"
            alt="product"
          />
          {text}
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
      title: 'Approval',
      dataIndex: 'approval',
      key: 'approval',
      render: (text) => (
        <span
          className={`px-2 py-1 text-xs rounded ${
            text === 'Approved'
              ? 'bg-green-100 text-green-600'
              : 'bg-red-100 text-red-600'
          }`}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span className="text-sm font-semibold">${price.toFixed(2)}</span>,
    },
    {
      title: 'Availability',
      dataIndex: 'stock',
      key: 'stock',
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const statusColor = {
          Active: 'bg-green-100 text-green-600',
          Pending: 'bg-yellow-100 text-yellow-600',
          Draft: 'bg-red-100 text-red-600',
        };

        return (
          <Select
            value={status}
            size="small"
            onChange={(value) => {
              const newData = dataSource.map((item) =>
                item.key === record.key ? { ...item, status: value } : item
              );
              setDataSource(newData);
              message.success(`Status updated to ${value}`);
            }}
            bordered={false}
            dropdownMatchSelectWidth={false}
            className={`w-[110px] px-2 py-1 text-xs font-medium rounded ${statusColor[status]}`}
            suffixIcon={<RiArrowDropDownLine className="text-[16px] text-gray-600" />}
          >
            <Option value="Active">Active</Option>
            <Option value="Pending">Pending</Option>
            <Option value="Draft">Draft</Option>
          </Select>
        );
      },
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <div className="flex items-center gap-6">
          <IoEyeOutline
            onClick={() => {
              setIsModalOpen(true);
              setSelected(record);
            }}
            className="text-gray-500 hover:text-blue-500 cursor-pointer"
            size={20}
          />
              <Link className='block' to='/admin-dashboard/editAdminProducts' state={{productData:record}}>
          <FaEdit className="text-gray-400 cursor-pointer" size={20}/>
          </Link>
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
            className="min-w-[140px]"
            onChange={handleBulkAction}
            suffixIcon={<RiArrowDropDownLine />}
          >
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
          showTotal: (total, range) =>
            `Showing ${range[0]} to ${range[1]} of ${total} products`,
          showSizeChanger: false,
          position: ['bottomRight'],
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
        setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
        productData={selected}
      />
    </div>
  );
};

export default ProductsTable;
