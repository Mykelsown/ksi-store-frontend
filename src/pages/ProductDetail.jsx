// src/pages/ProductDetail.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { useApp } from '../context/AppContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useApp();
  const product = products.find(p => p.id === Number(id));

  if (!product) {
    return (
      <div className="section">
        <div className="container empty-state">
          <div className="empty-icon">😕</div>
          <h3>Product not found</h3>
          <p>This product doesn't exist or has been removed.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;

  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="product-detail-page">
      <section className="section">
        <div className="container">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          <div className="detail-layout">
            {/* Image */}
            <div className="detail-image-wrap">
              <div className="detail-image">{product.emoji}</div>
              {product.badge && (
                <span className={`card-badge ${product.badge}`} style={{ position: 'static', display: 'inline-block', marginTop: '1rem' }}>
                  {product.badge === 'sale' ? '🔥 On Sale' : '✨ New'}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="detail-info">
              <div className="detail-brand">{product.brand}</div>
              <h1 className="detail-name">{product.name}</h1>

              <div className="detail-rating">
                <span className="stars">
                  {'★'.repeat(Math.floor(product.rating))}
                  {'☆'.repeat(5 - Math.floor(product.rating))}
                </span>
                <span>{product.rating} · {product.reviews.toLocaleString()} reviews</span>
              </div>

              <div className="detail-price-row">
                <span className="detail-price">₦{product.price.toLocaleString()}</span>
                {product.oldPrice && (
                  <>
                    <span className="detail-old">₦{product.oldPrice.toLocaleString()}</span>
                    <span className="detail-off">{discount}% off</span>
                  </>
                )}
              </div>

              <p className="detail-desc">{product.desc}</p>

              <div className="detail-specs">
                <h3>Specifications</h3>
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} className="spec-row">
                    <span className="spec-key">{k}</span>
                    <span className="spec-val">{v}</span>
                  </div>
                ))}
              </div>

              <div className="detail-actions">
                <button className="btn-primary" onClick={() => addToCart(product)}>
                  🛒 Add to Cart
                </button>
                <button
                  className={`btn-outline ${isWishlisted(product.id) ? 'wishlisted' : ''}`}
                  onClick={() => toggleWishlist(product)}
                >
                  {isWishlisted(product.id) ? '❤️ Wishlisted' : '🤍 Wishlist'}
                </button>
              </div>

              <div className="detail-assurance">
                <span>🚚 Fast delivery</span>
                <span>✅ Genuine product</span>
                <span>↩️ 15-day returns</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>Related Products</h2>
            <div className="products-grid-4">
              {related.map(p => (
                <div
                  key={p.id}
                  className="related-card"
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  <div className="related-img">{p.emoji}</div>
                  <div className="related-info">
                    <div className="card-brand">{p.brand}</div>
                    <div className="card-name">{p.name}</div>
                    <div className="price-now">₦{p.price.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
