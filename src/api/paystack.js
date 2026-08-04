import api from "./client";

/**
 * GET /api/paystack/config
 * Returns the Paystack public key for initializing the frontend popup.
 */
export const getPaystackConfig = async () => {
  const res = await api.get("/paystack/config");
  return res.data;
};

/**
 * POST /api/paystack/initialize
 * Body: { orderId }
 *
 * Starts a Paystack transaction for a given order. Returns:
 *   authorizationUrl   - redirect/popup URL from Paystack
 *   reference          - our internal reference string (PS_...)
 *   originalAmountNaira - what you want to receive
 *   finalAmountNaira   - what the customer actually pays (includes fee)
 *   feeChargedNaira    - just the Paystack fee portion
 */
export const initializePaystackTransaction = async (orderId) => {
  const res = await api.post("/paystack/initialize", { orderId });
  return res.data;
};

/**
 * GET /api/paystack/verify/:reference
 * Verifies a payment by the reference returned from initializePaystackTransaction.
 * Call this after Paystack redirects the user back to the app.
 */
export const verifyPaystackTransaction = async (reference) => {
  const res = await api.get(`/paystack/verify/${reference}`);
  return res.data;
};
