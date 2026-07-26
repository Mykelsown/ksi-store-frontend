import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { getLowStockProducts } from "../api/products";
import "./LowStockWidget.css";

export default function LowStockWidget() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await getLowStockProducts();
        const payload = response?.data || response;
        if (!cancelled) setProducts(Array.isArray(payload) ? payload : []);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <p className="admin-section-label">Inventory</p>
          <h2>Low Stock Alerts</h2>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p className="low-stock-empty">All products are well-stocked.</p>
      ) : (
        <div className="low-stock-list">
          {products.map((p) => (
            <div key={p.id} className="low-stock-item">
              <AlertTriangle
                size={16}
                color={p.stock <= 0 ? "#dc2626" : "#d97706"}
              />
              <span className="low-stock-name">{p.name}</span>
              <span className="low-stock-count">
                {p.stock <= 0 ? "Out of stock" : `${p.stock} left`}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
