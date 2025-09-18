import React, { useState } from "react";
import {
  Modal,
  Button,
  Descriptions,
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
  Progress
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  StockOutlined,
  FileTextOutlined,
  StarOutlined,
  CalendarOutlined,
  BarChartOutlined
} from "@ant-design/icons";
import { useAcceptProductsMutation, useRejectProductsMutation } from "../../../../redux/slices/Apis/dashboardApis";
import Swal from "sweetalert2";
import { useGetAllProductsQuery } from "../../../../redux/slices/Apis/vendorsApi";

const { TabPane } = Tabs;

const NotificationReview = ({
  setIsModalVisible,
  isModalVisible,

  selectedProduct,
}) => {
  const [activeTab, setActiveTab] = useState("details");
   const [acceptProducts] = useAcceptProductsMutation();
      const { data: products, refetch } = useGetAllProductsQuery();
        const [rejectProducts] = useRejectProductsMutation()
  
  const handleModalClose = () => {
    setIsModalVisible(false);

  };

  // console.log(selectedProduct, 'this si selected Preoducts')

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
  } = selectedProduct;

  // Calculate rating percentages for the visual rating breakdown
  const ratingBreakdown = [0, 0, 0, 0, 0]; // 5-star to 1-star
  if (reviews && reviews.length > 0) {
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingBreakdown[5 - review.rating]++;
      }
    });
  }

  // Fallback for images if they're not properly formatted
  const processedImages = images && images.length > 0 
    ? images.map(img => (typeof img === 'string' ? { id: img, image: img } : img))
    : [{ id: 'default', image: 'https://via.placeholder.com/150?text=No+Image' }];



    const handleReject = async () => {
      if (!selectedProduct) return;
    
      const payload = {
        categories: selectedProduct?.categories?.length ? selectedProduct.categories.map(c => c.id) : [0],
        tags: selectedProduct?.tags?.length ? selectedProduct.tags.map(t => t.id) : [0],
        seo: selectedProduct?.seo || 0,
        name: selectedProduct?.name || 'string',
        sku: selectedProduct?.sku || 'string',
        short_description: selectedProduct?.short_description || 'string',
        full_description: selectedProduct?.full_description || 'string',
        price1: selectedProduct?.price1?.toString() || '0',
        price2: selectedProduct?.price2?.toString() || '0',
        price3: selectedProduct?.price3?.toString() || '0',
        option1: selectedProduct?.option1 || '',
        option2: selectedProduct?.option2 || '',
        option3: selectedProduct?.option3 || '',
        option4: selectedProduct?.option4 || '',
        is_stock: selectedProduct?.is_stock,
        stock_quantity: selectedProduct?.stock_quantity || 0,
        home_delivery: selectedProduct?.home_delivery,
        pickup: selectedProduct?.pickup,
        partner_delivery: selectedProduct?.partner_delivery,
        is_approve: true,
        estimated_delivery_days: selectedProduct?.estimated_delivery_days || 0,
      };
    
      try {
        const res = await rejectProducts({ id: selectedProduct?.id, data: payload }).unwrap();
        // console.log('Rejected:', res);
    
        // ✅ Success Swal
        Swal.fire({
          title: "Rejected!",
          text: `${selectedProduct?.name} has been rejected successfully.`,
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK"
        });
        refetch()
        handleModalClose();
    
      } catch (err) {
        console.error('Error approving product:', err);
    
        // ❌ Error Swal
        Swal.fire({
          title: "Error!",
          text: "Something went wrong while approving the product.",
          icon: "error",
          confirmButtonColor: "#d33",
          confirmButtonText: "Close"
        });
      }
    };
    
