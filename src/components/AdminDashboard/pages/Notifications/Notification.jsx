
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
import { useGetAllNotificationQuery } from "../../../../redux/slices/Apis/dashboardApis";
import useNotificationSocket from "../../../../Websocket/useNotificationSocket";
import { FaBell } from "react-icons/fa";
import "../Notifications/NotificationBell.css"; // We'll create this CSS file

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

// Function to generate avatar color based on name
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
  const { data, isLoading,refetch } = useGetAllNotificationQuery();
  const { notifications } = useNotificationSocket();
  const [open, setOpen] = useState(false);

  useEffect(()=> {
  refetch()
  }, [notifications])

  const newNotifications = localStorage.removeItem('notifications')
  console.log(newNotifications,'ads')

  // fallback to [] if API hasn't loaded yet
  const items = data || [];

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
        borderBottom: `1px solid ${token.colorBorderSecondary}` 
      }}>
        <Title level={5} style={{ margin: 0 }}>
          Notifications
        </Title>
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => items.forEach((i) => onMarkSeen(i.id))}
            disabled={!items.length}
            title="Mark all as read"
          />
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={onClear}
            disabled={!items.length}
            title="Clear all"
          />
        </Space>
      </div>

      {/* List */}
      <div className="notification-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <List
          loading={isLoading}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No notifications yet"
                style={{ padding: '20px 0' }}
              />
            ),
          }}
          dataSource={items}
          renderItem={(n) => (
            <List.Item
              className="notification-item"
              style={{ 
                cursor: "pointer",
                padding: '12px 16px',
                transition: 'all 0.2s ease',
                borderBottom: `1px solid ${token.colorBorderSecondary}`
              }}
              onClick={() => onMarkSeen(n.id)}
            >
              <div className="notification-content">
                {/* Avatar with user initial */}
                <Avatar 
                  size="default" 
                  style={{ 
                    backgroundColor: stringToColor(n.full_name || 'User'),
                    flexShrink: 0
                  }}
                >
                  {n.full_name ? n.full_name.charAt(0).toUpperCase() : 'U'}
                </Avatar>

                {/* Content */}
                <div className="notification-details">
                  <div className="notification-message">
                    <Text strong className="notification-sender">
                      {n.full_name}
                    </Text>
                    <Text className="notification-text">
                      {n.message}
                    </Text>
                  </div>
                  <Text type="secondary" className="notification-time">
                    {timeAgo(n.event_time)}
                  </Text>
                </div>
                
                {/* Status indicator */}
                <div className={`status-indicator ${n.seen ? 'seen' : 'unseen'}`} />
              </div>
            </List.Item>
          )}
        />
      </div>
      
      {/* Footer */}
      {items.length > 0 && (
        <div className="notification-footer" style={{ 
          background: token.colorBgContainer, 
          borderTop: `1px solid ${token.colorBorderSecondary}` 
        }}>
          {/* <Button type="link" size="small">
            View all notifications
          </Button> */}
        </div>
      )}
    </Card>
  );

  return (
    <Dropdown
      dropdownRender={() => menu}
      trigger={["click"]}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      overlayClassName="notification-dropdown"
    >
      <Badge
        count={notifications.length}
        size="small"
        overflowCount={99}
        offset={[-6, 6]}
        style={{ 
          boxShadow: `0 0 0 2px ${token.colorBgContainer}`,
        }}
      >
        <div className="bell-icon-container">
          <FaBell className="bell-icon mt-1" />
        </div>
      </Badge>
    </Dropdown>
  );
}