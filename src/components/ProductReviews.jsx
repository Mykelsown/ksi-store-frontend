import { useEffect, useState } from "react";
import { BadgeCheck, Star } from "lucide-react";
import { useApp } from "../context/useApp";
import {
  getProductReviews,
  addProductReview,
} from "../api/products";
import { formatDate } from "../utils/formatting";
import "./ProductReviews.css";

export default function ProductReviews({ productId }) {
  const { user, showToast } = useApp();
  const [reviews, setReviews] = useState([]);
  const [sortBy, setSortBy] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const response = await getProductReviews(productId, sortBy);
        const payload = response?.data || response;
        if (!cancelled) setReviews(Array.isArray(payload) ? payload : []);
      } catch {
        if (!cancelled) setReviews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [productId, sortBy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      await addProductReview(productId, { rating, comment: comment.trim() });
      setComment("");
      setRating(5);
      showToast?.("Review submitted, thank you!");
      const response = await getProductReviews(productId, sortBy);
      const payload = response?.data || response;
      setReviews(Array.isArray(payload) ? payload : []);
    } catch (err) {
      showToast?.(
        err?.response?.data?.message || "Couldn't submit your review",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="reviews-header">
          <h2 className="section-title">Customer Reviews</h2>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Most Recent</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {user && (
          <form className="review-form" onSubmit={handleSubmit}>
            <div className="review-form-rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setRating(value)}
                  aria-label={`Rate ${value} stars`}
                >
                  <Star
                    size={20}
                    fill={value <= rating ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>
            <textarea
              placeholder="Share your experience with this product…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              required
            />
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

        {loading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="reviews-empty">No reviews yet. Be the first to review this product.</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-item-header">
                  <span className="review-stars">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                  {review.verifiedPurchase && (
                    <span className="review-verified">
                      <BadgeCheck size={14} /> Verified Purchase
                    </span>
                  )}
                  <span className="review-date">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <div className="review-author">{review.user?.name || "Anonymous"}</div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
