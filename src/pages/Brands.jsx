// src/pages/Brands.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../api/products";
import "./Brands.css";

export default function Brands() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadBrands = async () => {
      try {
        const response = await getProducts({ limit: 120 });
        const payload = response?.data || response;
        const products = payload?.products || [];

        const byBrand = products.reduce((acc, product) => {
          const key = product.brand || "Unknown";
          if (!acc[key]) {
            acc[key] = {
              name: key,
              count: 0,
              category: product.category || "Smartphones",
            };
          }
          acc[key].count += 1;
          return acc;
        }, {});

        const list = Object.values(byBrand)
          .sort((a, b) => b.count - a.count)
          .map((brand) => ({
            ...brand,
            desc: `${brand.count} product${brand.count === 1 ? "" : "s"} available`,
          }));

        if (!cancelled) {
          setBrands(list);
        }
      } catch {
        if (!cancelled) {
          setBrands([]);
        }
      }
    };

    void loadBrands();

    return () => {
      cancelled = true;
    };
  }, []);

  const toCategoryRoute = (category) => {
    if (category === "Laptops") return "/laptops";
    if (category === "Accessories" || category === "Audio")
      return "/accessories";
    return "/phones";
  };

  return (
    <div className="section">
      <div className="container">
        <h1
          className="section-title"
          style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
        >
          Our Brands
        </h1>
        <p style={{ color: "var(--text-2)", marginBottom: "2rem" }}>
          We partner with the world's leading technology brands.
        </p>
        <div className="brands-cards-grid">
          {brands.map((b) => (
            <div
              key={b.name}
              className="brand-card"
              onClick={() => navigate(toCategoryRoute(b.category))}
            >
              <div className="brand-big">
                {b.name.slice(0, 1).toUpperCase()}
              </div>
              <h3>{b.name}</h3>
              <p>{b.desc}</p>
              <span className="brand-shop">Shop now →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
