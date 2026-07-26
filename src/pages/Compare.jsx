import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, X } from "lucide-react";
import { getCompareList, removeFromCompare } from "../utils/compare";
import { formatPrice, formatBrand } from "../utils/formatting";
import "./Compare.css";

export default function Compare() {
  const navigate = useNavigate();
  const [items, setItems] = useState(getCompareList());

  useEffect(() => {
    const onChange = () => setItems(getCompareList());
    window.addEventListener("compare-list-changed", onChange);
    return () => window.removeEventListener("compare-list-changed", onChange);
  }, []);

  const specKeys = [
    ...new Set(items.flatMap((p) => Object.keys(p.specs || {}))),
  ];

  if (items.length === 0) {
    return (
      <div className="section">
        <div className="container empty-state">
          <div className="empty-icon">
            <Scale size={32} />
          </div>
          <h3>No products to compare</h3>
          <p>Add products from the shop to compare them side by side.</p>
          <button className="btn-primary" onClick={() => navigate("/")}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-page">
      <section className="section">
        <div className="container">
          <h1 className="section-title" style={{ marginBottom: "1.5rem" }}>
            Compare Products
          </h1>

          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th></th>
                  {items.map((p) => (
                    <th key={p.id}>
                      <button
                        className="compare-remove"
                        onClick={() => removeFromCompare(p.id)}
                        aria-label={`Remove ${p.name}`}
                      >
                        <X size={14} />
                      </button>
                      <img
                        src={
                          p.images?.[0] ||
                          "https://via.placeholder.com/160x160?text=No+Image"
                        }
                        alt={p.name}
                      />
                      <div className="compare-name">{p.name}</div>
                      <div className="compare-brand">{formatBrand(p.brand)}</div>
                      <button
                        className="btn-primary"
                        style={{ marginTop: "0.5rem" }}
                        onClick={() => navigate(`/product/${p.id}`)}
                      >
                        View
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="compare-row-label">Price</td>
                  {items.map((p) => (
                    <td key={p.id}>{formatPrice(p.price)}</td>
                  ))}
                </tr>
                <tr>
                  <td className="compare-row-label">Rating</td>
                  {items.map((p) => (
                    <td key={p.id}>{p.rating || "—"} / 5</td>
                  ))}
                </tr>
                <tr>
                  <td className="compare-row-label">Category</td>
                  {items.map((p) => (
                    <td key={p.id}>{p.category || "—"}</td>
                  ))}
                </tr>
                {specKeys.map((key) => (
                  <tr key={key}>
                    <td className="compare-row-label">{key}</td>
                    {items.map((p) => (
                      <td key={p.id}>{p.specs?.[key] || "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
