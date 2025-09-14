// NotificationBell.jsx
import React, { useEffect, useState } from "react";
import {
  Badge,
  List,
  Button,
  Empty,
  Space,
  Typography,
  Card,
  Avatar,
  theme,
  Dropdown
} from "antd";
import {
  BellOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { useGetAllNotificationQuery, useLazyGetProductsByIdQuery } from "../../../../redux/slices/Apis/dashboardApis";
import useNotificationSocket from "../../../../Websocket/useNotificationSocket";
import { FaBell } from "react-icons/fa";
import "../Notifications/NotificationBell.css";
import NotificationModal from "./NotificationReview";

const { Text, Title } = Typography;
const { useToken } = theme;

const timeAgo = (iso) => {
  if (!iso) return "";
  const t = new Date(iso);
  const diff = Date.now() - t.getTime();
  const sec = Math.max(1, Math.floor(diff / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
};

const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

export default function Notification({ onMarkSeen, onClear }) {
  const { token } = useToken();
  const { data, isLoading, refetch } = useGetAllNotificationQuery();
  const { notifications } = useNotificationSocket();
  const [localNotifications, setLocalNotifications] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [open, setOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [triggerGetProductsById, { data: productData, isLoading: productLoading }] = useLazyGetProductsByIdQuery();

  // Get notifications from localStorage on initial load
  useEffect(() => {
    const notificationFromLocalStorage = localStorage.getItem('notify');
    if (notificationFromLocalStorage) {
      try {
        const parsedNotifications = JSON.parse(notificationFromLocalStorage);
        setLocalNotifications(Array.isArray(parsedNotifications) ? parsedNotifications : []);
      } catch (error) {
        console.error('Error parsing notifications from localStorage:', error);
        setLocalNotifications([]);
      }
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [notifications]);

  // Update local notifications when new ones come from the socket
  useEffect(() => {
    if (notifications && Array.isArray(notifications)) {
      // Add new notifications to localStorage
      const updatedNotifications = [...localNotifications, ...notifications];
      setLocalNotifications(updatedNotifications);
      localStorage.setItem('notify', JSON.stringify(updatedNotifications));
    }
  }, [notifications]);

  const handleMarkSeen = async (notification) => {
    if (notification?.meta_data?.product_id) {
      try {
        const product = await triggerGetProductsById(notification.meta_data.product_id).unwrap();
        setSelectedProduct(product);
        setIsModalVisible(true);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      }
    }
  };

  // Function to handle "View All" button click
  const handleViewAll = () => {
    setShowAllNotifications(true);
    refetch(); // Fetch all notifications from API
  };

  // Handle dropdown open/close
  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    
    // When closing the dropdown, clear localStorage notifications
    if (!isOpen && localNotifications.length > 0) {
      localStorage.removeItem('notify');
      setLocalNotifications([]);
    }
  };

  // Determine which notifications to display
  const hasLocalNotifications = localNotifications.length > 0;
  const displayItems = showAllNotifications || !hasLocalNotifications 
    ? (data || []) 
    : localNotifications;

  // Get the count for the badge - show local notification count if available
  const badgeCount = localNotifications.length

  const menu = (
    <Card
      className="notification-panel"
      bodyStyle={{ padding: 0 }}
      style={{ 
        width: 380, 
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        border: `1px solid ${token.colorBorderSecondary}`
      }}
    >
      {/* Header */}
      <div className="notification-header" style={{ 
        background: token.colorBgContainer, 
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Title level={5} style={{ margin: 0 }}>
          Notifications
        </Title>
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => displayItems.forEach((i) => handleMarkSeen(i))}
            disabled={!displayItems.length}
            title="Mark all as read"
          />
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={onClear}
            disabled={!displayItems.length}
            title="Clear all"
          />
        </Space>
      </div>

      {/* List */}
      <div className="notification-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <List
          loading={isLoading && showAllNotifications}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No notifications yet"
                style={{ padding: '20px 0' }}
              />
            ),
          }}
          dataSource={displayItems}
          renderItem={(n) => (
            <List.Item
              className="notification-item"
              style={{ 
                cursor: "pointer",
                padding: '12px 16px',
                transition: 'all 0.2s ease',
                borderBottom: `1px solid ${token.colorBorderSecondary}`
              }}
              onClick={() => handleMarkSeen(n)}
            >
              <div className="notification-content" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                {/* Avatar with user initial */}
                <Avatar 
                  size="default" 
                  style={{ 
                    backgroundColor: stringToColor(n.data?.full_name || n.full_name || 'User'),
                    flexShrink: 0
                  }}
                >
                  {(n.data?.full_name || n.full_name || 'U').charAt(0).toUpperCase()}
                </Avatar>

                {/* Content */}
                <div className="notification-details" style={{ flex: 1 }}>
                  <div className="notification-message">
                    <Text strong className="notification-sender">
                      {n.data?.full_name || n.full_name}
                    </Text>
                    <Text className="notification-text">
                      {n.data?.message || n.message}
                    </Text>
                  </div>
                  <Text type="secondary" className="notification-time">
                    {timeAgo(n.data?.event_time || n.event_time)}
                  </Text>
                </div>
                
                {/* Status indicator */}
                <div 
                  className={`status-indicator ${(n.data?.seen || n.seen) ? 'seen' : 'unseen'}`} 
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: (n.data?.seen || n.seen) ? token.colorTextSecondary : token.colorPrimary,
                    flexShrink: 0,
                    marginTop: '8px'
                  }}
                />
              </div>
            </List.Item>
          )}
        />
      </div>
      
      {/* Footer - Show View All button only if we're showing local notifications */}
      {hasLocalNotifications && !showAllNotifications && (
        <div className="notification-footer" style={{ 
          background: token.colorBgContainer, 
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          padding: '12px 16px',
          textAlign: 'center'
        }}>
          <Button type="primary" size="small" onClick={handleViewAll}>
            View all notifications
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <div>
      <Dropdown
        dropdownRender={() => menu}
        trigger={["click"]}
        open={open}
        onOpenChange={handleOpenChange}
        placement="bottomRight"
        overlayClassName="notification-dropdown"
      >
        <Badge
          count={badgeCount}
          size="small"
          overflowCount={99}
          offset={[-2, 24]}
          style={{ 
            boxShadow: `0 0 0 2px ${token.colorBgContainer}`,
          }}
        >
          <div className="-mt-">
            <FaBell onClick={() => setOpen(!open)} className="bell-icon hover:cursor-pointer mt-7" />
          </div>
        </Badge>
      </Dropdown>
      <NotificationModal
        setIsModalVisible={setIsModalVisible}
        isModalVisible={isModalVisible}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
      />
    </div>
  );
}