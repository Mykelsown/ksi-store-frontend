// src/pages/Checkout.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/useApp";
import { createOrder } from "../api/orders";
import { createPaymentIntent } from "../api/payments";
import "./Checkout.css";

export default function Checkout() {
  const { cart, cartTotal, clearCart, user, showToast } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shipping, setShipping] = useState({
    name: user?.name || "",
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingZipCode: "",
    shippingCountry: "Nigeria",
    contactPhone: "",
    notes: "",
  });

  const unwrap = (response) => response?.data || response;

  const placeOrder = async () => {
    if (
      !shipping.shippingAddress ||
      !shipping.shippingCity ||
      !shipping.shippingState ||
      !shipping.shippingZipCode ||
      !shipping.shippingCountry ||
      !shipping.contactPhone
    ) {
      showToast("Please complete shipping details");
      return;
    }

    setLoading(true);
    try {
      const orderBody = {
        shippingAddress: shipping.shippingAddress,
        shippingCity: shipping.shippingCity,
        shippingState: shipping.shippingState,
        shippingZipCode: shipping.shippingZipCode,
        shippingCountry: shipping.shippingCountry,
        contactPhone: shipping.contactPhone,
        notes: shipping.notes,
      };

      const orderRes = await createOrder(orderBody);
      const orderPayload = unwrap(orderRes);
      const orderId = orderPayload?.id || orderPayload?.orderId;

      let paymentIntent = null;
      try {
        paymentIntent = await createPaymentIntent({ orderId, currency: "usd" });
      } catch (err) {
        console.warn("Payment intent creation failed", err);
      }

      await clearCart();
      if (paymentIntent?.data?.paymentIntentId) {
        showToast("Order placed. Payment intent created successfully.");
      } else {
        showToast("Order placed successfully");
      }
      navigate("/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Could not place order";
      console.error("Place order failed", err.response?.data || err);
      showToast(message);
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
              <input
                value={shipping.name}
                onChange={(e) =>
                  setShipping({ ...shipping, name: e.target.value })
                }
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                value={shipping.shippingAddress}
                onChange={(e) =>
                  setShipping({ ...shipping, shippingAddress: e.target.value })
                }
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                value={shipping.shippingCity}
                onChange={(e) =>
                  setShipping({ ...shipping, shippingCity: e.target.value })
                }
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                value={shipping.shippingState}
                onChange={(e) =>
                  setShipping({ ...shipping, shippingState: e.target.value })
                }
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Zip Code</label>
              <input
                value={shipping.shippingZipCode}
                onChange={(e) =>
                  setShipping({ ...shipping, shippingZipCode: e.target.value })
                }
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input
                value={shipping.shippingCountry}
                onChange={(e) =>
                  setShipping({ ...shipping, shippingCountry: e.target.value })
                }
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                value={shipping.contactPhone}
                onChange={(e) =>
                  setShipping({ ...shipping, contactPhone: e.target.value })
                }
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={shipping.notes}
                onChange={(e) =>
                  setShipping({ ...shipping, notes: e.target.value })
                }
                disabled={loading}
                rows={4}
              />
            </div>
          </div>

          <div className="checkout-right">
            <h3>Order Summary</h3>
            <div className="order-items">
              {cart.length === 0 ? (
                <div className="empty-state">Your cart is empty</div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="item-left">
                      <div className="item-thumb">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          item.emoji
                        )}
                      </div>
                      <div className="item-meta">
                        <div className="item-name">{item.name}</div>
                        <div className="item-qty">Qty: {item.qty}</div>
                      </div>
                    </div>
                    <div className="item-price">
                      ₦{(item.price * item.qty).toLocaleString()}
                    </div>
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

              <button
                className="btn-primary"
                onClick={placeOrder}
                disabled={loading || cart.length === 0}
              >
                {loading ? "Placing order…" : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
