// src/pages/Wishlist.jsx
import { useNavigate } from "react-router-dom";
import { Heart, SearchCheck } from "lucide-react";
import { useApp } from "../context/useApp";
import ProductCard from "../components/ProductCard";

export default function Wishlist() {
  const { wishlist } = useApp();
  const navigate = useNavigate();

  return (
    <div className="section">
      <div className="container">
        <h1
          className="section-title"
          style={{ fontSize: "2rem", marginBottom: "2rem" }}
        >
          <Heart size={26} /> Wishlist
        </h1>
        {wishlist.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><SearchCheck size={32} /></div>
            <h3>No saved items yet</h3>
            <p>Tap the heart icon on any product to save it here.</p>
            <button className="btn-primary" onClick={() => navigate("/")}>
              Explore Products
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {wishlist.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
