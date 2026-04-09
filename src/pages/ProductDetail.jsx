// src/pages/ProductDetail.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { useApp } from '../context/AppContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useApp();
  // Find product by UUID string (not Number)
  const product = products.find(p => p.id === id);

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

  // Get product image
  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://via.placeholder.com/400x400?text=No+Image';

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
              <img
                src={imageUrl}
                alt={product.name}
                style={{ width: '100%', maxWidth: '500px', borderRadius: '12px' }}
              />
              {product.featured && (
                <span className="card-badge new" style={{ position: 'static', display: 'inline-block', marginTop: '1rem' }}>
                  ✨ Featured Product
                </span>
              )}
            </div>

            {/* Info */}
            <div className="detail-info">
              <div className="detail-brand">{product.brand}</div>
              <h1 className="detail-name">{product.name}</h1>

              <div className="detail-rating">
                <span className="stars">
                  {'★'.repeat(Math.floor(product.rating || 0))}
                  {'☆'.repeat(5 - Math.floor(product.rating || 0))}
                </span>
                <span>{product.rating || 0} · {(product.numReviews || 0).toLocaleString()} reviews</span>
              </div>

              <div className="detail-price-row">
                <span className="detail-price">₦{(product.price || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                {product.stock > 0 ? (
                  <span style={{ color: 'green', fontSize: '1rem', fontWeight: '500' }}>
                    ✓ {product.stock} in stock
                  </span>
                ) : (
                  <span style={{ color: 'red', fontSize: '1rem', fontWeight: '500' }}>
                    ✗ Out of stock
                  </span>
                )}
              </div>

              <p className="detail-desc">{product.description}</p>

              {product.specs && (
                <div className="detail-specs">
                  <h3>Specifications</h3>
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div key={k} className="spec-row">
                      <span className="spec-key">{k}</span>
                      <span className="spec-val">{v}</span>
                    </div>
                  ))}
                </div>
              )}

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
              {related.map(p => {
                const relatedImage = p.images && p.images.length > 0 ? p.images[0] : 'https://via.placeholder.com/200x200?text=No+Image';
                return (
                  <div
                    key={p.id}
                    className="related-card"
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    <img src={relatedImage} alt={p.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div className="related-info">
                      <div className="card-brand">{p.brand}</div>
                      <div className="card-name">{p.name}</div>
                      <div className="price-now">₦{(p.price || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
