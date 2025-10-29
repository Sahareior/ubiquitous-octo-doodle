import React, { useState } from 'react';
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
  Form, 
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  EyeOutlined,
  StarFilled,
  ShoppingOutlined,
  DollarOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

const Featured_Management = () => {
  const [products, setProducts] = useState([
    {
      key: '1',
      id: 1,
      name: 'Modern Luxury Sofa',
      category: 'Living Room',
      price: 1299.99,
      originalPrice: 1899.99,
      discount: 32,
      rating: 4.8,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150',
      status: 'active',
      featured: true,
      stock: 45,
      sales: 89,
      createdAt: '2024-01-15',
    },
    {
      key: '2',
      id: 2,
      name: 'Minimalist Dining Table',
      category: 'Dining Room',
      price: 799.99,
      originalPrice: 999.99,
      discount: 20,
      rating: 4.5,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150',
      status: 'active',
      featured: true,
      stock: 23,
      sales: 67,
      createdAt: '2024-01-20',
    },
    {
      key: '3',
      id: 3,
      name: 'Queen Size Bed Frame',
      category: 'Bedroom',
      price: 899.99,
      originalPrice: 1299.99,
      discount: 31,
      rating: 4.7,
      reviews: 203,
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=150',
      status: 'inactive',
      featured: false,
      stock: 12,
      sales: 134,
      createdAt: '2024-01-10',
    },
    {
      key: '4',
      id: 4,
      name: 'Designer Coffee Table',
      category: 'Living Room',
      price: 349.99,
      originalPrice: 499.99,
      discount: 30,
      rating: 4.3,
      reviews: 67,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150',
      status: 'active',
      featured: true,
      stock: 34,
      sales: 45,
      createdAt: '2024-01-25',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [form] = Form.useForm();

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

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
            src={record.image}
            alt={text}
            style={{ borderRadius: 8, objectFit: 'cover' }}
            fallback="https://via.placeholder.com/50"
          />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{text}</div>
            <div style={{ color: '#666', fontSize: 12 }}>{record.category}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      render: (price, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1890ff' }}>${price}</div>
          <div style={{ textDecoration: 'line-through', color: '#999', fontSize: 12 }}>
            ${record.originalPrice}
          </div>
        </div>
      ),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
      width: 100,
      render: (discount) => (
        <Tag color="red" style={{ margin: 0 }}>
          -{discount}%
        </Tag>
      ),
      sorter: (a, b) => a.discount - b.discount,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 120,
      render: (rating, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <StarFilled style={{ color: '#faad14' }} />
          <span>{rating}</span>
          <span style={{ color: '#999', fontSize: 12 }}>({record.reviews})</span>
        </div>
      ),
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: 'Stock & Sales',
      key: 'stock',
      width: 150,
      render: (_, record) => (
        <div>
          <div>Stock: {record.stock}</div>
          <div style={{ color: '#52c41a', fontSize: 12 }}>Sales: {record.sales}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Featured',
      dataIndex: 'featured',
      key: 'featured',
      width: 100,
      render: (featured, record) => (
        <Switch
          checked={featured}
          onChange={(checked) => handleFeatureToggle(record.key, checked)}
          checkedChildren="Yes"
          unCheckedChildren="No"
        />
      ),
    },

  ];

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsModalVisible(true);
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
                src={product.image}
                alt={product.name}
                style={{ borderRadius: 8 }}
              />
            </Col>
            <Col span={12}>
              <h3>{product.name}</h3>
              <p><strong>Category:</strong> {product.category}</p>
              <p><strong>Price:</strong> ${product.price}</p>
              <p><strong>Original Price:</strong> ${product.originalPrice}</p>
              <p><strong>Discount:</strong> {product.discount}%</p>
              <p><strong>Rating:</strong> {product.rating} ⭐ ({product.reviews} reviews)</p>
              <p><strong>Stock:</strong> {product.stock}</p>
              <p><strong>Sales:</strong> {product.sales}</p>
              <p><strong>Status:</strong> 
                <Tag color={product.status === 'active' ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                  {product.status.toUpperCase()}
                </Tag>
              </p>
            </Col>
          </Row>
        </div>
      ),
    });
  };

  const handleDelete = (key) => {
    setProducts(products.filter(product => product.key !== key));
    message.success('Product deleted successfully');
  };

  const handleFeatureToggle = (key, featured) => {
    setProducts(products.map(product => 
      product.key === key ? { ...product, featured } : product
    ));
    message.success(`Product ${featured ? 'added to' : 'removed from'} featured`);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      setLoading(true);
      
      setTimeout(() => {
        if (editingProduct) {
          // Update existing product
          setProducts(products.map(product =>
            product.key === editingProduct.key 
              ? { ...editingProduct, ...values }
              : product
          ));
          message.success('Product updated successfully');
        } else {
          // Add new product
          const newProduct = {
            key: Date.now().toString(),
            id: Date.now(),
            ...values,
            reviews: 0,
            sales: 0,
            createdAt: new Date().toISOString().split('T')[0],
          };
          setProducts([...products, newProduct]);
          message.success('Product added successfully');
        }
        
        setLoading(false);
        setIsModalVisible(false);
        form.resetFields();
      }, 1000);
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Statistics
  const stats = {
    totalProducts: products.length,
    featuredProducts: products.filter(p => p.featured).length,
    activeProducts: products.filter(p => p.status === 'active').length,
    totalSales: products.reduce((sum, p) => sum + p.sales, 0),
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 8, fontSize: 28, fontWeight: 700 }}>
          Featured Products Management
        </h1>
 
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

      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Search
              placeholder="Search products..."
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
              <Option value="Living Room">Living Room</Option>
              <Option value="Bedroom">Bedroom</Option>
              <Option value="Dining Room">Dining Room</Option>
              <Option value="Kitchen">Kitchen</Option>
              <Option value="Office">Office</Option>
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
            onClick={handleAdd}
            size="large"
          >
            Add Product
          </Button>
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredProducts}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `Showing ${range[0]}-${range[1]} of ${total} products`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Add/Edit Product Modal */}
      <Modal
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          name="productForm"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Product Name"
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  <Option value="Living Room">Living Room</Option>
                  <Option value="Bedroom">Bedroom</Option>
                  <Option value="Dining Room">Dining Room</Option>
                  <Option value="Kitchen">Kitchen</Option>
                  <Option value="Office">Office</Option>
                  <Option value="Outdoor">Outdoor</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Price ($)"
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <Input type="number" placeholder="0.00" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="originalPrice"
                label="Original Price ($)"
                rules={[{ required: true, message: 'Please enter original price' }]}
              >
                <Input type="number" placeholder="0.00" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="discount"
                label="Discount (%)"
                rules={[{ required: true, message: 'Please enter discount' }]}
              >
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="rating"
                label="Rating"
                rules={[{ required: true, message: 'Please enter rating' }]}
              >
                <Input type="number" step="0.1" min="0" max="5" placeholder="4.5" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="stock"
                label="Stock"
                rules={[{ required: true, message: 'Please enter stock quantity' }]}
              >
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="image"
            label="Image URL"
            rules={[{ required: true, message: 'Please enter image URL' }]}
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Featured_Management;