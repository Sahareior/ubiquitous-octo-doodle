import React, { useState, useMemo, useCallback } from "react";
import {
  Modal,
  Button,
  Tag,
  Divider,
  Card,
  Avatar,
  Space,
  Rate,
  Image,
  List,
  Tabs,
  Row,
  Col,
  Statistic,
  Progress,
  Spin,
  Alert
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  StarOutlined,
  CalendarOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { useAcceptProductsMutation, useRejectProductsMutation } from "../../../../redux/slices/Apis/dashboardApis";
import Swal from "sweetalert2";
import { useGetAllProductsQuery } from "../../../../redux/slices/Apis/vendorsApi";

const { TabPane } = Tabs;

// Constants for better maintainability
const DEFAULT_IMAGE = 'https://via.placeholder.com/150?text=No+Image';
const EMPTY_VALUE = "N/A";

const NotificationReview = ({
  setIsModalVisible,
  isModalVisible,
  selectedProduct,
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const [acceptProducts, { isLoading: isAccepting }] = useAcceptProductsMutation();
  const [rejectProducts, { isLoading: isRejecting }] = useRejectProductsMutation();
  const { refetch } = useGetAllProductsQuery();

  // Memoized product data processing
  const processedProduct = useMemo(() => {
    if (!selectedProduct) return null;

    const {
      name,
      slug,
      sku,
      short_description,
      full_description,
      price1,
      price2,
      price3,
      stock_quantity,
      is_stock,
      vendor_details,
      images,
      specifications,
      average_rating,
      reviews,
      status,
      created_at,
      categories = [],
      tags = [],
      seo,
      option1,
      option2,
      option3,
      option4,
      home_delivery,
      pickup,
      partner_delivery,
      estimated_delivery_days,
      id
    } = selectedProduct;

    // Process images with fallback
    const processedImages = images?.length > 0 
      ? images.map(img => (typeof img === 'string' ? { id: img, image: img } : img))
      : [{ id: 'default', image: DEFAULT_IMAGE }];

    // Calculate rating breakdown
    const ratingBreakdown = [0, 0, 0, 0, 0];
    if (reviews?.length > 0) {
      reviews.forEach(review => {
        if (review.rating >= 1 && review.rating <= 5) {
          ratingBreakdown[5 - review.rating]++;
        }
      });
    }

    return {
      basicInfo: { name, slug, sku, status, created_at },
      descriptions: { short_description, full_description },
      pricing: { price1, price2, price3 },
      inventory: { stock_quantity, is_stock },
      vendor: vendor_details,
      media: { images: processedImages },
      specs: specifications || {},
      reviews: {
        average_rating: average_rating || 0,
        list: reviews || [],
        breakdown: ratingBreakdown
      },
      formData: {
        categories,
        tags,
        seo,
        name,
        sku,
        short_description,
        full_description,
        price1: price1?.toString() || "0",
        price2: price2?.toString() || "0",
        price3: price3?.toString() || "0",
        option1: option1 || "",
        option2: option2 || "",
        option3: option3 || "",
        option4: option4 || "",
        is_stock,
        stock_quantity: stock_quantity || 0,
        home_delivery: home_delivery || false,
        pickup: pickup || false,
        partner_delivery: partner_delivery || false,
        estimated_delivery_days: estimated_delivery_days || 0,
      },
      id
    };
  }, [selectedProduct]);

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
  }, [setIsModalVisible]);

  // Common API handler
  const handleProductAction = useCallback(async (action, successMessage) => {
    if (!processedProduct) return;

    try {
      const response = await action({ 
        id: processedProduct.id, 
        data: { ...processedProduct.formData, is_approve: true } 
      });

      if (response.data) {
        Swal.fire({
          title: "Success!",
          text: response.data.detail || successMessage,
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        });
        refetch();
        handleModalClose();
      } else if (response.error) {
        throw new Error(response.error.data?.detail || response.error.data?.message || response.error.message);
      }
    } catch (err) {
      console.error(`Error in product action:`, err);
      Swal.fire({
        title: "Error!",
        text: err.message || "Something went wrong",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "Close",
      });
    }
  }, [processedProduct, refetch, handleModalClose]);

  const handleApprove = useCallback(() => {
    handleProductAction(acceptProducts, `${processedProduct?.basicInfo.name} has been approved successfully.`);
  }, [handleProductAction, acceptProducts, processedProduct]);

  const handleReject = useCallback(() => {
    handleProductAction(rejectProducts, `${processedProduct?.basicInfo.name} has been rejected successfully.`);
  }, [handleProductAction, rejectProducts, processedProduct]);

  // Loading state
  if (!processedProduct) {
    return (
      <Modal
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={400}
      >
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Loading product details...</p>
        </div>
      </Modal>
    );
  }

  const { 
    basicInfo, 
    descriptions, 
    pricing, 
    inventory, 
    vendor, 
    media, 
    specs, 
    reviews 
  } = processedProduct;

  const isApproved = basicInfo.status === "approved";
  const isLoading = isAccepting || isRejecting;

  return (
    <Modal
      className="premium-modal"
      title={
        <div className="modal-header">
          <div className="product-title-section">
            <h2 className="product-title popbold">{basicInfo.name}</h2>
            <div className="product-meta">
              <Tag
                className="status-tag popmed"
                color={isApproved ? "green" : "gold"}
              >
                {basicInfo.status?.toUpperCase()}
              </Tag>
              <span className="product-sku">SKU: {basicInfo.sku}</span>
              <span className="created-date popmed">
                <CalendarOutlined /> {new Date(basicInfo.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      }
      open={isModalVisible}
      onCancel={handleModalClose}
      footer={[
        !isApproved && (
          <Button
            key="reject"
            size="large"
            className="reject-btn"
            icon={<CloseCircleOutlined />}
            onClick={handleReject}
            loading={isLoading}
            disabled={isLoading}
          >
            Reject Product
          </Button>
        ),
        <Button
          key="accept"
          type="primary"
          size="large"
          className="accept-btn"
          icon={isApproved ? <CheckCircleOutlined /> : <CheckCircleOutlined />}
          onClick={handleApprove}
          loading={isLoading}
          disabled={isLoading || isApproved}
        >
          {isApproved ? "Approved" : "Approve Product"}
        </Button>,
      ]}
      width={900}
      style={{ top: 20 }}
      bodyStyle={{ padding: 0 }}
      confirmLoading={isLoading}
    >
      {isLoading && (
        <div className="loading-overlay">
          <Spin size="large" tip="Processing..." />
        </div>
      )}

      <div className="modal-content h-[75vh] overflow-y-auto">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="premium-tabs"
        >
          {/* Product Details Tab */}
          <TabPane 
            tab={
              <span>
                <ShoppingOutlined />
                Product Details
              </span>
            } 
            key="details"
          >
            <Row gutter={[24, 24]}>
              {/* Image Gallery */}
              <Col span={24}>
                <Card 
                  className="premium-card image-gallery-card"
                  title={
                    <div className="card-title popbold">
                      <FileTextOutlined /> Product Images ({media.images.length})
                    </div>
                  }
                >
                  <div className="image-gallery">
                    {media.images.map((img) => (
                      <div key={img.id} className="image-container">
                        <Image
                          src={img.image}
                          alt={basicInfo.name}
                          className="product-image"
                          preview={{
                            maskClassName: 'preview-mask',
                            mask: <span>View</span>
                          }}
                          fallback={DEFAULT_IMAGE}
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                {/* Vendor Information */}
                <Card 
                  className="premium-card"
                  title={
                    <div className="card-title popbold">
                      <UserOutlined /> Vendor Information
                    </div>
                  }
                >
                  <div className="vendor-info">
                    <Avatar
                      size={80}
                      src={vendor?.profile_image}
                      icon={<UserOutlined />}
                      className="vendor-avatar"
                    />
                    <div className="vendor-details popmed">
                      <h3>{vendor?.first_name} {vendor?.last_name}</h3>
                      <p>{vendor?.email}</p>
                      <div className="vendor-stats">
                        <Statistic title="Status" value={vendor?.is_online ? "Online" : "Offline"} />
                        <Tag color={vendor?.is_online ? "green" : "red"} icon={<UserOutlined />}>
                          {vendor?.is_online ? "Online" : "Offline"}
                        </Tag>
                      </div>
                    </div>
                  </div>
                </Card>
                
                {/* Pricing & Inventory */}
                <Card 
                  className="premium-card"
                  title={
                    <div className="card-title popbold">
                      <BarChartOutlined /> Pricing & Inventory
                    </div>
                  }
                >
                  <div className="pricing-section">
                    <div className="price-tier">
                      <span className="tier-label popmed">Base Price</span>
                      <span className="tier-price">${pricing.price1}</span>
                    </div>
                    <div className="price-tier">
                      <span className="tier-label popmed">Discount Price</span>
                      <span className="tier-price">${pricing.price2}</span>
                    </div>
                    <div className="price-tier">
                      <span className="tier-label popmed">Commission Price</span>
                      <span className="tier-price">${pricing.price3}</span>
                    </div>
                    
                    <Divider className="custom-divider" />
                    
                    <div className="stock-info">
                      <div className="stock-status popmed">
                        <span>Inventory Status:</span>
                        <Tag color={inventory.is_stock ? "green" : "red"} className="stock-tag">
                          {inventory.is_stock ? `In Stock (${inventory.stock_quantity})` : "Out of Stock"}
                        </Tag>
                      </div>
                      {inventory.is_stock && (
                        <Progress 
                          percent={Math.min((inventory.stock_quantity / 200) * 100, 100)} 
                          status={inventory.stock_quantity > 20 ? "normal" : "exception"}
                          showInfo={false}
                          className="stock-progress"
                        />
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                {/* Description */}
                <Card 
                  className="premium-card"
                  title={
                    <div className="card-title popbold">
                      <FileTextOutlined /> Description
                    </div>
                  }
                >
                  <div className="description-section">
                    <h4 className="popmed">Short Description</h4>
                    <p className="short-desc">{descriptions.short_description || EMPTY_VALUE}</p>
                    
                    <Divider className="custom-divider" />
                    
                    <h4 className="popmed">Full Description</h4>
                    <p className="full-desc">{descriptions.full_description || EMPTY_VALUE}</p>
                  </div>
                </Card>
              </Col>
              
              {/* Specifications */}
              <Col span={24}>
                <Card 
                  className="premium-card"
                  title={
                    <div className="card-title popbold">
                      <FileTextOutlined /> Specifications
                    </div>
                  }
                >
                  <Row gutter={[16, 16]}>
                    {[
                      { label: "Dimensions", value: specs.dimensions },
                      { label: "Material", value: specs.material },
                      { label: "Color", value: specs.color },
                      { label: "Weight", value: specs.weight },
                      { label: "Warranty", value: specs.warranty },
                      { label: "Country of Origin", value: specs.country_of_origin },
                      { label: "Care Instructions", value: specs.care_instructions },
                      { label: "Assembly Required", value: specs.assembly_required ? "Yes" : "No" },
                    ].map((spec, index) => (
                      <Col xs={24} sm={12} key={index}>
                        <div className="spec-item">
                          <span className="spec-label popmed">{spec.label}</span>
                          <span className="spec-value">{spec.value || EMPTY_VALUE}</span>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          {/* Reviews Tab */}
          <TabPane 
            tab={
              <span>
                <StarOutlined />
                Reviews ({reviews.list.length})
              </span>
            } 
            key="reviews"
          >
            <Card className="premium-card">
              {reviews.list.length > 0 ? (
                <>
                  <div className="rating-overview">
                    <div className="average-rating">
                      <h2>{reviews.average_rating.toFixed(1)}</h2>
                      <Rate disabled value={reviews.average_rating} className="rating-stars" />
                      <p>{reviews.list.length} reviews</p>
                    </div>
                    
                    <div className="rating-breakdown">
                      {[5, 4, 3, 2, 1].map((star, index) => {
                        const count = reviews.breakdown[5-star];
                        const percentage = reviews.list.length ? (count / reviews.list.length) * 100 : 0;
                        
                        return (
                          <div key={star} className="rating-bar">
                            <span className="star-value">{star} star</span>
                            <Progress 
                              percent={percentage} 
                              showInfo={false}
                              strokeColor="#ffc53d"
                              className="rating-progress"
                            />
                            <span className="rating-count">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <Divider className="custom-divider" />
                  
                  <List
                    dataSource={reviews.list}
                    renderItem={(review) => (
                      <List.Item className="review-item">
                        <List.Item.Meta
                          avatar={<Avatar size={48}>{review.user?.name?.[0] || 'U'}</Avatar>}
                          title={
                            <div className="review-header">
                              <span className="reviewer-name">{review.user?.name || 'Unknown User'}</span>
                              <Rate disabled defaultValue={review.rating} className="review-rating" />
                              <span className="review-date">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          }
                          description={<p className="review-comment">{review.comment}</p>}
                        />
                      </List.Item>
                    )}
                  />
                </>
              ) : (
                <div className="empty-state">
                  <ExclamationCircleOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                  <h3>No Reviews Yet</h3>
                  <p>This product hasn't received any reviews yet.</p>
                </div>
              )}
            </Card>
          </TabPane>
        </Tabs>
      </div>
      
      <style jsx>{`
        /* Add your existing CSS styles here */
        /* They remain the same as in your original component */
        
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #8c8c8c;
        }
        
        .empty-state h3 {
          margin-bottom: 8px;
          color: #595959;
        }
        
        .image-gallery {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .image-container {
          width: 150px;
          height: 150px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }
        
        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        /* Add responsive adjustments */
        @media (max-width: 768px) {
          .image-container {
            width: 120px;
            height: 120px;
          }
          
          .vendor-info {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </Modal>
  );
};

export default React.memo(NotificationReview);