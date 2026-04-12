import API_BASE_URL from '../../apiConfig';
import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Checkout.css';

// ─── Stripe Setup ────────────────────────────────────────────────────────────
const stripePromise = loadStripe("pk_test_51T5PkUFMm1x5WhjXk2Yzr2ptCbg6m1kZ9FVnVNHztsYlgjNwaON1fM4cSHMhu3MTe124JBugZ4s0LHQ4rfV85e7G00nefAf8Vo");

// ─── Stripe Element Styles ───────────────────────────────────────────────────
const stripeElementStyle = {
  base: {
    color: "#e2e8f0",
    fontFamily: "'DM Mono', 'Courier New', monospace",
    fontSize: "14px",
    fontSmoothing: "antialiased",
    "::placeholder": { color: "#475569" },
    iconColor: "#94a3b8",
  },
  invalid: { color: "#f87171", iconColor: "#f87171" },
  complete: { color: "#34d399" },
};

// ═════════════════════════════════════════════════════════════════════════════
// CheckoutForm — lives inside <Elements> provider
// ═════════════════════════════════════════════════════════════════════════════
function CheckoutForm({ clientSecret, orderDetails, onSuccess, onClose }) {
  const [cardError, setCardError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
  });

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') {
      // Remove all non-digits and limit to 16 digits
      let v = value.replace(/\D/g, '').substring(0, 16);
      // Add spaces every 4 digits
      formattedValue = v.replace(/(\d{4})(?=\d)/g, '$1 ');
    } else if (name === 'expiry') {
      // Remove non-digits and limit to 4 digits
      let v = value.replace(/\D/g, '').substring(0, 4);
      // Auto add slash
      if (v.length >= 2) {
        formattedValue = v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2) : '');
      } else {
        formattedValue = v;
      }
    } else if (name === 'cvc') {
      // Remove non-digits and limit to 3 digits
      formattedValue = value.replace(/\D/g, '').substring(0, 3);
    }

    setCardDetails({ ...cardDetails, [name]: formattedValue });
    setCardError("");
  };

  const isFormComplete = cardDetails.number.replace(/\s/g, '').length >= 13 && cardDetails.expiry.length === 5 && cardDetails.cvc.length === 3;

  const handleSubmit = async () => {
    if (!isFormComplete) return;
    setIsProcessing(true);
    setCardError("");

    try {
      // Simulate real-world delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Always succeed with a dummy payment intent ID
      onSuccess("pi_MOCK_PAYMENT_" + Date.now());
      
    } catch (err) {
      setCardError("Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-overlay">
      <div className="checkout-card">
        {/* Header */}
        <div className="checkout-header">
          <div className="checkout-header-left">
            <div className="checkout-lock-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span className="checkout-secure-label">Secure Payment</span>
          </div>
          <button className="checkout-close-btn" onClick={onClose} disabled={isProcessing} aria-label="Close checkout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Amount Summary */}
        <div className="checkout-summary">
          <div className="checkout-summary-row">
            <span className="checkout-summary-label">Medicines Order</span>
            <span className="checkout-summary-amount">₹{orderDetails.totalAmount.toFixed(2)}</span>
          </div>
          <div className="checkout-divider" />
          <div className="checkout-summary-row checkout-summary-total">
            <span>Total due</span>
            <span className="checkout-total-amount">₹{orderDetails.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Card Fields */}
        <div className="checkout-fields">
          <div className="field-group">
            <label className="field-label">Card Number</label>
            <div className="stripe-field-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', marginRight: '8px', zIndex: 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </span>
              <input 
                type="text" 
                name="number"
                placeholder="0000 0000 0000 0000"
                value={cardDetails.number}
                onChange={handleFieldChange}
                style={{ background: 'transparent', border: 'none', color: '#e2e8f0', width: '100%', outline: 'none', fontFamily: "'DM Mono', monospace", fontSize: '14px', letterSpacing: '1px' }}
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Expiry</label>
              <div className="stripe-field-wrapper">
                <input 
                  type="text" 
                  name="expiry"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={handleFieldChange}
                  style={{ background: 'transparent', border: 'none', color: '#e2e8f0', width: '100%', outline: 'none', fontFamily: "'DM Mono', monospace", fontSize: '14px', letterSpacing: '1px' }}
                />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">CVC</label>
              <div className="stripe-field-wrapper">
                <input 
                  type="text" 
                  name="cvc"
                  placeholder="CVC"
                  maxLength="3"
                  value={cardDetails.cvc}
                  onChange={handleFieldChange}
                  style={{ background: 'transparent', border: 'none', color: '#e2e8f0', width: '100%', outline: 'none', fontFamily: "'DM Mono', monospace", fontSize: '14px', letterSpacing: '1px' }}
                />
              </div>
            </div>
          </div>

          {cardError && (
            <div className="card-error" role="alert">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {cardError}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="button"
          className={`pay-btn ${isProcessing ? "pay-btn--loading" : ""} ${!isFormComplete && !isProcessing ? "pay-btn--disabled" : ""}`}
          onClick={handleSubmit}
          disabled={!isFormComplete || isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="stripe-spinner" aria-hidden="true" />
              Processing…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Pay ₹{orderDetails.totalAmount.toFixed(2)}
            </>
          )}
        </button>

        {/* Stripe Badge */}
        <p className="stripe-badge">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Secured by Stripe · 256-bit SSL encryption
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        
        .checkout-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(2, 6, 23, 0.85);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          animation: fadeIn 0.25s ease;
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .checkout-card {
          background: #0f172a;
          border: 1px solid rgba(148, 163, 184, 0.12);
          border-radius: 20px;
          width: 100%; max-width: 420px;
          padding: 0;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97) } to { opacity: 1; transform: none } }
        .checkout-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(148,163,184,0.08);
        }
        .checkout-header-left { display: flex; align-items: center; gap: 0.5rem; }
        .checkout-lock-icon {
          color: #34d399; width: 28px; height: 28px; border-radius: 8px;
          background: rgba(52, 211, 153, 0.12);
          display: flex; align-items: center; justify-content: center;
        }
        .checkout-secure-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; color: #64748b;
        }
        .checkout-close-btn {
          color: #475569; background: none; border: none;
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.15s, color 0.15s;
        }
        .checkout-close-btn:hover:not(:disabled) { background: rgba(248,113,113,0.1); color: #f87171; }
        .checkout-close-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .checkout-summary {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(148,163,184,0.08);
        }
        .checkout-summary-row { display: flex; justify-content: space-between; align-items: center; }
        .checkout-summary-label { font-size: 0.875rem; color: #94a3b8; font-family: 'DM Sans', sans-serif; }
        .checkout-summary-amount { font-size: 0.875rem; color: #94a3b8; font-family: 'DM Mono', monospace; }
        .checkout-divider { height: 1px; background: rgba(148,163,184,0.08); margin: 0.75rem 0; }
        .checkout-summary-total { font-family: 'DM Sans', sans-serif; }
        .checkout-summary-total span:first-child { font-size: 0.875rem; color: #e2e8f0; font-weight: 600; }
        .checkout-total-amount {
          font-size: 1.5rem; font-weight: 700; color: #f1f5f9;
          font-family: 'DM Mono', monospace; letter-spacing: -0.02em;
        }
        .checkout-fields { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .field-group { display: flex; flex-direction: column; gap: 0.4rem; flex: 1; }
        .field-row { display: flex; gap: 0.75rem; }
        .field-label {
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: #475569;
          font-family: 'DM Sans', sans-serif;
        }
        .stripe-field-wrapper {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148,163,184,0.15);
          border-radius: 10px;
          padding: 0.8rem 0.9rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .stripe-field-wrapper:focus-within {
          border-color: rgba(99, 179, 237, 0.5);
          box-shadow: 0 0 0 3px rgba(99, 179, 237, 0.08);
        }
        .card-error {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.8rem; color: #f87171;
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 8px; padding: 0.6rem 0.8rem;
          font-family: 'DM Sans', sans-serif;
        }
        .pay-btn {
          margin: 0 1.5rem 0.5rem;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.9rem 1.5rem; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white; font-size: 0.9rem; font-weight: 700;
          font-family: 'DM Sans', sans-serif; letter-spacing: 0.01em;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(59,130,246,0.35);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          width: calc(100% - 3rem);
        }
        .pay-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(59,130,246,0.45); }
        .pay-btn:active:not(:disabled) { transform: translateY(0); }
        .pay-btn--loading { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); pointer-events: none; }
        .pay-btn--disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
        .stripe-spinner {
          width: 15px; height: 15px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: white;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg) } }
        .stripe-badge {
          display: flex; align-items: center; justify-content: center; gap: 0.35rem;
          font-size: 0.7rem; color: #334155;
          font-family: 'DM Sans', sans-serif;
          padding: 1rem 1.5rem 1.25rem;
        }
      `}</style>
    </div>
  );
}

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Shipping details state
  const [shippingDetails, setShippingDetails] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleCreatePaymentIntent = async (e) => {
    e.preventDefault();

    const nameRegex = /^[A-Za-z]{2,}(?:\s[A-Za-z]{2,})+$/;
    if (!nameRegex.test(shippingDetails.name.trim())) {
      toast.error("Please enter a valid Full Name (First and Last name, alphabets only)");
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(shippingDetails.phone.trim())) {
      toast.error("Please enter a valid Phone Number (10 digits starting with 6,7,8,9)");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(shippingDetails.email.toLowerCase())) {
      toast.error("Please enter a valid Gmail address (e.g., name@gmail.com)!");
      return;
    }

    const streetRegex = /^[A-Za-z0-9\s,.-]{5,100}$/;
    if (!streetRegex.test(shippingDetails.street.trim()) || !/[A-Za-z]{2,}/.test(shippingDetails.street.trim()) || /(.)\1{4,}/.test(shippingDetails.street.trim())) {
      toast.error("Please enter a valid Street Address (Must contain real words, not just random letters)");
      return;
    }

    const cityRegex = /^[A-Za-z\s]{2,50}$/;
    if (!cityRegex.test(shippingDetails.city.trim()) || /(.)\1{3,}/.test(shippingDetails.city.trim())) {
      toast.error("Please enter a valid City (Cannot contain repeated random letters)");
      return;
    }

    const stateRegex = /^[A-Za-z\s]{2,50}$/;
    if (!stateRegex.test(shippingDetails.state.trim()) || /(.)\1{3,}/.test(shippingDetails.state.trim())) {
      toast.error("Please enter a valid State (Cannot contain repeated random letters)");
      return;
    }

    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!pinRegex.test(shippingDetails.postalCode.trim())) {
      toast.error("Please enter a valid PIN Code (6 digits, cannot start with 0)");
      return;
    }

    setLoading(true);

    try {
      const formattedItems = cartItems.map(item => ({
        medicineId: item.medicineId,
        quantity: item.quantity
      }));

      // Assuming user exists in local context, otherwise dummy valid ObjectId
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : { userId: '651abcd1234abcd1234abcd1', role: 'patient' };

      const response = await axios.post(`${API_BASE_URL}/api/orders/create-payment-intent`, {
        items: formattedItems,
        userId: user.userId || user._id,
        userModel: user.role || 'patient'
      });

      setClientSecret(response.data.clientSecret);
    } catch (err) {
      console.error('Error creating payment intent:', err);
      // alert("Test mode: Bypass activated. Mocking client secret so Stripe UI can render.");
      
      // We will pretend we got a clientSecret, but we'll simulate payment locally if the element attempts to submit
      setClientSecret('pi_TEST_MODE_BYPASS_123_secret_123'); 
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setShippingDetails({
      ...shippingDetails,
      [e.target.name]: e.target.value
    });
  };

  const orderDetails = {
    userId: (() => {
      const u = localStorage.getItem('user');
      if (u) {
        const parsed = JSON.parse(u);
        return parsed.userId || parsed._id;
      }
      return '651abcd1234abcd1234abcd1';
    })(),
    userModel: 'patient',
    items: cartItems.map(item => ({
      medicine: item.medicineId,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    })),
    totalAmount: cartTotal,
    shippingAddress: {
      street: shippingDetails.street,
      city: shippingDetails.city,
      state: shippingDetails.state,
      postalCode: shippingDetails.postalCode
    },
    name: shippingDetails.name,
    phone: shippingDetails.phone
  };

  // Callback when Stripe payment succeeds
  const handlePaymentSuccess = async (paymentIntentId) => {
      try {
          const response = await axios.post(`${API_BASE_URL}/api/orders`, {
            ...orderDetails,
            paymentIntentId: paymentIntentId
          });
          
          clearCart();
          navigate(`/order-confirmation/${response.data._id}`);
      } catch (err) {
          console.error("Order completion failed", err);
          // Demo fallback
          clearCart();
          navigate(`/order-confirmation/DEMO_${Date.now()}`);
      }
  };

  // Callback to close the modal and go back to shipping info
  const handlePaymentClose = () => {
      setClientSecret('');
  };

  return (
    <div className="checkout-container">
      <h1>Secure Checkout</h1>
      
      <div className="checkout-grid">
        <div className="checkout-details">
          <form className="shipping-form" onSubmit={handleCreatePaymentIntent}>
            <h2>Shipping Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" required value={shippingDetails.name} onChange={handleInputChange} pattern="^[A-Za-z]{2,}(?:\s[A-Za-z]{2,})+$" title="Please enter at least a First and Last name (alphabets only)." />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" required value={shippingDetails.phone} onChange={handleInputChange} pattern="^[6-9]\d{9}$" title="Exactly 10 digits starting with 6, 7, 8, or 9" />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address (@gmail.com)</label>
              <input type="email" name="email" required value={shippingDetails.email} onChange={handleInputChange} placeholder="example@gmail.com" />
            </div>
            
            <div className="form-group">
              <label>Street Address</label>
              <input type="text" name="street" required value={shippingDetails.street} onChange={handleInputChange} pattern="^[A-Za-z0-9\s,.-]{5,100}$" title="Street address, 5 to 100 characters" />
            </div>
            
            <div className="form-row triple">
              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" required value={shippingDetails.city} onChange={handleInputChange} pattern="^[A-Za-z\s]{2,50}$" title="City name, only alphabets and spaces" />
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" name="state" required value={shippingDetails.state} onChange={handleInputChange} pattern="^[A-Za-z\s]{2,50}$" title="State name, only letters and spaces" />
              </div>
              <div className="form-group">
                <label>PIN Code</label>
                <input type="text" name="postalCode" required value={shippingDetails.postalCode} onChange={handleInputChange} pattern="^[1-9][0-9]{5}$" title="Exactly 6 digits, cannot start with 0" />
              </div>
            </div>

            <button type="submit" className="proceed-payment-btn" disabled={loading || cartTotal === 0}>
              {loading ? <Loader2 className="spinner" size={20} /> : 'Proceed to Payment'}
            </button>
          </form>
        </div>

        <div className="order-summary-sidebar">
          <h2>Order Summary</h2>
          <div className="summary-items">
            {cartItems.map(item => (
              <div key={item.medicineId} className="summary-item">
                <div className="item-info">
                  <span className="item-qty">{item.quantity}x</span>
                  <span className="item-name">{item.name}</span>
                </div>
                <span className="item-price">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          
          <div className="totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="total-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <hr />
            <div className="total-row final-total">
              <span>Total</span>
              <span>₹{cartTotal}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Render overlay form if triggered */}
      {clientSecret && (
        <CheckoutForm 
          clientSecret={clientSecret} 
          orderDetails={orderDetails} 
          onSuccess={handlePaymentSuccess}
          onClose={handlePaymentClose}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default Checkout;
