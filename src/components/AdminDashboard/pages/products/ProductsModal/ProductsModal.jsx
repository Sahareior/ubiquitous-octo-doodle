import React, { useState } from 'react';
import { Button, Modal, Tabs, Tag, Image, Divider, Card, Row, Col, Statistic, Avatar, Badge } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  ShoppingOutlined,
  StarOutlined,
  DollarOutlined,
  TagOutlined,
  StockOutlined,
  CarOutlined,
  ShopOutlined,
  TeamOutlined,
  FileTextOutlined,
  EyeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useAcceptProductsMutation, useGetAllProductsQuery, useRejectProductsMutation } from '../../../../../redux/slices/Apis/dashboardApis';
import Swal from 'sweetalert2';
import { FaShoppingBag } from 'react-icons/fa';
import { FaCar } from 'react-icons/fa6';

const { TabPane } = Tabs;

const ProductsModal = ({ isModalOpen, setIsModalOpen, productData, path }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [acceptProducts] = useAcceptProductsMutation();
  const [rejectProducts] = useRejectProductsMutation();
  const { refetch } = useGetAllProductsQuery();
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleApprove = async () => {
    if (!productData) return;

    const payload = {
      categories: productData?.categories?.length ? productData.categories.map(c => c.id) : [0],
      tags: productData?.tags?.length ? productData.tags.map(t => t.id) : [0],
      seo: productData?.seo || 0,
      name: productData?.name || 'string',
      sku: productData?.sku || 'string',
      short_description: productData?.short_description || 'string',
      full_description: productData?.full_description || 'string',
      price1: productData?.price1?.toString() || '0',
      price2: productData?.price2?.toString() || '0',
      price3: productData?.price3?.toString() || '0',
      option1: productData?.option1 || '',
      option2: productData?.option2 || '',
      option3: productData?.option3 || '',
      option4: productData?.option4 || '',
      is_stock: productData?.is_stock,
      stock_quantity: productData?.stock_quantity || 0,
      home_delivery: productData?.home_delivery,
      pickup: productData?.pickup,
      partner_delivery: productData?.partner_delivery,
      is_approve: true,
      estimated_delivery_days: productData?.estimated_delivery_days || 0,
    };

    try {
      await acceptProducts({ id: productData?.id, data: payload }).unwrap();
      
      Swal.fire({
        title: "Approved!",
        text: `${productData?.name} has been approved successfully.`,
        icon: "success",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK"
      });
      refetch();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error approving product:', err);
      Swal.fire({
        title: "Error!",
        text: "Something went wrong while approving the product.",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "Close"
      });
    }
  };

  const handleReject = async () => {
    if (!productData) return;

    const payload = {
      categories: productData?.categories?.length ? productData.categories.map(c => c.id) : [0],
      tags: productData?.tags?.length ? productData.tags.map(t => t.id) : [0],
      seo: productData?.seo || 0,
      name: productData?.name || 'string',
      sku: productData?.sku || 'string',
      short_description: productData?.short_description || 'string',
      full_description: productData?.full_description || 'string',
      price1: productData?.price1?.toString() || '0',
      price2: productData?.price2?.toString() || '0',
      price3: productData?.price3?.toString() || '0',
      option1: productData?.option1 || '',
      option2: productData?.option2 || '',
      option3: productData?.option3 || '',
      option4: productData?.option4 || '',
      is_stock: productData?.is_stock,
      stock_quantity: productData?.stock_quantity || 0,
      home_delivery: productData?.home_delivery,
      pickup: productData?.pickup,
      partner_delivery: productData?.partner_delivery,
      is_approve: false,
      estimated_delivery_days: productData?.estimated_delivery_days || 0,
    };

    try {
      await rejectProducts({ id: productData?.id, data: payload }).unwrap();
      
      Swal.fire({
        title: "Rejected!",
        text: `${productData?.name} has been rejected successfully.`,
        icon: "success",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK"
      });
      refetch();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error rejecting product:', err);
      Swal.fire({
        title: "Error!",
        text: "Something went wrong while rejecting the product.",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "Close"
      });
    }
  };

  const handleCancel = () => setIsModalOpen(false);

  const renderStatusTag = (status) => {
    let color, text, bgColor;
    switch (status) {
      case 'approved':
        color = 'text-green-800';
        bgColor = 'bg-green-100';
        text = 'Approved';
        break;
      case 'pending':
        color = 'text-amber-800';
        bgColor = 'bg-amber-100';
        text = 'Pending Review';
        break;
      case 'rejected':
        color = 'text-red-800';
        bgColor = 'bg-red-100';
        text = 'Rejected';
        break;
      default:
        color = 'text-gray-800';
        bgColor = 'bg-gray-100';
        text = status;
    }
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${color}`}>
        {text}
      </span>
    );
  };

  const DeliveryOptionCard = ({ title, price, icon, color }) => {
    const colorClasses = {
      green: 'bg-green-50 border-green-200 text-green-700',
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700',
      gray: 'bg-gray-50 border-gray-200 text-gray-700'
    };
    
    const iconColors = {
      green: 'text-green-500',
      blue: 'text-blue-500',
      purple: 'text-purple-500',
      gray: 'text-gray-500'
    };
    
    return (
      <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
        <div className={`text-2xl mb-3 ${iconColors[color]}`}>{icon}</div>
        <h4 className="font-medium mb-1">{title}</h4>
        <p className="font-semibold text-lg">{price} XAF</p>
      </div>
    );
  };

  const openImagePreview = (index) => {
    setCurrentImageIndex(index);
    setImagePreviewVisible(true);
  };


  // console.log(productData,'this is productData')

  return (
    <Modal
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={1200}
      className="rounded-lg overflow-hidden"
      style={{ top: 20 }}
      bodyStyle={{ padding: 0 }}
    >
<div className='h-[80vh] overflow-y-auto'>
        {/* Header with status and actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 pt-8 border-b">
        <div className="flex justify-between w-full items-center">
          <div className='flex justify-between w-full'>
            <h2 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <FaShoppingBag className="text-yellow-500 " />
              Product Details
            </h2>
            <div className="flex mt-2 items-center gap-3">
              {renderStatusTag(productData?.status)}
              <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded">
                ID: {productData?.prod_id}
              </span>
              <span className="text-gray-500 text-sm">
                Added: {productData?.created_at ? new Date(productData.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
          
         
        </div>
      </div>

      <div className="px-6 pt-4">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          className="product-tabs"
          tabBarStyle={{ marginBottom: 0 }}
        >
          <TabPane 
            tab={
              <span className="flex items-center popmed gap-2">
                <EyeOutlined />
                Overview
              </span>
            } 
            key="overview"
          >
            <div className="py-4">
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={10}>
                  {/* Product Image */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    {productData?.images?.length > 0 ? (
                      <div className="relative">
                       <Image
  src={productData.images[0].image}
  alt={productData.name}
  width="100%"
  height={256} // h-64 = 16rem = 256px
  style={{ objectFit: "cover", borderTopLeftRadius: "0.5rem", borderTopRightRadius: "0.5rem" }}
  preview={false}
  onClick={() => openImagePreview(0)}
/>

                        <div className="absolute top-2 right-2">
                          <Button 
                            type="primary" 
                            size="small" 
                            icon={<EyeOutlined />}
                            onClick={() => openImagePreview(0)}
                            className="bg-blue-500 border-0 opacity-90"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 bg-gray-100 flex items-center justify-center rounded-lg">
                        <div className="text-gray-400 text-lg">No image available</div>
                      </div>
                    )}
                    
                    {/* Thumbnails */}
                    {productData?.images?.length > 1 && (
                      <div className="p-4 bg-gray-50 border-t">
                        <h4 className="font-medium text-gray-700 mb-2">Additional Images</h4>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {productData.images.map((img, index) => (
                            <div 
                              key={index} 
                              className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden cursor-pointer border border-gray-200 hover:border-blue-400 transition-all"
                              onClick={() => openImagePreview(index)}
                            >
                              <Image 
                            preview={false}
                                src={img.image} 
                                alt={`${productData.name} ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vendor Information */}
                  {productData?.vendor_details && (
                    <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <UserOutlined className="text-blue-500" />
                        Vendor Information
                      </h3>
                      <div className="flex items-center gap-3">
                        <Avatar 
                          size="large" 
                          icon={<UserOutlined />} 
                          src={productData.vendor_details.profile_picture}
                          className="bg-blue-100"
                        />
                        <div>
                          <div className="font-medium">{productData.vendor_details.email}</div>
                          <div className="text-sm text-gray-500">
                            {productData.vendor_details.first_name} {productData.vendor_details.last_name}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Col>
                
                <Col xs={24} lg={14}>
                  <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">{productData?.name}</h3>
                      <Badge 
                        count={productData?.is_stock ? 'In Stock' : 'Out of Stock'} 
                        color={productData?.is_stock ? 'green' : 'red'} 
                        className="font-medium"
                      />
                    </div>
                    
                    <p className="text-gray-600 mb-6">{productData?.short_description}</p>
                    
                    <Divider className="my-4" />
                    
                    <Row gutter={[16, 16]} className="mb-6">
                      <Col xs={12} sm={8}>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <div className="text-blue-500 text-sm font-medium mb-1">Regular Price</div>
                          <div className="text-xl font-bold text-blue-700">
                            {productData?.price1 ? `${productData.price1} XAF` : 'N/A'}
                          </div>
                        </div>
                      </Col>
                      <Col xs={12} sm={8}>
                        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                          <div className="text-green-500 text-sm font-medium mb-1">Discount Price</div>
                          <div className="text-xl font-bold text-green-700">
                            {productData?.price2 ? `${productData.price2} XAF` : 'N/A'}
                          </div>
                        </div>
                      </Col>
                      <Col xs={12} sm={8}>
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                          <div className="text-amber-500 text-sm font-medium mb-1">Rating</div>
                          <div className="flex items-center gap-1">
                            <StarOutlined className="text-amber-500" />
                            <span className="text-xl font-bold text-amber-700">
                              {productData?.average_rating || 0}/5
                            </span>
                          </div>
                        </div>
                      </Col>
                      <Col xs={12} sm={8}>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div className="text-gray-500 text-sm font-medium mb-1">SKU</div>
                          <div className="text-lg font-semibold text-gray-800">
                            {productData?.sku || 'N/A'}
                          </div>
                        </div>
                      </Col>
                      <Col xs={12} sm={8}>
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                          <div className="text-purple-500 text-sm font-medium mb-1">Stock Quantity</div>
                          <div className="text-lg font-semibold text-purple-700">
                            {productData?.stock_quantity || 0}
                          </div>
                        </div>
                      </Col>
                      <Col xs={12} sm={8}>
                        <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-100">
                          <div className="text-cyan-500 text-sm font-medium mb-1">Delivery Days</div>
                          <div className="text-lg font-semibold text-cyan-700">
                            {productData?.estimated_delivery_days || 0} days
                          </div>
                        </div>
                      </Col>
                    </Row>
                    
                    <Divider className="my-4" />
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <InfoCircleOutlined className="text-gray-500" />
                        Full Description
                      </h4>
                      <p className="text-gray-600 leading-relaxed">{productData?.full_description || 'No description available.'}</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </TabPane>
          
          <TabPane 
            tab={
              <span className="flex items-center popmed gap-2">
                <FileTextOutlined />
                Specifications
              </span>
            } 
            key="specifications"
          >
            <div className="py-4">
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Product Specifications</h3>
                {productData?.specifications && Object.keys(productData.specifications).filter(key => productData.specifications[key]).length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {Object.entries(productData.specifications).map(([key, value]) => (
                      value && (
                        <Col xs={24} sm={12} md={8} key={key}>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="text-sm popbold text-emerald-500 capitalize mb-1">
                              {key.replace(/_/g, ' ')}
                            </div>
                            <div className="text-gray-800 font-semibold">
                              {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value || 'N/A'}
                            </div>
                          </div>
                        </Col>
                      )
                    ))}
                  </Row>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No specifications available for this product.
                  </div>
                )}
              </div>
            </div>
          </TabPane>
          
          <TabPane 
            tab={
              <span className="flex items-center popmed gap-2">
                <CarOutlined />
                Delivery Options
              </span>
            } 
            key="delivery"
          >
            <div className="py-4">
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Delivery Methods & Pricing</h3>
                
                {(!productData?.option1 && !productData?.option2 && !productData?.option3) ? (
                  <div className="text-center py-8 text-gray-500">
                    No delivery options available for this product.
                  </div>
                ) : (
                  <Row gutter={[16, 16]}>
                    {productData?.option1 && (
                      <Col xs={24} sm={12} md={8}>
                        <DeliveryOptionCard
                          title="Home Delivery"
                          price={productData.option1}
                          icon={<CarOutlined 
                          style={{
                            color: 'red'
                          }}
                          />}
                          color="green"
                        />
                      </Col>
                    )}
                    
                    { productData?.option2 && (
                      <Col xs={24} sm={12} md={8}>
                        <DeliveryOptionCard
                          title="Store Pickup"
                          price={productData.option2}
                          icon={<ShopOutlined 
                          style={{
                            color: 'red'
                          }}
                          />}
                          color="blue"
                        />
                      </Col>
                    )}
                    
                    {productData?.option3 && (
                      <Col xs={24} sm={12} md={8}>
                        <DeliveryOptionCard
                          title="Partner Delivery"
                          price={productData.option3}
                          icon={<TeamOutlined 
                          style={{
                            color: 'red'
                          }}
                          />}
                          color="purple"
                        />
                      </Col>
                    )}
                    
                    {productData?.option4 && (
                      <Col xs={24} sm={12} md={8}>
                        <DeliveryOptionCard
                          title="Additional Option"
                          price={productData.option4}
                          icon={<FaCar className='text-red-600' />}
                          color="red"
                        />
                      </Col>
                    )}
                  </Row>
                )}
                
                {productData?.estimated_delivery_days && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-1">Estimated Delivery Time</h4>
                    <p className="text-blue-600">{productData.estimated_delivery_days} business days</p>
                  </div>
                )}
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>

      {/* Image Preview Modal */}
      <Modal
        open={imagePreviewVisible}
        onCancel={() => setImagePreviewVisible(false)}
        footer={null}
        width="30vw"
        bodyStyle={{ padding: 0 }}
        className="image-preview-modal"
      >
        {productData?.images?.length > 0 && (
          <div className="relative">
            <Image
              src={productData.images[currentImageIndex].image}
              alt={productData.name}
              className="w-full"
              preview={false}
            />
            <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
              {currentImageIndex + 1} of {productData.images.length}
            </div>
            {productData.images.length > 1 && (
              <>
                <Button 
                  className="absolute left-2 top-1/2 transform -translate-y-1/2"
                  icon={<span>&#10094;</span>}
                  onClick={() => setCurrentImageIndex((currentImageIndex - 1 + productData.images.length) % productData.images.length)}
                  disabled={currentImageIndex === 0}
                />
                <Button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  icon={<span>&#10095;</span>}
                  onClick={() => setCurrentImageIndex((currentImageIndex + 1) % productData.images.length)}
                  disabled={currentImageIndex === productData.images.length - 1}
                />
              </>
            )}
          </div>
        )}
      </Modal>
      <div className='pb-9 flex justify-end pr-7 items-center'>
         {productData?.status === 'pending' && !path && (
            <div className="flex gap-3">
              <Button 
                onClick={handleApprove}
            
                size="large"
                className="bg-yellow-500 hover:bg-green-600 text-white border-0 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 h-11 px-4"
              >
                Approve Product
              </Button>
              <Button 
                onClick={handleReject}
            
                size="large"
                className="bg-red-400 hover:bg-red-600 text-white border-0 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 h-11 px-4"
              >
                Reject Product
              </Button>
            </div>
          )}
      </div>

</div>
    </Modal>
  );
};

export default ProductsModal;