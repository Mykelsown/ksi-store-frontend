// src/pages/Cart.jsx
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Cart.css';

export default function Cart() {
  const { cart, removeFromCart, updateQty, clearCart, cartTotal, showToast } = useApp();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="section">
        <div className="container empty-state">
          <div className="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some gadgets to get started!</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Start Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page section">
      <div className="container">
        <div className="cart-header-row">
          <h1 className="cart-title">🛒 Your Cart <span className="cart-count">({cart.length} items)</span></h1>
          <button className="clear-cart-btn" onClick={() => { clearCart(); showToast('Cart cleared'); }}>
            Clear All
          </button>
        </div>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img">{item.emoji}</div>
                <div className="cart-item-info">
                  <div className="cart-item-brand">{item.brand}</div>
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">₦{item.price.toLocaleString()} each</div>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                    <span className="qty-num">{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                </div>
                <div className="cart-item-right">
                  <div className="cart-item-total">₦{(item.price * item.qty).toLocaleString()}</div>
                  <button className="remove-btn" onClick={() => { removeFromCart(item.id); showToast('Item removed'); }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal ({cart.reduce((s, c) => s + c.qty, 0)} items)</span>
              <span>₦{cartTotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Free</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₦{cartTotal.toLocaleString()}</span>
            </div>
            <button
              className="btn-primary"
              style={{ width: '100%', padding: '1rem', marginTop: '1.5rem', fontSize: '1rem' }}
              onClick={() => showToast('Order placed! Thank you 🎉')}
            >
              Proceed to Checkout
            </button>
            <button
              className="btn-outline"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.75rem' }}
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
