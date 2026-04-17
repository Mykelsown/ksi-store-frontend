// src/components/ProductCard.jsx
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { useApp } from "../context/useApp";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useApp();
  const navigate = useNavigate();
  const wishlisted = isWishlisted(product.id);

  // Get product image (first image or placeholder)
  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://via.placeholder.com/300x300?text=No+Image";

  // Show "New" badge for featured products, otherwise show if in stock
  const showBadge = product.featured ? "new" : null;

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Image Area */}
      <div className="card-image">
        {showBadge && (
          <span className={`card-badge ${showBadge}`}>
            {showBadge === "new" ? "Featured" : "New"}
          </span>
        )}
        <button
          className={`card-wishlist ${wishlisted ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label="Toggle wishlist"
        >
          <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
        </button>
        <img
          src={imageUrl}
          alt={product.name}
          className="product-image"
          style={{ width: "100%", height: "200px", objectFit: "cover" }}
        />
      </div>

      {/* Body */}
      <div className="card-body">
        <div className="card-brand">{product.brand}</div>
        <div className="card-name">{product.name}</div>
        <div className="card-rating">
          <span className="stars">
            {"★".repeat(Math.floor(product.rating || 0))}
            {"☆".repeat(5 - Math.floor(product.rating || 0))}
          </span>
          <span className="review-count">
            {product.rating || 0} ({(product.numReviews || 0).toLocaleString()})
          </span>
        </div>
        <div className="card-price">
          <span className="price-now">
            ₦
            {(product.price || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          {product.stock > 0 ? (
            <span
              className="stock-status"
              style={{ color: "green", fontSize: "0.85rem" }}
            >
              {product.stock} in stock
            </span>
          ) : (
            <span
              className="stock-status"
              style={{ color: "red", fontSize: "0.85rem" }}
            >
              Out of stock
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="card-footer">
        <button
          className="add-to-cart"
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
        >
          <ShoppingCart size={16} /> Add to Cart
        </button>
      </div>
    </div>
  );
}
