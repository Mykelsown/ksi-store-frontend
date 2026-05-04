// src/components/ProductCard.jsx
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { useApp } from "../context/useApp";
import { formatPrice, formatRating, formatReviewCount, formatStockStatus, formatBrand } from "../utils/formatting";
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
        <div className="card-brand">{formatBrand(product.brand)}</div>
        <div className="card-name" title={product.name}>{product.name}</div>
        <div className="card-rating">
          <span className="stars" title={`${product.rating || 0} out of 5 stars`}>
            {formatRating(product.rating)}
          </span>
          <span className="review-count">
            {(Number(product.rating) || 0).toFixed(1)} ({formatReviewCount(product.numReviews)})
          </span>
        </div>
        <div className="card-price">
          <span className="price-now">
            {formatPrice(product.price)}
          </span>
          <span
            className="stock-status"
            style={{ color: product.stock > 0 ? "green" : "red", fontSize: "0.85rem" }}
          >
            {formatStockStatus(product.stock)}
          </span>
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
