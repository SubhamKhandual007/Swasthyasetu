import API_BASE_URL from '../../apiConfig';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Package, ArrowRight, Loader2 } from 'lucide-react';
import './OrderConfirmation.css'; // Reuse or create a simple CSS

const OrderConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (id.startsWith('DEMO_')) {
        setOrder({
          _id: id,
          createdAt: new Date().toISOString(),
          status: 'Paid',
          shippingAddress: {
            street: 'Demo Street',
            city: 'Demo City',
            state: 'Demo State',
            postalCode: '123456'
          },
          items: [{ name: 'Demo Medicine', quantity: 1, price: 0 }],
          totalAmount: 0
        });
        setLoading(false);
        return;
      }

      try {
        // Here we'd typically have a route to get a single order by ID
        // For right now, assuming admin route /api/orders works or we build a specific fetch route
        // This relies on having a GET /api/orders/:id route
        const response = await axios.get(`${API_BASE_URL}/api/orders`);
        const currentOrder = response.data.find(o => o._id === id);
        
        if (currentOrder) {
            setOrder(currentOrder);
        } else {
            console.error("Order not found");
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="spinner" size={40} />
        <p>Confirming your order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="error-state">
        <h2>Order Not Found</h2>
        <p>We couldn't locate details for this order. It may have been processed but not returning properly.</p>
        <button className="primary-btn" onClick={() => navigate('/medicines')}>Return to Store</button>
      </div>
    );
  }

  return (
    <div className="confirmation-container">
      <div className="success-header">
        <CheckCircle className="success-icon" size={64} />
        <h1>Order Confirmed!</h1>
        <p>Thank you for your purchase. Your order has been received and is being processed.</p>
      </div>

      <div className="order-details-card">
        <div className="order-meta">
          <div className="meta-group">
            <span className="meta-label">Order ID</span>
            <span className="meta-value">{order._id}</span>
          </div>
          <div className="meta-group">
            <span className="meta-label">Date</span>
            <span className="meta-value">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="meta-group">
            <span className="meta-label">Status</span>
            <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
          </div>
        </div>

        <div className="shipping-info">
          <h3>Shipping Address</h3>
          <p>{order.shippingAddress.street}</p>
          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
        </div>

        <div className="purchased-items">
          <h3>Items</h3>
          {order.items.map((item, index) => (
            <div key={index} className="purchased-item">
              <span className="item-name">{item.quantity}x {item.name}</span>
              <span className="item-price">₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="order-total">
            <span>Total Paid</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="secondary-btn" onClick={() => navigate('/order-history')}>
          <Package size={18} /> View All Orders
        </button>
        <button className="primary-btn" onClick={() => navigate('/medicines')}>
          Continue Shopping <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
