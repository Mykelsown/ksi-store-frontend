// src/components/ProductCard.jsx
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useApp();
  const navigate = useNavigate();
  const wishlisted = isWishlisted(product.id);

  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
      {/* Image Area */}
      <div className="card-image">
        {product.badge && (
          <span className={`card-badge ${product.badge}`}>
            {product.badge === 'sale' ? 'Sale' : 'New'}
          </span>
        )}
        <button
          className={`card-wishlist ${wishlisted ? 'active' : ''}`}
          onClick={e => { e.stopPropagation(); toggleWishlist(product); }}
          aria-label="Toggle wishlist"
        >
          {wishlisted ? '❤️' : '🤍'}
        </button>
        <span className="card-emoji">{product.emoji}</span>
      </div>

      {/* Body */}
      <div className="card-body">
        <div className="card-brand">{product.brand}</div>
        <div className="card-name">{product.name}</div>
        <div className="card-rating">
          <span className="stars">
            {'★'.repeat(Math.floor(product.rating))}
            {'☆'.repeat(5 - Math.floor(product.rating))}
          </span>
          <span className="review-count">{product.rating} ({product.reviews.toLocaleString()})</span>
        </div>
        <div className="card-price">
          <span className="price-now">₦{product.price.toLocaleString()}</span>
          {product.oldPrice && (
            <>
              <span className="price-old">₦{product.oldPrice.toLocaleString()}</span>
              <span className="price-off">{discount}% off</span>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="card-footer">
        <button
          className="add-to-cart"
          onClick={e => { e.stopPropagation(); addToCart(product); }}
        >
          🛒 Add to Cart
        </button>
      </div>
    </div>
  );
}
