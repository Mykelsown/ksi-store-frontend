// src/pages/Checkout.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../api/client';
import './Checkout.css';

export default function Checkout() {
  const { cart, cartTotal, clearCart, user, showToast } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shipping, setShipping] = useState({ name: user?.name || '', address: '', city: '', phone: '' });

  const placeOrder = async () => {
    if (!shipping.address || !shipping.city || !shipping.phone) {
      showToast('Please complete shipping details');
      return;
    }

    setLoading(true);
    try {
      const orderBody = {
        items: cart.map(i => ({ productId: i.id, qty: i.qty })),
        total: cartTotal,
        shipping,
        userId: user?.id || null,
      };

      const orderRes = await api.createOrder(orderBody);
      // If backend returns a payment intent/redirect, handle it here.
      // We'll attempt a payment creation if available.
      try {
        const payRes = await api.createPayment({ orderId: orderRes.id || orderRes.orderId || (orderRes.data && orderRes.data.id) });
        // if payRes contains a paymentUrl, redirect user
        const paymentUrl = payRes.paymentUrl || payRes.url || (payRes.data && payRes.data.paymentUrl);
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
        }
      } catch (err) {
        // payment creation failed — still proceed
        console.warn('Payment creation failed', err);
      }

      // success path
      clearCart();
      showToast('Order placed successfully');
      navigate('/');
    } catch (err) {
      console.error('Place order failed', err);
      showToast(err.message || 'Could not place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="section-title">Checkout</h1>
        <div className="checkout-grid">
          <div className="checkout-left">
            <h3>Shipping Details</h3>
            <div className="form-group">
              <label>Name</label>
              <input value={shipping.name} onChange={e => setShipping({ ...shipping, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input value={shipping.address} onChange={e => setShipping({ ...shipping, address: e.target.value })} />
            </div>
            <div className="form-group">
              <label>City</label>
              <input value={shipping.city} onChange={e => setShipping({ ...shipping, city: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={shipping.phone} onChange={e => setShipping({ ...shipping, phone: e.target.value })} />
            </div>
          </div>

          <div className="checkout-right">
            <h3>Order Summary</h3>
            <div className="order-items">
              {cart.length === 0 ? (
                <div className="empty-state">Your cart is empty</div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="order-item">
                    <div className="item-left">
                      <div className="item-thumb">{item.image ? <img src={item.image} alt={item.name} /> : item.emoji}</div>
                      <div className="item-meta">
                        <div className="item-name">{item.name}</div>
                        <div className="item-qty">Qty: {item.qty}</div>
                      </div>
                    </div>
                    <div className="item-price">₦{(item.price * item.qty).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₦{cartTotal.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₦{cartTotal.toLocaleString()}</span>
              </div>

              <button className="btn-primary" onClick={placeOrder} disabled={loading || cart.length === 0}>
                {loading ? 'Placing order…' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
