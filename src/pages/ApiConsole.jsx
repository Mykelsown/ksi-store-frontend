import { useMemo, useState } from "react";
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
  refreshToken,
  changePassword,
  logoutUser,
} from "../api/auth";
import {
  getProducts,
  getProductById,
  getProductReviews,
  addProductReview,
  updateProductReview,
  deleteProductReview,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/products";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../api/cart";
import {
  createOrder,
  getMyOrders,
  getMyOrderStats,
  getOrderById,
  cancelOrder,
  getAllOrders,
  getOrderStats,
  updateOrderStatus,
  updateOrderPaymentStatus,
} from "../api/orders";
import {
  getProfile,
  updateProfile,
  getUsers,
  getUserById,
  deactivateUser,
  reactivateUser,
  deleteUser,
  deleteMyAccount,
} from "../api/users";
import {
  getPaymentConfig,
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  cancelPayment,
  refundPayment,
  sendPaymentWebhook,
} from "../api/payments";
import {
  createCryptoCharge,
  getCryptoCharge,
  getOrderCryptoCharges,
  cancelCryptoCharge,
  sendCryptoWebhook,
} from "../api/crypto";
import "./ApiConsole.css";

const getApiPayload = (raw) => {
  if (!raw) {
    return null;
  }
  if (Object.prototype.hasOwnProperty.call(raw, "data")) {
    return raw.data;
  }
  return raw;
};

const makeEmail = (prefix) => `${prefix}.${Date.now()}@example.com`;

export default function ApiConsole() {
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);

  const [customerEmail] = useState(() => makeEmail("frontend.customer"));
  const [adminEmail, setAdminEmail] = useState(
    import.meta.env.VITE_ADMIN_EMAIL || "",
  );
  const [adminPassword, setAdminPassword] = useState(
    import.meta.env.VITE_ADMIN_PASSWORD || "",
  );
  const [customerPassword] = useState("TestPass123!");

  const [state, setState] = useState({
    customerToken: "",
    customerRefreshToken: "",
    customerId: "",
    adminToken: "",
    adminId: "",
    productId: "",
    reviewId: "",
    orderId: "",
    paymentIntentId: "",
    chargeId: "",
  });

  const summary = useMemo(() => {
    const pass = logs.filter((l) => l.ok).length;
    const fail = logs.filter((l) => !l.ok).length;
    return { pass, fail, total: logs.length };
  }, [logs]);

  const pushLog = (name, ok, detail) => {
    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        name,
        ok,
        detail,
        at: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const pushSkip = (name, detail) => {
    pushLog(name, true, `Skipped: ${detail}`);
  };

  const runStep = async (name, fn) => {
    try {
      const result = await fn();
      pushLog(name, true, result || "ok");
      return result;
    } catch (error) {
      const detail =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        "Request failed";
      pushLog(name, false, detail);
      throw error;
    }
  };

  const setToken = (token) => {
    if (token) {
      localStorage.setItem("token", token);
    }
  };

  const runAll = async () => {
    setRunning(true);
    setLogs([]);

    const current = { ...state };

    try {
      const customerRegisterRaw = await runStep("POST /auth/register (customer)", () =>
        registerUser({
          name: "Frontend Customer",
          email: customerEmail,
          password: customerPassword,
        }),
      );
      const customerRegister = getApiPayload(customerRegisterRaw);
      current.customerToken = customerRegister?.accessToken || "";
      current.customerRefreshToken = customerRegister?.refreshToken || "";
      current.customerId = customerRegister?.user?.id || "";
      setToken(current.customerToken);

      await runStep("POST /auth/login (customer)", () =>
        loginUser({ email: customerEmail, password: customerPassword }),
      );

      if (adminEmail && adminPassword) {
        try {
          const adminLoginRaw = await loginUser({
            email: adminEmail,
            password: adminPassword,
          });
          const adminLogin = getApiPayload(adminLoginRaw);
          current.adminToken = adminLogin?.accessToken || "";
          current.adminId = adminLogin?.user?.id || "";
          pushLog("POST /auth/login (admin)", true, "ok");
        } catch (error) {
          const detail =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            "Admin login failed";
          pushLog("POST /auth/login (admin)", false, detail);
          current.adminToken = "";
        }
      } else {
        pushSkip("POST /auth/login (admin)", "No admin credentials provided");
      }

      if (current.customerRefreshToken) {
        await runStep("POST /auth/refresh", () => refreshToken(current.customerRefreshToken));
      }

      await runStep("POST /auth/request-password-reset", () =>
        requestPasswordReset(customerEmail),
      );
      await runStep("POST /auth/verify-reset-token", () => verifyResetToken("invalid-token"));
      await runStep("POST /auth/reset-password (invalid expected)", () =>
        resetPassword("invalid-token", "NextPass123!"),
      ).catch(() => null);

      setToken(current.customerToken);
      await runStep("POST /auth/change-password (invalid old expected)", () =>
        changePassword("WrongOldPass123!", "NextPass123!"),
      ).catch(() => null);

      await runStep("GET /products", () => getProducts({ page: 1, limit: 10 }));

      if (current.adminToken) {
        localStorage.setItem("token", current.adminToken);
        const createdProductRaw = await runStep("POST /products (admin)", () =>
          createProduct({
            name: "Frontend API Product",
            description: "Product created from frontend API console",
            price: 499.99,
            category: "Electronics",
            brand: "KSI",
            stock: 25,
            images: ["https://example.com/frontend-api-product.png"],
          }),
        );
        const createdProduct = getApiPayload(createdProductRaw);
        current.productId = createdProduct?.id || "";
      } else {
        pushSkip("POST /products (admin)", "Admin token unavailable");
      }

      if (!current.productId) {
        const listRaw = await runStep("GET /products (resolve productId)", () =>
          getProducts({ page: 1, limit: 10 }),
        );
        const list = getApiPayload(listRaw);
        current.productId = list?.products?.[0]?.id || "";
      }

      if (!current.productId) {
        throw new Error("No product available to continue endpoint sequence");
      }

      await runStep("GET /products/:id", () => getProductById(current.productId));
      await runStep("GET /products/:id/reviews", () => getProductReviews(current.productId));

      localStorage.setItem("token", current.customerToken);
      const reviewRaw = await runStep("POST /products/:id/reviews", () =>
        addProductReview(current.productId, { rating: 5, comment: "Nice product" }),
      );
      const review = getApiPayload(reviewRaw);
      current.reviewId = review?.id || "";

      await runStep("PUT /products/reviews/:reviewId", () =>
        updateProductReview(current.reviewId, {
          rating: 4,
          comment: "Updated review from API console",
        }),
      );

      await runStep("GET /cart", () => getCart());
      await runStep("POST /cart/items", () =>
        addCartItem({ productId: current.productId, quantity: 1 }),
      );
      await runStep("PUT /cart/items/:productId", () =>
        updateCartItem(current.productId, { quantity: 2 }),
      );

      const orderRaw = await runStep("POST /orders", () =>
        createOrder({
          shippingAddress: "123 Frontend Test Street",
          shippingCity: "Lagos",
          shippingState: "LA",
          shippingZipCode: "100001",
          shippingCountry: "Nigeria",
          contactPhone: "+2340000000000",
          notes: "Created from frontend API console",
        }),
      );
      const order = getApiPayload(orderRaw);
      current.orderId = order?.id || "";

      await runStep("GET /orders/my-orders", () => getMyOrders({ page: 1, limit: 10 }));
      await runStep("GET /orders/my-stats", () => getMyOrderStats());
      await runStep("GET /orders/:id", () => getOrderById(current.orderId));

      await runStep("GET /users/profile", () => getProfile());
      await runStep("PUT /users/profile", () =>
        updateProfile({ name: "Frontend Customer Updated", address: "Updated from API console" }),
      );

      await runStep("GET /payments/config", () => getPaymentConfig());
      const paymentIntentRaw = await runStep("POST /payments/create-intent", () =>
        createPaymentIntent({ orderId: current.orderId, currency: "usd" }),
      );
      const paymentIntent = getApiPayload(paymentIntentRaw);
      current.paymentIntentId = paymentIntent?.paymentIntentId || "";

      if (current.paymentIntentId) {
        await runStep("POST /payments/confirm", () =>
          confirmPayment({ paymentIntentId: current.paymentIntentId }),
        );
        await runStep("GET /payments/status/:paymentIntentId", () =>
          getPaymentStatus(current.paymentIntentId),
        );
        await runStep("POST /payments/cancel", () =>
          cancelPayment({ paymentIntentId: current.paymentIntentId }),
        );
      }

      const chargeRaw = await runStep("POST /crypto-payments/create-charge", () =>
        createCryptoCharge({
          orderId: current.orderId,
          description: "Crypto checkout via frontend API console",
        }),
      );
      const charge = getApiPayload(chargeRaw);
      current.chargeId = charge?.chargeId || "";

      if (current.chargeId) {
        await runStep("GET /crypto-payments/charge/:chargeId", () =>
          getCryptoCharge(current.chargeId),
        );
      }
      await runStep("GET /crypto-payments/order/:orderId/charges", () =>
        getOrderCryptoCharges(current.orderId),
      );

      if (current.chargeId) {
        await runStep("POST /crypto-payments/cancel", () =>
          cancelCryptoCharge({ chargeId: current.chargeId }),
        );
      }

      await runStep("POST /payments/webhook", () =>
        sendPaymentWebhook({ type: "payment_intent.succeeded" }),
      );
      await runStep("POST /crypto-payments/webhook", () =>
        sendCryptoWebhook({ type: "charge:confirmed" }),
      );

      if (current.adminToken) {
        localStorage.setItem("token", current.adminToken);
        await runStep("GET /orders (admin)", () => getAllOrders({ page: 1, limit: 10 }));
        await runStep("GET /orders/stats (admin)", () => getOrderStats());

        if (current.orderId) {
          await runStep("PUT /orders/:id/status (admin)", () =>
            updateOrderStatus(current.orderId, {
              status: "processing",
              trackingNumber: "FRONTEND-TRK-001",
            }),
          );

          await runStep("PUT /orders/:id/payment-status (admin)", () =>
            updateOrderPaymentStatus(current.orderId, {
              paymentStatus: "completed",
              paymentTransactionId: current.paymentIntentId || "frontend-payment-id",
            }),
          );

          await runStep("POST /orders/:id/refund-like via payments/refund (admin)", () =>
            refundPayment({
              paymentIntentId: current.paymentIntentId || "pi_mock_123",
              amount: 1,
              reason: "requested_by_customer",
            }),
          );
        }

        await runStep("GET /users (admin)", () => getUsers());
        if (current.customerId) {
          await runStep("GET /users/:userId (admin)", () => getUserById(current.customerId));
        }

        if (current.customerId) {
          await runStep("PUT /users/:userId/deactivate (admin)", () =>
            deactivateUser(current.customerId),
          );
          await runStep("PUT /users/:userId/reactivate (admin)", () =>
            reactivateUser(current.customerId),
          );
        }
      } else {
        pushSkip("Admin route group", "Admin token unavailable");
      }

      localStorage.setItem("token", current.customerToken);
      if (current.orderId) {
        await runStep("POST /orders/:id/cancel", () =>
          cancelOrder(current.orderId, "Cancelled by API console"),
        );
      }

      await runStep("DELETE /products/reviews/:reviewId", () =>
        deleteProductReview(current.reviewId),
      );
      await runStep("DELETE /cart/items/:productId", () => removeCartItem(current.productId));
      await runStep("DELETE /cart", () => clearCart());
      await runStep("POST /auth/logout", () => logoutUser());

      if (current.adminToken) {
        localStorage.setItem("token", current.adminToken);
        await runStep("DELETE /products/:id (admin)", () => deleteProduct(current.productId));
        if (current.customerId) {
          await runStep("DELETE /users/:userId (admin)", () => deleteUser(current.customerId));
        }
      } else {
        pushSkip("DELETE /products/:id (admin)", "Admin token unavailable");
        pushSkip("DELETE /users/:userId (admin)", "Admin token unavailable");
      }

      setState(current);
    } catch (error) {
      // Failures are logged per-step. Keep state for troubleshooting.
      setState(current);
    } finally {
      setRunning(false);
    }
  };

  const clearLogs = () => setLogs([]);

  const runDeleteSelf = async () => {
    setRunning(true);
    try {
      await runStep("DELETE /users/account", () => deleteMyAccount());
    } catch (error) {
      // Already logged
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="section api-console">
      <div className="container">
        <div className="api-console__card">
          <div className="api-console__header">
            <div>
              <h1>Backend Endpoint Console</h1>
              <p>
                Runs auth, product, cart, order, user, payment, and crypto
                endpoints from the frontend against your configured backend.
              </p>
            </div>
            <div className="api-console__summary">
              <span>Pass: {summary.pass}</span>
              <span>Fail: {summary.fail}</span>
              <span>Total: {summary.total}</span>
            </div>
          </div>

          <div className="api-console__actions">
            <button
              type="button"
              className="btn-primary"
              onClick={runAll}
              disabled={running}
            >
              {running ? "Running..." : "Run All Endpoints"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={runDeleteSelf}
              disabled={running}
            >
              Delete Current Logged-in Account
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={clearLogs}
              disabled={running && logs.length === 0}
            >
              Clear Logs
            </button>
          </div>

          <div className="api-console__meta">
            <p><strong>Backend URL:</strong> {import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}</p>
            <p><strong>Customer Email:</strong> {customerEmail}</p>
            <div className="api-console__inputs">
              <label>
                <span>Admin Email</span>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={running}
                />
              </label>
              <label>
                <span>Admin Password</span>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Admin password"
                  disabled={running}
                />
              </label>
            </div>
          </div>

          <div className="api-console__logs">
            {logs.length === 0 ? (
              <p className="api-console__empty">No calls yet. Run the full sequence to begin.</p>
            ) : (
              logs.map((log) => (
                <article key={log.id} className={`api-log ${log.ok ? "ok" : "fail"}`}>
                  <header>
                    <strong>{log.name}</strong>
                    <span>{log.at}</span>
                  </header>
                  <pre>{typeof log.detail === "string" ? log.detail : JSON.stringify(log.detail, null, 2)}</pre>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
