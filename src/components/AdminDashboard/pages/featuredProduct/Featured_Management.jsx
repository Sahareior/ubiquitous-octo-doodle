import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Image, 
  Switch, 
  Input, 
  Select, 
  Modal, 
  Card,
  Row,
  Col,
  Statistic,
  message,
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  EyeOutlined,
  StarFilled,
  ShoppingOutlined,
  DeleteOutlined
} from '@ant-design/icons';

import { useFeaturedProductToggelMutation, useGetAllProductsQuery } from '../../../../redux/slices/Apis/dashboardApis';

const { Search } = Input;
const { Option } = Select;

const Featured_Management = () => {
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { data, refetch, isLoading } = useGetAllProductsQuery();
  const [featuredProductToggel, { isLoading: toggleLoading }] = useFeaturedProductToggelMutation();

  const products = data?.results || [];



  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || 
                           (product.categories && product.categories.length > 0 ? 
                            product.categories[0].name === categoryFilter : false);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' ? product.is_active : !product.is_active);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories from products
  const categories = [...new Set(products
    .filter(product => product.categories && product.categories.length > 0)
    .map(product => product.categories[0].name)
  )];

  const handleFeatureToggle = async (productId, featured) => {
    try {
      // Use featuredProductToggel mutation with the correct data structure
      await featuredProductToggel({
        id: productId,
        data: { is_feature: featured }
      }).unwrap();
      
      message.success(`Product ${featured ? 'added to' : 'removed from'} featured successfully`);
      
      // Refetch products to get updated featured status
      refetch();
    } catch (error) {
      console.error('Error updating featured status:', error);
      message.error('Failed to update featured status');
    }
  };

  const handleView = (product) => {
    Modal.info({
      title: 'Product Details',
      width: 600,
      content: (
        <div style={{ marginTop: 20 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Image
                width="100%"
                src={product.images?.[0]?.image || 'https://via.placeholder.com/300'}
                alt={product.name}
                style={{ borderRadius: 8 }}
                fallback="https://via.placeholder.com/300"
              />
            </Col>
            <Col span={12}>
              <h3>{product.name}</h3>
              <p><strong>SKU:</strong> {product.sku}</p>
              <p><strong>Vendor:</strong> {product.vendor_details?.first_name} {product.vendor_details?.last_name}</p>
              <p><strong>Price:</strong> XAF {product.price1 || product.old_price}</p>
              <p><strong>Stock:</strong> {product.stock_quantity}</p>
              <p><strong>Rating:</strong> {product.average_rating || 'No ratings'} ⭐</p>
              <p><strong>Status:</strong> 
                <Tag color={product.status === 'approved' ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                  {product.status.toUpperCase()}
                </Tag>
              </p>
              <p><strong>Active:</strong> 
                <Tag color={product.is_active ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                  {product.is_active ? 'YES' : 'NO'}
                </Tag>
              </p>
              <p><strong>Featured:</strong> 
                <Tag color={product.featured ? 'blue' : 'default'} style={{ marginLeft: 8 }}>
                  {product.featured ? 'YES' : 'NO'}
                </Tag>
              </p>
            </Col>
          </Row>
          {product.short_description && (
            <div style={{ marginTop: 16 }}>
              <strong>Description:</strong>
              <p>{product.short_description}</p>
            </div>
          )}
        </div>
      ),
    });
  };

  const handleDelete = async (productId) => {
    try {
      // You might want to add a delete mutation here if needed
      message.success('Product deletion functionality would be implemented here');
    } catch (error) {
      message.error('Failed to delete product');
    }
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image
            width={50}
            height={50}
            src={record.images?.[0]?.image || 'https://via.placeholder.com/50'}
            alt={text}
            style={{ borderRadius: 8, objectFit: 'cover' }}
            fallback="https://via.placeholder.com/50"
          />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{text}</div>
            <div style={{ color: '#666', fontSize: 12 }}>SKU: {record.sku}</div>
            <div style={{ color: '#666', fontSize: 12 }}>
              {record.categories?.[0]?.name || 'No Category'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Vendor',
      key: 'vendor',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.vendor_details?.first_name} {record.vendor_details?.last_name}
          </div>
          <div style={{ color: '#666', fontSize: 12 }}>{record.vendor_details?.email}</div>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price1',
      key: 'price',
      width: 120,
      render: (price) => (
        <div style={{ fontWeight: 600, color: '#1890ff' }}>
          XAF {price || '0.00'}
        </div>
      ),
      sorter: (a, b) => (a.price1 || 0) - (b.price1 || 0),
    },
    {
      title: 'Stock',
      dataIndex: 'stock_quantity',
      key: 'stock',
      width: 100,
      render: (stock) => (
        <Tag color={stock > 0 ? 'green' : 'red'}>
          {stock || 0}
        </Tag>
      ),
      sorter: (a, b) => (a.stock_quantity || 0) - (b.stock_quantity || 0),
    },

    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'approved' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
          {status?.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Approved', value: 'approved' },
        { text: 'Pending', value: 'pending' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'YES' : 'NO'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
    {
      title: 'Featured',
      dataIndex: 'is_feature',
      key: 'is_feature',
      width: 100,
      render: (featured, record) => (
        <Switch
          checked={featured}
          onChange={(checked) => handleFeatureToggle(record.id, checked)}
          loading={toggleLoading}
          checkedChildren="Yes"
          unCheckedChildren="No"
        />
      ),
    },

  ];

  // Statistics
  const stats = {
    totalProducts: products.length,
    featuredProducts: products.filter(p => p.is_feature).length,
    activeProducts: products.filter(p => p.is_active).length,
    approvedProducts: products.filter(p => p.status === 'approved').length,
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 8, fontSize: 28, fontWeight: 700 }}>
          Featured Products Management
        </h1>
        <p style={{ color: '#666', fontSize: 16 }}>
          Manage featured products from your inventory
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={stats.totalProducts}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Featured Products"
              value={stats.featuredProducts}
              valueStyle={{ color: '#1890ff' }}
              prefix={<StarFilled />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Products"
              value={stats.activeProducts}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Approved Products"
              value={stats.approvedProducts}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Search
              placeholder="Search products by name or SKU..."
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Select
              placeholder="Filter by category"
              style={{ width: 200 }}
              value={categoryFilter}
              onChange={setCategoryFilter}
              allowClear
            >
              <Option value="all">All Categories</Option>
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
            <Select
              placeholder="Filter by status"
              style={{ width: 150 }}
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </div>
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => refetch()}
            size="large"
            loading={isLoading}
          >
            Refresh Products
          </Button>
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredProducts.map(product => ({ ...product, key: product.id }))}
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `Showing ${range[0]}-${range[1]} of ${total} products`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default Featured_Management;