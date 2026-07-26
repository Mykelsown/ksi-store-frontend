import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import { useApp } from "../context/useApp";
import { getProfile } from "../api/users";
import { getMyOrderStats, getMyOrders, downloadInvoice } from "../api/orders";
import AddressBook from "../components/AddressBook";
import "./Dashboard.css";

const ACTIVE_ORDER_STATUSES = ["pending", "processing", "shipped"];
const POLL_INTERVAL_MS = 20000;

export default function Dashboard() {
  const { cartCount, wishlist, cartTotal, user, showToast } = useApp();
  const [profile, setProfile] = useState(user || null);
  const [orderStats, setOrderStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  // Bumped on mount and, while an order is still active, every POLL_INTERVAL_MS —
  // both cases just need the effect below to re-run and re-fetch.
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadDashboardData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        return;
      }

      try {
        const [profileResponse, statsResponse, ordersResponse] =
          await Promise.all([
            getProfile(),
            getMyOrderStats(),
            getMyOrders({ page: 1, limit: 3 }),
          ]);

        if (cancelled) return;

        setProfile(profileResponse?.data || profileResponse || null);
        setOrderStats(statsResponse?.data || statsResponse || null);

        const ordersPayload = ordersResponse?.data || ordersResponse;
        setRecentOrders(ordersPayload?.orders || []);
      } catch {
        if (!cancelled) setRecentOrders([]);
      }
    };

    void loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  // Poll while any recent order is still in an active (non-final) state,
  // so status/payment updates from webhooks show up without a manual refresh.
  const hasActiveOrder = recentOrders.some((order) =>
    ACTIVE_ORDER_STATUSES.includes(order.status),
  );

  useEffect(() => {
    if (!hasActiveOrder) return;

    const interval = setInterval(() => {
      setRefreshTick((tick) => tick + 1);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [hasActiveOrder]);

  const handleDownloadInvoice = async (orderId) => {
    try {
      const blob = await downloadInvoice(orderId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${orderId.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast?.("Couldn't download invoice");
    }
  };

  const firstName = profile?.name?.trim()?.split(/\s+/)?.[0] || "there";

  return (
    <div className="section dashboard-page">
      <div className="container">
        <div className="dashboard-hero">
          <div>
            <p className="dashboard-kicker">Personalized dashboard</p>
            <h1>Welcome back, {firstName}.</h1>
            <p className="dashboard-subtitle">
              Review your saved items, shopping progress, and account status
              from one place.
            </p>
          </div>
          <div className="dashboard-chip-row">
            <div className="dashboard-chip">
              <span>Cart items</span>
              <strong>{cartCount}</strong>
            </div>
            <div className="dashboard-chip">
              <span>Wishlist items</span>
              <strong>{wishlist.length}</strong>
            </div>
            <div className="dashboard-chip">
              <span>Cart total</span>
              <strong>₦{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
            <div className="dashboard-chip">
              <span>Total orders</span>
              <strong>{orderStats?.total || 0}</strong>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <article className="dashboard-card dashboard-card--accent">
            <h2>Account summary</h2>
            <p>
              Signed in as <strong>{profile?.email || "your account"}</strong>.
            </p>
            <p>
              Keep your profile up to date so delivery and order notifications
              stay accurate.
            </p>
            <Link to="/account" className="btn-primary dashboard-btn">
              Manage account
            </Link>
          </article>

          <article className="dashboard-card">
            <h2>Quick actions</h2>
            <div className="dashboard-actions">
              <Link to="/phones" className="dashboard-action-link">
                Browse phones
              </Link>
              <Link to="/cart" className="dashboard-action-link">
                Open cart
              </Link>
              <Link to="/wishlist" className="dashboard-action-link">
                View wishlist
              </Link>
              <Link to="/checkout" className="dashboard-action-link">
                Continue to checkout
              </Link>
            </div>
          </article>

          <article className="dashboard-card">
            <h2>Recent orders</h2>
            {recentOrders.length === 0 ? (
              <p>No recent orders yet. <Link to="/phones" style={{ color: 'var(--primary)' }}>Start shopping</Link></p>
            ) : (
              <div className="dashboard-actions">
                {recentOrders.map((order) => (
                  <div key={order.id} className="dashboard-action-link" style={{ padding: '0.75rem', backgroundColor: '#f5f5f5', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>#{order.id?.slice(0, 8) || 'N/A'}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666', textTransform: 'capitalize' }}>Status: {order.status}</div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>₦{Number(order.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(order.id)}
                        title="Download invoice"
                        style={{ background: 'none', border: '1.5px solid var(--border)', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer', display: 'flex' }}
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="dashboard-card">
            <h2>Saved Addresses</h2>
            <AddressBook />
          </article>
        </div>
      </div>
    </div>
  );
}
