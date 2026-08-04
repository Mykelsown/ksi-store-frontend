// src/pages/PaymentVerify.jsx
//
// Paystack's callback_url lands here with ?reference=PS_...
// This page is only ever reached via a browser redirect (not the popup path).
// The popup path verifies inside Checkout.jsx's callback handler.

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/useApp";
import { verifyPaystackTransaction } from "../api/paystack";

export default function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const { showToast, clearCart } = useApp();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your payment…");
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "failed"

  useEffect(() => {
    const reference = searchParams.get("reference");

    if (!reference) {
      setMessage("No payment reference found.");
      setStatus("failed");
      setTimeout(() => navigate("/dashboard"), 3000);
      return;
    }

    verifyPaystackTransaction(reference)
      .then(async (res) => {
        const data = res?.data || res;
        if (data?.success) {
          await clearCart();
          setMessage("Payment confirmed! Your order is being processed.");
          setStatus("success");
          showToast("Payment successful!", "success");
          setTimeout(() => navigate("/dashboard"), 2500);
        } else {
          throw new Error("Verification returned non-success");
        }
      })
      .catch(() => {
        setMessage(
          "Could not confirm payment. If money was deducted, contact support with your reference: " +
            reference,
        );
        setStatus("failed");
        showToast("Payment verification failed. Contact support.", "error");
        setTimeout(() => navigate("/dashboard"), 5000);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const icon = status === "success" ? "🎉" : status === "failed" ? "⚠️" : null;

  return (
    <div className="section">
      <div
        className="container"
        style={{ maxWidth: 480, textAlign: "center", padding: "5rem 1rem" }}
      >
        {status === "loading" && (
          <div
            style={{
              width: 52,
              height: 52,
              border: "4px solid #f0f0f0",
              borderTopColor: "var(--primary, #f97316)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1.5rem",
            }}
          />
        )}
        {icon && (
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{icon}</div>
        )}
        <p style={{ color: "#555", lineHeight: 1.6 }}>{message}</p>
        {status !== "loading" && (
          <button
            className="btn-primary"
            style={{ marginTop: "2rem" }}
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
