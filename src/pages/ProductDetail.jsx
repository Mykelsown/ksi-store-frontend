// src/pages/ProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Heart,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useApp } from "../context/useApp";
import { getProductById, getProducts } from "../api/products";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useApp();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      try {
        const response = await getProductById(id);
        const productData = response?.data || response;

        if (!cancelled) {
          setProduct(productData || null);
        }

        if (!productData?.category) {
          return;
        }

        const relatedResponse = await getProducts({
          category: productData.category,
          limit: 5,
        });
        const relatedPayload = relatedResponse?.data || relatedResponse;
        const relatedProducts = (relatedPayload?.products || [])
          .filter((p) => p.id !== id)
          .slice(0, 4);

        if (!cancelled) {
          setRelated(relatedProducts);
        }
      } catch {
        if (!cancelled) {
          setProduct(null);
          setRelated([]);
        }
      }
    };

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!product) {
    return (
      <div className="section">
        <div className="container empty-state">
          <div className="empty-icon">
            <AlertCircle size={32} />
          </div>
          <h3>Product not found</h3>
          <p>This product doesn't exist or has been removed.</p>
          <button className="btn-primary" onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Get product image
  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://via.placeholder.com/400x400?text=No+Image";

  return (
    <div className="product-detail-page">
      <section className="section">
        <div className="container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <div className="detail-layout">
            {/* Image */}
            <div className="detail-image-wrap">
              <img
                src={imageUrl}
                alt={product.name}
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  borderRadius: "12px",
                }}
              />
              {product.featured && (
                <span
                  className="card-badge new"
                  style={{
                    position: "static",
                    display: "inline-block",
                    marginTop: "1rem",
                  }}
                >
                  Featured Product
                </span>
              )}
            </div>

            {/* Info */}
            <div className="detail-info">
              <div className="detail-brand">{product.brand}</div>
              <h1 className="detail-name">{product.name}</h1>

              <div className="detail-rating">
                <span className="stars">
                  {"★".repeat(Math.floor(product.rating || 0))}
                  {"☆".repeat(5 - Math.floor(product.rating || 0))}
                </span>
                <span>
                  {product.rating || 0} ·{" "}
                  {(product.numReviews || 0).toLocaleString()} reviews
                </span>
              </div>

              <div className="detail-price-row">
                <span className="detail-price">
                  ₦
                  {(product.price || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                {product.stock > 0 ? (
                  <span
                    style={{
                      color: "green",
                      fontSize: "1rem",
                      fontWeight: "500",
                    }}
                  >
                    ✓ {product.stock} in stock
                  </span>
                ) : (
                  <span
                    style={{
                      color: "red",
                      fontSize: "1rem",
                      fontWeight: "500",
                    }}
                  >
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
                <button
                  className="btn-primary"
                  onClick={() => addToCart(product)}
                >
                  <ShoppingCart size={16} /> Add to Cart
                </button>
                <button
                  className={`btn-outline ${isWishlisted(product.id) ? "wishlisted" : ""}`}
                  onClick={() => toggleWishlist(product)}
                >
                  <Heart
                    size={16}
                    fill={isWishlisted(product.id) ? "currentColor" : "none"}
                  />
                  {isWishlisted(product.id) ? " Wishlisted" : " Wishlist"}
                </button>
              </div>

              <div className="detail-assurance">
                <span>
                  <Truck size={14} /> Fast delivery
                </span>
                <span>
                  <CheckCircle2 size={14} /> Genuine product
                </span>
                <span>
                  <CheckCircle2 size={14} /> 15-day returns
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <h2 className="section-title" style={{ marginBottom: "1.25rem" }}>
              Related Products
            </h2>
            <div className="products-grid-4">
              {related.map((p) => {
                const relatedImage =
                  p.images && p.images.length > 0
                    ? p.images[0]
                    : "https://via.placeholder.com/200x200?text=No+Image";
                return (
                  <div
                    key={p.id}
                    className="related-card"
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    <img
                      src={relatedImage}
                      alt={p.name}
                      style={{
                        width: "100%",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                    <div className="related-info">
                      <div className="card-brand">{p.brand}</div>
                      <div className="card-name">{p.name}</div>
                      <div className="price-now">
                        ₦
                        {(p.price || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
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
