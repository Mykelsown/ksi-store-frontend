import { useState } from "react";
import { Package, Search as SearchIcon } from "lucide-react";
import { trackGuestOrder } from "../api/orders";
import { formatPrice, formatDate, formatOrderId } from "../utils/formatting";
import "./TrackOrder.css";

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);

    try {
      const response = await trackGuestOrder(orderNumber.trim(), email.trim());
      const data = response?.data || response;
      setOrder(data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "We couldn't find an order matching that order number and email.",
      );
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order
    ? STATUS_STEPS.indexOf(order.status)
    : -1;

  return (
    <div className="track-order-page">
      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <h1 className="section-title" style={{ marginBottom: "0.5rem" }}>
            Track Your Order
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Enter your order number and the email used at checkout.
          </p>

          <form className="track-order-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Order number (e.g. ORD-...)"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="btn-primary" type="submit" disabled={loading}>
              <SearchIcon size={16} /> {loading ? "Searching..." : "Track Order"}
            </button>
          </form>

          {error && <p className="track-order-error">{error}</p>}

          {order && (
            <div className="track-order-result">
              <div className="track-order-header">
                <Package size={20} />
                <div>
                  <div className="track-order-number">
                    {formatOrderId(order.id)} · {order.orderNumber}
                  </div>
                  <div className="track-order-date">
                    Placed on {formatDate(order.createdAt)}
                  </div>
                </div>
              </div>

              {order.status !== "cancelled" ? (
                <div className="track-order-steps">
                  {STATUS_STEPS.map((step, index) => (
                    <div
                      key={step}
                      className={`track-step ${
                        index <= currentStepIndex ? "active" : ""
                      }`}
                    >
                      <span className="track-step-dot" />
                      <span className="track-step-label">{step}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="track-order-cancelled">
                  This order was cancelled
                  {order.cancellationReason ? `: ${order.cancellationReason}` : "."}
                </div>
              )}

              {order.trackingNumber && (
                <div className="track-order-tracking">
                  Tracking number: <strong>{order.trackingNumber}</strong>
                </div>
              )}

              <div className="track-order-total">
                Total: {formatPrice(order.totalAmount)}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