const handleApprove = async () => {
  if (!selectedProduct) return;

  const payload = {
    categories: selectedProduct?.categories?.length
      ? selectedProduct.categories
      : [],
    tags: selectedProduct?.tags?.length
      ? selectedProduct.tags
      : [],
    seo: selectedProduct?.seo || null,
    name: selectedProduct?.name || "string",
    sku: selectedProduct?.sku || "string",
    short_description: selectedProduct?.short_description || "string",
    full_description: selectedProduct?.full_description || "string",
    price1: selectedProduct?.price1?.toString() || "0",
    price2: selectedProduct?.price2?.toString() || "0",
    price3: selectedProduct?.price3?.toString() || "0",
    option1: selectedProduct?.option1 || "",
    option2: selectedProduct?.option2 || "",
    option3: selectedProduct?.option3 || "",
    option4: selectedProduct?.option4 || "",
    is_stock: selectedProduct?.is_stock,
    stock_quantity: selectedProduct?.stock_quantity || 0,
    home_delivery: selectedProduct?.home_delivery,
    pickup: selectedProduct?.pickup,
    partner_delivery: selectedProduct?.partner_delivery,
    is_approve: true,
    estimated_delivery_days: selectedProduct?.estimated_delivery_days || 0,
  };

  try {
    // Call the API without using unwrap()
    const response = await acceptProducts({
      id: selectedProduct?.id,
      data: payload,
    });

    // Check if the response has data (success case)
    if (response.data) {
      // console.log("✅ Approved:", response.data);

      Swal.fire({
        title: "Approved!",
        text: response.data.detail || `${selectedProduct?.name} has been approved successfully.`,
        icon: "success",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });

      refetch();
      handleModalClose();
    } 
    // Check if the response has an error
    else if (response.error) {
      console.error("❌ API Error:", response.error);
      
      let errorMessage = "Something went wrong while approving the product.";
      
      // Extract error message from different possible formats
      if (response.error.data) {
        errorMessage = response.error.data.detail || 
                       response.error.data.message || 
                       JSON.stringify(response.error.data);
      } else if (response.error.message) {
        errorMessage = response.error.message;
      }
      
      throw new Error(errorMessage);
    }
    // If neither data nor error is present
    else {
      throw new Error("No response received from server");
    }
  } catch (err) {
    console.error("❌ Error approving product:", err);

    Swal.fire({
      title: "Error!",
      text: err.message || "Something went wrong while approving the product.",
      icon: "error",
      confirmButtonColor: "#d33",
      confirmButtonText: "Close",
    });
  }
};


  return (
<Modal
  className="premium-modal"
  title={
    <div className="modal-header">
      <div className="product-title-section">
        <h2 className="product-title popbold">{name}</h2>
        <div className="product-meta">
          <Tag
            className="status-tag popmed"
            color={status === "pending" ? "gold" : "green"}
          >
            {status?.toUpperCase()}
          </Tag>
          <span className="product-sku">SKU: {sku}</span>
          <span className="created-date popmed">
            <CalendarOutlined /> {new Date(created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  }
  open={isModalVisible}
  onCancel={handleModalClose}
  footer={[
    // ✅ Show Reject button only if not approved
    selectedProduct?.status !== "approved" && (
      <Button
        key="reject"
        size="large"
        className="reject-btn"
        icon={<CloseCircleOutlined />}
        onClick={() =>
          handleReject()
        }
      >
        Reject Product
      </Button>
    ),
    // ✅ Always show Approve button
    <Button
      key="accept"
      type="primary"
      size="large"
      className="accept-btn"
      icon={<CheckCircleOutlined />}
      onClick={handleApprove}
    >
{
   selectedProduct?.status !== "approved" ? "Approve Product" : "Approved"
}
      {/* Approve Product */}
    </Button>,
  ]}
  width={900}
  style={{ top: 20 }}
  bodyStyle={{ padding: 0 }}
>


      <div className="modal-content">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="premium-tabs"
        >
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
              <Col span={24}>
                <Card 
                  className="premium-card image-gallery-card"
                  title={
                    <div className="card-title popbold">
                      <FileTextOutlined /> Product Images
                    </div>
                  }
                >
<div className="image-gallery" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
  {processedImages.map((img) => (
    <div
      key={img.id}
      style={{
        width: '200px', // Set a fixed width for each container
        height: 'auto',
        overflow: 'hidden',
      }}
    >
      <Image
        src={img.image}
        alt={name}
        style={{
          borderRadius: 8,
          maxWidth: '100%', // Ensure image doesn't overflow the container
          height: 'auto', // Maintain aspect ratio
        }}
        preview={{
          maskClassName: 'preview-mask',
          mask: <span>View</span>
        }}
        fallback="https://via.placeholder.com/150?text=Image+Error"
      />
    </div>
  ))}
</div>

                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
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
                      src={vendor_details?.profile_image}
                      icon={<UserOutlined />}
                      className="vendor-avatar"
                    />
                    <div className="vendor-details popmed">
                      <h3>{vendor_details?.first_name} {vendor_details?.last_name}</h3>
                      <p>{vendor_details?.email}</p>
                      <div className="vendor-stats">
                        <Statistic title="Products" value={34} prefix={<ShoppingOutlined />} />
                        <Statistic title="Rating" value={4.7} prefix={<StarOutlined />} />
                      </div>
                    </div>
                  </div>
                </Card>
                
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
                      <span className="tier-label popmed">Product Price</span>
                      <span className="tier-price">${price1}</span>
                    </div>
                    <div className="price-tier">
                      <span className="tier-label popmed">Discount Price</span>
                      <span className="tier-price">${price2}</span>
                    </div>
                    <div className="price-tier">
                      <span className="tier-label popmed">Commission Price</span>
                      <span className="tier-price">${price3}</span>
                    </div>
                    
                    <Divider className="custom-divider" />
                    
                    <div className="stock-info">
                      <div className="stock-status popmed">
                        <StockOutlined />
                        <span>Inventory Status:</span>
                        <Tag color={is_stock ? "green" : "red"} className="stock-tag">
                          {is_stock ? `In Stock (${stock_quantity})` : "Out of Stock"}
                        </Tag>
                      </div>
                      {is_stock && (
                        <Progress 
                          percent={Math.min((stock_quantity / 100) * 100, 100)} 
                          status={stock_quantity > 20 ? "normal" : "exception"}
                          showInfo={false}
                          className="stock-progress"
                        />
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
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
                    <p className="short-desc">{short_description}</p>
                    
                    <Divider className="custom-divider" />
                    
                    <h4 className="popmed">Full Description</h4>
                    <p className="full-desc">{full_description}</p>
                  </div>
                </Card>
              </Col>
              
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
                    <Col xs={24} sm={12}>
                      <div className="spec-item">
                        <span className="spec-label popmed">Dimensions</span>
                        <span className="spec-value ">{specifications?.dimensions || "N/A"}</span>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="spec-item">
                        <span className="spec-label popmed">Material</span>
                        <span className="spec-value">{specifications?.material || "N/A"}</span>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="spec-item">
                        <span className="spec-label popmed">Color</span>
                        <span className="spec-value">{specifications?.color || "N/A"}</span>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="spec-item">
                        <span className="spec-label popmed">Weight</span>
                        <span className="spec-value">{specifications?.weight || "N/A"}</span>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="spec-item">
                        <span className="spec-label popmed">Warranty</span>
                        <span className="spec-value">{specifications?.warranty || "N/A"}</span>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="spec-item">
                        <span className="spec-label popmed">Country of Origin</span>
                        <span className="spec-value">{specifications?.country_of_origin || "N/A"}</span>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <StarOutlined />
                Reviews ({reviews?.length || 0})
              </span>
            } 
            key="reviews"
          >
            <Card className="premium-card">
              <div className="rating-overview">
                <div className="average-rating">
                  <h2>{average_rating?.toFixed(1) || "0.0"}</h2>
                  <Rate disabled value={average_rating} className="rating-stars" />
                  <p>{reviews?.length || 0} reviews</p>
                </div>
                
                <div className="rating-breakdown">
                  {[5, 4, 3, 2, 1].map((star, index) => {
                    const count = ratingBreakdown[5-star];
                    const percentage = reviews?.length ? (count / reviews.length) * 100 : 0;
                    
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
                dataSource={reviews}
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
                locale={{ emptyText: "No reviews yet" }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </div>
      
      <style jsx>{`
        /* Modal styling */
        .premium-modal :global(.ant-modal-content) {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }
        
        .premium-modal :global(.ant-modal-header) {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-bottom: 1px solid #e8e8e8;
          padding: 20px 24px;
        }
        
        .modal-header .product-title-section {
          display: flex;
          flex-direction: column;
        }
        
        .modal-header .product-title {
          margin: 0;
          font-size: 22px;
          font-weight: 600;
          color: #262626;
        }
        
        .modal-header .product-meta {
          display: flex;
          align-items: center;
          margin-top: 8px;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .modal-header .status-tag {
          border-radius: 4px;
          padding: 2px 8px;
          font-weight: 600;
          font-size: 12px;
        }
        
        .modal-header .product-sku {
          color: #8c8c8c;
          font-size: 13px;
        }
        
        .modal-header .created-date {
          color: #8c8c8c;
          font-size: 13px;
        }
        
        .premium-modal :global(.ant-modal-body) {
          padding: 0;
        }
        
        .premium-modal :global(.ant-modal-footer) {
          padding: 16px 24px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        
        .premium-modal .accept-btn {
          background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
          border: none;
          border-radius: 6px;
          font-weight: 500;
          box-shadow: 0 2px 6px rgba(82, 196, 26, 0.3);
        }
        
        .premium-modal .reject-btn {
          border-radius: 6px;
          font-weight: 500;
        }
        
        /* Tabs styling */
        .premium-tabs :global(.ant-tabs-nav) {
          padding: 0 24px;
          margin: 0;
        }
        
        .premium-tabs :global(.ant-tabs-tab) {
          padding: 12px 16px;
          font-weight: 500;
        }
        
        .premium-tabs :global(.ant-tabs-ink-bar) {
          height: 3px;
          border-radius: 3px 3px 0 0;
        }
        
        /* Card styling */
        .premium-card :global(.ant-card) {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border: 1px solid #f0f0f0;
          transition: all 0.3s ease;
        }
        
        .premium-card :global(.ant-card):hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .premium-card :global(.ant-card-head) {
          border-bottom: 1px solid #f0f0f0;
          min-height: auto;
          padding: 16px 20px;
        }
        
        .premium-card :global(.ant-card-head-title) {
          font-weight: 600;
          font-size: 16px;
        }
        
        .premium-card :global(.ant-card-body) {
          padding: 20px;
        }
        
        .card-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        /* Image gallery */
        .image-gallery-card :global(.ant-card-body) {
          padding: 12px;
        }
        
        .image-gallery {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 4px;
        }
        
        .image-container {
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        
        .image-container:hover {
          transform: translateY(-2px);
        }
        
        .image-container :global(.ant-image) {
          display: block;
        }
        
        .image-container :global(.ant-image-img) {
          width: 150px;
          height: 150px;
          object-fit: cover;
        }
        
        /* Vendor info */
        .vendor-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .vendor-avatar {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .vendor-details h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .vendor-details p {
          margin: 0;
          color: #8c8c8c;
        }
        
        .vendor-stats {
          display: flex;
          gap: 16px;
          margin-top: 12px;
        }
        
        .vendor-stats :global(.ant-statistic) {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .vendor-stats :global(.ant-statistic-title) {
          font-size: 12px;
          margin-right: 4px;
        }
        
        .vendor-stats :global(.ant-statistic-content) {
          font-size: 14px;
          font-weight: 600;
        }
        
        /* Pricing section */
        .pricing-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .price-tier {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #fafafa;
          border-radius: 6px;
        }
        
        .tier-label {
          font-weight: 500;
          color: #595959;
        }
        
        .tier-price {
          font-weight: 600;
          color: #1890ff;
          font-size: 16px;
        }
        
        .stock-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .stock-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
        
        .stock-tag {
          border-radius: 4px;
          font-weight: 600;
        }
        
        .stock-progress {
          margin-top: 4px;
        }
        
        /* Description section */
        .description-section h4 {
          margin: 0 0 8px 0;
          font-weight: 600;
          color: #262626;
        }
        
        .short-desc, .full-desc {
          color: #595959;
          line-height: 1.6;
        }
        
        /* Specifications */
        .spec-item {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: #fafafa;
          border-radius: 6px;
        }
        
        .spec-label {
          font-weight: 500;
          color: #595959;
        }
        
        .spec-value {
          font-weight: 600;
          color: #262626;
        }
        
        /* Reviews */
        .rating-overview {
          display: flex;
          gap: 40px;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .average-rating {
          text-align: center;
          padding: 16px;
          background: #fafafa;
          border-radius: 8px;
          min-width: 140px;
        }
        
        .average-rating h2 {
          font-size: 36px;
          margin: 0;
          color: #262626;
          font-weight: 700;
        }
        
        .rating-stars {
          font-size: 16px;
          margin: 8px 0;
        }
        
        .rating-breakdown {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .rating-bar {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .star-value {
          width: 60px;
          font-size: 14px;
          color: #595959;
        }
        
        .rating-progress {
          flex: 1;
          margin: 0;
        }
        
        .rating-count {
          width: 30px;
          text-align: right;
          font-size: 14px;
          color: #8c8c8c;
        }
        
        .review-item {
          padding: 16px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .review-item:last-child {
          border-bottom: none;
        }
        
        .review-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }
        
        .reviewer-name {
          font-weight: 600;
        }
        
        .review-rating {
          font-size: 14px;
        }
        
        .review-date {
          color: #8c8c8c;
          font-size: 13px;
        }
        
        .review-comment {
          margin: 0;
          color: #595959;
          line-height: 1.6;
        }
        
        /* Custom divider */
        .custom-divider {
          margin: 16px 0;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .vendor-info {
            flex-direction: column;
            text-align: center;
          }
          
          .vendor-stats {
            justify-content: center;
          }
          
          .rating-overview {
            flex-direction: column;
            gap: 20px;
          }
          
          .premium-tabs :global(.ant-tabs-nav) {
            padding: 0 16px;
          }
          
          .modal-header .product-meta {
            flex-wrap: wrap;
          }
          
          .image-container :global(.ant-image-img) {
            width: 120px;
            height: 120px;
          }
        }
      `}</style>
    </Modal>
  );
};

export default NotificationReview;