// src/pages/Checkout.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag } from "lucide-react";
import { useApp } from "../context/useApp";
import { createOrder } from "../api/orders";
import { createPaymentIntent } from "../api/payments";
import { validateCoupon } from "../api/coupons";
import { getAddresses } from "../api/addresses";
import "./Checkout.css";

export default function Checkout() {
  const { cart, cartTotal, clearCart, user, showToast } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
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
  const [guestInfo, setGuestInfo] = useState({
    guestName: "",
    guestEmail: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;
    const loadAddresses = async () => {
      try {
        const response = await getAddresses();
        const payload = response?.data || response;
        if (!cancelled) setAddresses(Array.isArray(payload) ? payload : []);
      } catch {
        if (!cancelled) setAddresses([]);
      }
    };
    void loadAddresses();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const applyAddress = (address) => {
    setShipping((prev) => ({
      ...prev,
      name: address.fullName,
      shippingAddress: address.street,
      shippingCity: address.city,
      shippingState: address.state,
      shippingZipCode: address.zipCode,
      shippingCountry: address.country,
      contactPhone: address.phone,
    }));
  };

  const handleAddressSelect = (id) => {
    setSelectedAddressId(id);
    const address = addresses.find((a) => a.id === id);
    if (address) applyAddress(address);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError("");
    setCouponLoading(true);
    try {
      const response = await validateCoupon(couponCode.trim(), cartTotal);
      const payload = response?.data || response;
      setAppliedCoupon(payload);
      showToast(`Coupon "${payload.coupon.code}" applied`);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(
        err?.response?.data?.message || "Invalid or expired coupon code",
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const discountedSubtotal = Math.max(0, cartTotal - discountAmount);
  const shippingCost = discountedSubtotal > 100 ? 0 : 10;
  const tax = discountedSubtotal * 0.1;
  const estimatedTotal = discountedSubtotal + shippingCost + tax;

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

    if (!user?.id && (!guestInfo.guestName || !guestInfo.guestEmail)) {
      showToast("Please enter your name and email to check out as a guest");
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
        couponCode: appliedCoupon?.coupon?.code,
      };

      if (!user?.id) {
        orderBody.guestName = guestInfo.guestName;
        orderBody.guestEmail = guestInfo.guestEmail;
        orderBody.items = cart.map((item) => ({
          productId: item.id,
          quantity: item.qty,
        }));
      }

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
      navigate(user?.id ? "/dashboard" : "/track-order");
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
            {!user?.id && (
              <>
                <h3>Your Details</h3>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    value={guestInfo.guestName}
                    onChange={(e) =>
                      setGuestInfo({ ...guestInfo, guestName: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={guestInfo.guestEmail}
                    onChange={(e) =>
                      setGuestInfo({ ...guestInfo, guestEmail: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
                <p className="checkout-guest-note">
                  Checking out as a guest. <a href="/account?tab=login">Sign in</a> to
                  use saved addresses and track orders from your dashboard.
                </p>
              </>
            )}

            <h3>Shipping Details</h3>

            {user?.id && addresses.length > 0 && (
              <div className="form-group">
                <label>Saved Addresses</label>
                <select
                  value={selectedAddressId}
                  onChange={(e) => handleAddressSelect(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Enter address manually</option>
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.label} — {address.street}, {address.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                          <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          item.emoji
                        )}
                      </div>
                      <div className="item-meta">
                        <div className="item-name">{item.name}</div>
                        <div className="item-brand" style={{ fontSize: '0.85rem', color: '#666' }}>{item.brand}</div>
                        <div className="item-qty">Qty: {item.qty}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>₦{item.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                      </div>
                    </div>
                    <div className="item-price">
                      ₦{(item.price * item.qty).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="coupon-box">
              {appliedCoupon ? (
                <div className="coupon-applied">
                  <span>
                    <Tag size={14} /> {appliedCoupon.coupon.code} applied
                  </span>
                  <button type="button" onClick={removeCoupon}>
                    Remove
                  </button>
                </div>
              ) : (
                <div className="coupon-input-row">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponLoading}
                  />
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                  >
                    {couponLoading ? "Checking..." : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <p className="coupon-error">{couponError}</p>}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal ({cart.length} items)</span>
                <span>₦{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {discountAmount > 0 && (
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span>
                    -₦{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="summary-row">
                <span>Shipping</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  {shippingCost === 0 ? "Free" : `₦${shippingCost.toLocaleString()}`}
                </span>
              </div>
              <div className="summary-row">
                <span>Tax (est.)</span>
                <span>₦{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="summary-row total">
                <span>Total (est.)</span>
                <span>₦{estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
