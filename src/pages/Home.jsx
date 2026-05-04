// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Headphones,
  Laptop,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Truck,
} from "lucide-react";
import { getProducts } from "../api/products";
import ProductCard from "../components/ProductCard";
import "./Home.css";

function useCountdown(initialSeconds) {
  const [time, setTime] = useState(initialSeconds);
  useEffect(() => {
    const t = setInterval(() => setTime((s) => (s <= 0 ? 86400 : s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(time / 3600)).padStart(2, "0");
  const m = String(Math.floor((time % 3600) / 60)).padStart(2, "0");
  const s = String(time % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function Home() {
  const navigate = useNavigate();
  const countdown = useCountdown(3 * 3600 + 24 * 60 + 17);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const response = await getProducts({ limit: 60 });
        const payload = response?.data || response;
        const list = payload?.products || [];

        if (!cancelled) {
          setProducts(list);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
        }
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const featured = products.slice(0, 8);
  const deals = products.filter((p) => p.featured).slice(0, 4);
  const categories = [
    { label: "Smartphones", value: "phones" },
    { label: "Laptops", value: "laptops" },
    { label: "Accessories", value: "accessories" },
  ];
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))]
    .slice(0, 8)
    .map((name) => ({ name }));

  return (
    <div className="home-page">
      {/* HERO */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Galaxy S25 Ultra
              <br />
              <span>Redefine Possible</span>
            </h1>
            <p className="hero-sub">
              200MP camera · 5000mAh battery · S Pen included
            </p>
            <div className="hero-price">
              From <strong>₦850,000</strong>
            </div>
            <div className="hero-btns">
              <button
                className="btn-primary"
                onClick={() => navigate("/phones")}
              >
                Shop Now
              </button>
              <button className="btn-ghost" onClick={() => navigate("/deals")}>
                View Deals
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="phone-mockup">
              <Smartphone size={72} />
            </div>
          </div>
        </div>
        <div className="hero-dots">
          <span className="dot active" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </section>

      {/* PROMO BANNERS */}
      <section className="promo-section">
        <div className="container">
          <div className="promo-grid">
            <div
              className="promo-card promo-green"
              onClick={() => navigate("/phones")}
            >
              <div className="promo-label">Up to 30% off</div>
              <div className="promo-title">Latest iPhones</div>
              <div className="promo-emoji">
                <Smartphone size={36} />
              </div>
            </div>
            <div
              className="promo-card promo-dark"
              onClick={() => navigate("/laptops")}
            >
              <div className="promo-label">Best Sellers</div>
              <div className="promo-title">MacBook Pro M4</div>
              <div className="promo-emoji">
                <Laptop size={36} />
              </div>
            </div>
            <div
              className="promo-card promo-accent"
              onClick={() => navigate("/deals")}
            >
              <div className="promo-label">Flash Sale</div>
              <div className="promo-title">Accessories</div>
              <div className="promo-emoji">
                <Headphones size={36} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <span className="see-all" onClick={() => navigate("/phones")}>
              See all →
            </span>
          </div>
          <div className="categories-row">
            {categories.map((cat) => (
              <div
                key={cat.label}
                className="cat-pill"
                onClick={() => navigate(`/${cat.value}`)}
              >
                {cat.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <span className="see-all" onClick={() => navigate("/phones")}>
              View all →
            </span>
          </div>
          <div className="products-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* FLASH DEALS */}
      <section className="flash-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title white">Flash Deals</h2>
            <div className="countdown">{countdown}</div>
          </div>
          <div className="products-grid">
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section className="section">
        <div className="container">
          <h2
            className="section-title"
            style={{ textAlign: "center", marginBottom: "2rem" }}
          >
            Top Brands
          </h2>
          <div className="brands-row">
            {brands.map((b) => (
              <div
                key={b.name}
                className="brand-logo"
                onClick={() => navigate("/phones")}
              >
                {b.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="why-section">
        <div className="container">
          <div className="why-grid">
            {[
              {
                icon: Truck,
                title: "Fast Delivery",
                desc: "Same-day delivery in Lagos. Nationwide in 3–5 days.",
              },
              {
                icon: ShieldCheck,
                title: "Secure Payment",
                desc: "Multiple payment options. 100% safe and encrypted.",
              },
              {
                icon: RotateCcw,
                title: "Easy Returns",
                desc: "15-day hassle-free returns on all products.",
              },
              {
                icon: ShieldCheck,
                title: "Genuine Products",
                desc: "All products 100% authentic and warranty-backed.",
              },
            ].map((w) => (
              <div key={w.title} className="why-card">
                <div className="why-icon">
                  <w.icon size={20} />
                </div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
