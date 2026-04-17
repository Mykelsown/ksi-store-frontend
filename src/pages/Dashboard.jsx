import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/useApp";
import { getProfile } from "../api/users";
import { getMyOrderStats, getMyOrders } from "../api/orders";
import "./Dashboard.css";

export default function Dashboard() {
  const { cartCount, wishlist, cartTotal, user } = useApp();
  const [profile, setProfile] = useState(user || null);
  const [orderStats, setOrderStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

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

        if (cancelled) {
          return;
        }

        setProfile(profileResponse?.data || profileResponse || null);
        setOrderStats(statsResponse?.data || statsResponse || null);

        const ordersPayload = ordersResponse?.data || ordersResponse;
        setRecentOrders(ordersPayload?.orders || []);
      } catch {
        if (!cancelled) {
          setRecentOrders([]);
        }
      }
    };

    void loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, []);

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
              <strong>₦{cartTotal.toLocaleString()}</strong>
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
              <p>No recent orders yet.</p>
            ) : (
              <div className="dashboard-actions">
                {recentOrders.map((order) => (
                  <div key={order.id} className="dashboard-action-link">
                    #{order.id.slice(0, 8)} • {order.status} • ₦
                    {Number(order.totalAmount || 0).toLocaleString()}
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
