import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { getSalesAnalytics } from "../api/orders";
import { formatPrice } from "../utils/formatting";
import "./SalesAnalyticsChart.css";

export default function SalesAnalyticsChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await getSalesAnalytics(30);
        const payload = response?.data || response;
        if (!cancelled) setData(payload);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const revenueByDay = data?.revenueByDay || [];
  const maxRevenue = Math.max(1, ...revenueByDay.map((d) => d.revenue));

  return (
    <section className="admin-panel admin-span-2">
      <div className="admin-panel-header">
        <div>
          <p className="admin-section-label">Analytics</p>
          <h2>
            <TrendingUp size={18} style={{ verticalAlign: "-3px", marginRight: "0.4rem" }} />
            Revenue (Last 30 Days)
          </h2>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : revenueByDay.length === 0 ? (
        <p className="analytics-empty">No sales data for this period yet.</p>
      ) : (
        <div className="revenue-chart">
          {revenueByDay.map((day) => (
            <div key={day.date} className="revenue-bar-col" title={`${day.date}: ${formatPrice(day.revenue)}`}>
              <div
                className="revenue-bar"
                style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
              />
            </div>
          ))}
        </div>
      )}

      {data?.topProducts?.length > 0 && (
        <div className="top-products">
          <h3>Top Products</h3>
          <div className="top-products-list">
            {data.topProducts.slice(0, 5).map((p) => (
              <div key={p.productId} className="top-product-row">
                <span className="top-product-name">{p.productName}</span>
                <span className="top-product-qty">{p.quantity} sold</span>
                <span className="top-product-revenue">{formatPrice(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
