import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Trash2, 
  Clock, 
  ArrowLeft,
  Settings,
  MoreVertical,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './Notifications.module.css';

import { useNotifications } from '../../../../context/NotificationContext';

const Notifications = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    loading, 
    markAsRead, 
    markAllRead, 
    deleteNotification 
  } = useNotifications();
  const [filter, setFilter] = useState('all'); // all, unread, read

  const getTypeIcon = (type) => {
    switch (type) {
      case 'appointment': return <Clock className={styles.iconAppointment} size={20} />;
      case 'blood_request': return <AlertCircle className={styles.iconBlood} size={20} />;
      case 'emergency': return <AlertCircle className={styles.iconEmergency} size={20} />;
      default: return <Info className={styles.iconSystem} size={20} />;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <h1 className={styles.title}>Notifications</h1>
          <button className={styles.actionBtn}>
            <Settings size={22} />
          </button>
        </div>

        {/* Filters */}
        <div className={styles.filterBar}>
          <button 
            className={`${styles.filterTab} ${filter === 'all' ? styles.activeTab : ''}`}
            onClick={() => setFilter('all')}
          >
            All <span>{notifications.length}</span>
          </button>
          <button 
            className={`${styles.filterTab} ${filter === 'unread' ? styles.activeTab : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread <span>{notifications.filter(n => !n.isRead).length}</span>
          </button>
          <button 
            className={`${styles.filterTab} ${filter === 'read' ? styles.activeTab : ''}`}
            onClick={() => setFilter('read')}
          >
            Read
          </button>
          {notifications.some(n => !n.isRead) && (
            <button className={styles.markAllBtn} onClick={markAllRead}>
              <Check size={16} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className={styles.notificationList}>
        {loading ? (
          <div className={styles.loader}>
            <div className={styles.spinner}></div>
            <p>Loading your alerts...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.bellIcon}>
              <Bell size={64} />
            </div>
            <h2>All caught up!</h2>
            <p>No {filter !== 'all' ? filter : ''} notifications here. Stay healthy!</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div 
              key={notification._id} 
              className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
              onClick={() => !notification.isRead && markAsRead(notification._id)}
            >
              <div className={styles.iconContainer}>
                {getTypeIcon(notification.type)}
                {!notification.isRead && <div className={styles.unreadDot}></div>}
              </div>
              
              <div className={styles.content}>
                <div className={styles.contentHeader}>
                  <h3 className={styles.notificationTitle}>{notification.title}</h3>
                  <span className={styles.time}>{formatDate(notification.createdAt)}</span>
                </div>
                <p className={styles.message}>{notification.message}</p>
                
                <div className={styles.actions}>
                  {!notification.isRead && (
                    <button className={styles.inlineReadBtn} onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification._id);
                    }}>
                      Mark as read
                    </button>
                  )}
                  <button className={styles.deleteBtn} onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification._id);
                  }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Meta */}
      {notifications.length > 0 && (
        <p className={styles.footerInfo}>
          End of alerts. You have {notifications.filter(n => !n.isRead).length} unread items.
        </p>
      )}
    </div>
  );
};

export default Notifications;
