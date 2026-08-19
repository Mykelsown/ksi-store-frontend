// src/pages/Checkout.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tag } from "lucide-react";
import { useApp } from "../context/useApp";
import { createOrder } from "../api/orders";
import {
  initializePaystackTransaction,
  verifyPaystackTransaction,
} from "../api/paystack";
import { validateCoupon } from "../api/coupons";
import { getAddresses } from "../api/addresses";
import "./Checkout.css";

// ---------------------------------------------------------------------------
// Inline Paystack popup loader
// Paystack's JS SDK is loaded on demand so it doesn't slow the initial bundle.
// ---------------------------------------------------------------------------
function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve(window.PaystackPop);
      return;
    }
    const existing = document.getElementById("paystack-js");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.PaystackPop));
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.id = "paystack-js";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve(window.PaystackPop);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// ---------------------------------------------------------------------------
// STEP ENUM
// ---------------------------------------------------------------------------
const STEP = {
  SHIPPING: "shipping",
  VERIFYING: "verifying",
  SUCCESS: "success",
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function Checkout() {
  const { cart, cartTotal, clearCart, user, showToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(STEP.SHIPPING);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [verifyMsg, setVerifyMsg] = useState("Verifying your payment…");
  const [feeBreakdown, setFeeBreakdown] = useState(null);

  const [shipping, setShipping] = useState({
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
      shippingAddress: address.street || address.shippingAddress || "",
      shippingCity: address.city || address.shippingCity || "",
      shippingState: address.state || address.shippingState || "",
      shippingZipCode: address.zipCode || address.shippingZipCode || "",
      shippingCountry: address.country || address.shippingCountry || "Nigeria",
      contactPhone: address.phone || address.contactPhone || "",
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

  // ── Handle Paystack callback redirect ─────────────────────────────────────
  // When Paystack redirects back to /checkout?reference=PS_... we auto-verify.
  useEffect(() => {
    const ref = searchParams.get("reference");
    if (!ref || !ref.startsWith("PS_")) return;

    setStep(STEP.VERIFYING);
    setVerifyMsg("Confirming your payment with Paystack…");

    verifyPaystackTransaction(ref)
      .then((res) => {
        const data = res?.data || res;
        if (data?.success) {
          clearCart();
          setStep(STEP.SUCCESS);
          showToast("Payment confirmed! Your order is being processed.", "success");
        } else {
          showToast("Payment verification failed. Please contact support.");
          navigate("/dashboard");
        }
      })
      .catch(() => {
        showToast("Could not verify payment. Contact support if money was deducted.");
        navigate("/dashboard");
      });
  // Intentionally run once on mount when reference is in URL
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateShipping = () => {
    const required = [
      ["shippingAddress", "Address"],
      ["shippingCity", "City"],
      ["shippingState", "State"],
      ["shippingZipCode", "Zip code"],
      ["shippingCountry", "Country"],
      ["contactPhone", "Phone number"],
    ];
    for (const [field, label] of required) {
      if (!shipping[field]?.trim()) {
        showToast(`${label} is required`);
        return false;
      }
    }
    return true;
  };

  // ── Place order + open Paystack ────────────────────────────────────────────
  const placeOrder = async () => {
    if (!user?.id) {
      showToast("Please sign in to continue");
      navigate("/account");
      return;
    }
    if (cart.length === 0) {
      showToast("Your cart is empty");
      return;
    }
    if (!validateShipping()) return;

    if (!user?.id && (!guestInfo.guestName || !guestInfo.guestEmail)) {
      showToast("Please enter your name and email to check out as a guest");
      return;
    }

    setLoading(true);
    try {
      // 1. Create the order on the backend (deducts stock, persists address)
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
      const orderData = orderRes?.data || orderRes;
      const orderId = orderData?.id || orderData?.orderId;

      if (!orderId) throw new Error("Order creation did not return an ID");

      // 2. Initialize Paystack transaction (server calculates gross-up fee)
      const paystackRes = await initializePaystackTransaction(orderId);
      const txData = paystackRes?.data || paystackRes;

      setFeeBreakdown({
        original: txData.originalAmountNaira,
        fee: txData.feeChargedNaira,
        total: txData.finalAmountNaira,
      });

      // 3. Load Paystack inline popup and open it
      const PaystackPop = await loadPaystackScript();

      const handler = PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: txData.finalAmountKobo, // already in kobo from backend
        ref: txData.reference,
        currency: "NGN",
        label: `KSI Gadgets – Order ${orderId.slice(0, 8)}`,
        metadata: {
          orderId,
          custom_fields: [
            {
              display_name: "Order ID",
              variable_name: "order_id",
              value: orderId,
            },
          ],
        },
        onClose: () => {
          showToast("Payment window closed. Your order is saved – you can pay later from your dashboard.");
          setLoading(false);
          navigate("/dashboard");
        },
        callback: async (response) => {
          // 4. Verify on our backend immediately after popup reports success
          setStep(STEP.VERIFYING);
          setVerifyMsg("Confirming your payment…");
          try {
            const verify = await verifyPaystackTransaction(response.reference);
            const verifyData = verify?.data || verify;
            if (verifyData?.success) {
              await clearCart();
              setStep(STEP.SUCCESS);
              showToast("Payment confirmed! Order is being processed.", "success");
            } else {
              showToast("Payment received but verification failed. We'll sort it out.");
              navigate("/dashboard");
            }
          } catch {
            showToast("Could not verify payment automatically. Check your dashboard.");
            navigate("/dashboard");
          }
        },
      });

      handler.openIframe();
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Could not place order";
      console.error("placeOrder error:", err?.response?.data || err);
      showToast(message, "error");
      setLoading(false);
    }
    // NOTE: setLoading(false) is intentionally NOT in finally here because
    // the Paystack popup is async. Loading state is cleared in onClose/callback.
  };

  // ── Render: success state ──────────────────────────────────────────────────
  if (step === STEP.SUCCESS) {
    return (
      <div className="section">
        <div className="container" style={{ maxWidth: 480, textAlign: "center", padding: "4rem 1rem" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🎉</div>
          <h2 style={{ marginBottom: "0.5rem" }}>Payment Successful!</h2>
          <p style={{ color: "#555", marginBottom: "2rem" }}>
            Your order has been confirmed and is being processed. You'll receive updates soon.
          </p>
          <button className="btn-primary" onClick={() => navigate("/dashboard")} style={{ marginRight: "1rem" }}>
            View Dashboard
          </button>
          <button className="btn-outline" onClick={() => navigate("/")}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // ── Render: verifying state ────────────────────────────────────────────────
  if (step === STEP.VERIFYING) {
    return (
      <div className="section">
        <div className="container" style={{ maxWidth: 480, textAlign: "center", padding: "4rem 1rem" }}>
          <div className="checkout-spinner" />
          <p style={{ marginTop: "1.5rem", color: "#555" }}>{verifyMsg}</p>
        </div>
      </div>
    );
  }

  // ── Render: shipping form ──────────────────────────────────────────────────
  return (
    <div className="section">
      <div className="container">
        <h1 className="section-title">Checkout</h1>
        <div className="checkout-grid">

          {/* LEFT: Shipping form */}
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
                      {address.label || address.name || "Address"} — {address.street || address.shippingAddress}, {address.city || address.shippingCity}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {[
              { label: "Address", field: "shippingAddress", placeholder: "12 Admiralty Way" },
              { label: "City", field: "shippingCity", placeholder: "Lagos" },
              { label: "State", field: "shippingState", placeholder: "Lagos State" },
              { label: "Zip Code", field: "shippingZipCode", placeholder: "100001" },
              { label: "Country", field: "shippingCountry", placeholder: "Nigeria" },
              { label: "Phone", field: "contactPhone", placeholder: "+234 800 000 0000" },
            ].map(({ label, field, placeholder }) => (
              <div className="form-group" key={field}>
                <label>{label}</label>
                <input
                  value={shipping[field]}
                  placeholder={placeholder}
                  onChange={(e) => setShipping({ ...shipping, [field]: e.target.value })}
                  disabled={loading}
                />
              </div>
            ))}

            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea
                value={shipping.notes}
                placeholder="Any delivery instructions…"
                onChange={(e) => setShipping({ ...shipping, notes: e.target.value })}
                disabled={loading}
                rows={3}
              />
            </div>
          </div>

          {/* RIGHT: Order summary + fee breakdown + pay button */}
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
                          <span style={{ fontSize: "1.5rem" }}>📦</span>
                        )}
                      </div>
                      <div className="item-meta">
                        <div className="item-name">{item.name}</div>
                        <div className="item-brand">{item.brand}</div>
                        <div className="item-qty">Qty: {item.qty}</div>
                        <div style={{ fontSize: "0.82rem", color: "#666" }}>
                          ₦{item.price.toLocaleString(undefined, { minimumFractionDigits: 0 })} each
                        </div>
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
                <span>Subtotal ({cart.length} item{cart.length !== 1 ? "s" : ""})</span>
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
                <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                  {shippingCost === 0 ? "Free" : `₦${shippingCost.toLocaleString()}`}
                </span>
              </div>
              <div className="summary-row">
                <span>Tax (est.)</span>
                <span>₦{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {/* Paystack fee breakdown – shown after backend calculates it */}
              {feeBreakdown ? (
                <>
                  <div className="summary-row paystack-fee-row">
                    <span title="Paystack charges 1.5% (capped at ₦2,000). This fee is passed to you transparently.">
                      Paystack processing fee ⓘ
                    </span>
                    <span>₦{feeBreakdown.fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total charged</span>
                    <span>₦{feeBreakdown.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <p className="paystack-fee-note">
                    The ₦{feeBreakdown.fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} processing fee
                    covers Paystack's 1.5% transaction cost so you receive exactly
                    ₦{feeBreakdown.original.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.
                  </p>
                </>
              ) : (
                <div className="summary-row total">
                  <span>Total (est.)</span>
                  <span>₦{estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}

              <button
                className="btn-primary paystack-pay-btn"
                onClick={placeOrder}
                disabled={loading || cart.length === 0}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="btn-spinner" /> Processing…
                  </span>
                ) : (
                  <>
                    <span className="paystack-lock">🔒</span> Pay with Paystack
                  </>
                )}
              </button>

              <p className="paystack-secure-note">
                Secured by <strong>Paystack</strong>. Your card details are never stored on our servers.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
