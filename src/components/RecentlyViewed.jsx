import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentlyViewed } from "../utils/recentlyViewed";
import { formatPrice, formatBrand } from "../utils/formatting";
import "./RecentlyViewed.css";

export default function RecentlyViewed({ excludeId }) {
  const navigate = useNavigate();
  const items = useMemo(
    () => getRecentlyViewed().filter((p) => p.id !== excludeId).slice(0, 6),
    [excludeId],
  );

  if (items.length === 0) return null;

  return (
    <section className="recently-viewed">
      <div className="container">
        <h2 className="section-title" style={{ marginBottom: "1.25rem" }}>
          Recently Viewed
        </h2>
        <div className="recently-viewed-row">
          {items.map((p) => {
            const imageUrl =
              p.images && p.images.length > 0
                ? p.images[0]
                : "https://via.placeholder.com/160x160?text=No+Image";
            return (
              <div
                key={p.id}
                className="recently-viewed-card"
                onClick={() => navigate(`/product/${p.id}`)}
              >
                <img src={imageUrl} alt={p.name} />
                <div className="recently-viewed-brand">{formatBrand(p.brand)}</div>
                <div className="recently-viewed-name" title={p.name}>
                  {p.name}
                </div>
                <div className="recently-viewed-price">{formatPrice(p.price)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
