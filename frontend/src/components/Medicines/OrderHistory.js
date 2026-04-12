import API_BASE_URL from '../../apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Clock, RefreshCw, Loader2 } from 'lucide-react';
import './OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Retrieve generic user ID or use fallback
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : { userId: '651abcd1234abcd1234abcd1' };
      const idToFetch = user.userId || user._id;
      
      const response = await axios.get(`${API_BASE_URL}/api/orders/user/${idToFetch}`);
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'paid': return 'status-paid';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  if (loading) {
    return (
      <div className="history-loading">
        <Loader2 className="spinner" size={40} />
        <p>Loading your order history...</p>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <div className="history-header">
        <h1><Package className="mr-2" /> My Orders</h1>
        <button onClick={fetchOrders} className="refresh-btn">
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <Package size={64} className="empty-icon" />
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders in the medicine store.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="history-card">
              <div className="card-header">
                <div className="order-id">
                  <span className="label">Order ID:</span> {order._id}
                </div>
                <div className={`order-status ${getStatusColor(order.status)}`}>
                  {order.status}
                </div>
              </div>
              
              <div className="card-body">
                <div className="order-info-grid">
                  <div className="info-group">
                    <div className="label"><Clock size={16} /> Date Placed</div>
                    <div className="value">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="info-group">
                    <div className="label">Total Amount</div>
                    <div className="value font-bold">₹{order.totalAmount}</div>
                  </div>
                  <div className="info-group">
                    <div className="label">Items</div>
                    <div className="value">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</div>
                  </div>
                </div>

                <div className="items-preview">
                  <h4>Order Summary</h4>
                  <ul className="mini-item-list">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <li key={idx}>
                        {item.quantity}x {item.name}
                      </li>
                    ))}
                    {order.items.length > 3 && (
                      <li className="more-items">...and {order.items.length - 3} more items</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
