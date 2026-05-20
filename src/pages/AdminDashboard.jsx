import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useApp } from "../context/useApp";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../api/products";
import {
  deactivateUser,
  deleteUser,
  getUsers,
  reactivateUser,
} from "../api/users";
import {
  getAllOrders,
  getOrderStats,
  updateOrderPaymentStatus,
  updateOrderStatus,
} from "../api/orders";
import "./AdminDashboard.css";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "completed", "failed", "refunded"];
const PRODUCT_CATEGORIES = [
  "Electronics",
  "Smartphones",
  "Laptops",
  "Tablets",
  "Accessories",
  "Audio",
  "Gaming",
  "Other",
];

const emptyProductForm = {
  name: "",
  description: "",
  price: "",
  category: "Smartphones",
  brand: "",
  stock: "0",
  featured: false,
  imageUrl: "",
};

const DEFAULT_LIMIT = 6;

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const toStatusLabel = (value) =>
  String(value || "-")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeResponse = (payload) => payload?.data || payload || {};

export default function AdminDashboard() {
  const { user, showToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orderPagination, setOrderPagination] = useState(null);
  const [userPagination, setUserPagination] = useState(null);
  const [productPagination, setProductPagination] = useState(null);
  const [orderQuery, setOrderQuery] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    search: "",
    status: "all",
    paymentStatus: "all",
  });
  const [userQuery, setUserQuery] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    search: "",
    status: "all",
  });
  const [productQuery, setProductQuery] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    search: "",
    category: "all",
    sortBy: "createdAt",
    sortOrder: "DESC",
  });
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [orderDrafts, setOrderDrafts] = useState({});
  const hasSessionToken = Boolean(sessionStorage.getItem("token"));

  const isAdmin = user?.role === "admin";

  const dashboardCards = useMemo(
    () => [
      { label: "Revenue", value: `₦${formatCurrency(stats?.totalRevenue)}` },
      { label: "Orders", value: stats?.total ?? 0 },
      { label: "Pending", value: stats?.pending ?? 0 },
      { label: "Active users", value: users.filter((item) => item.isActive !== false).length },
    ],
    [stats, users],
  );

  const orderParams = {
    page: orderQuery.page,
    limit: orderQuery.limit,
    ...(orderQuery.search.trim() ? { search: orderQuery.search.trim() } : {}),
    ...(orderQuery.status !== "all" ? { status: orderQuery.status } : {}),
    ...(orderQuery.paymentStatus !== "all"
      ? { paymentStatus: orderQuery.paymentStatus }
      : {}),
  };

  const userParams = {
    skip: (userQuery.page - 1) * userQuery.limit,
    take: userQuery.limit,
    ...(userQuery.search.trim() ? { search: userQuery.search.trim() } : {}),
    ...(userQuery.status !== "all" ? { status: userQuery.status } : {}),
  };

  const productParams = {
    page: productQuery.page,
    limit: productQuery.limit,
    sortBy: productQuery.sortBy,
    sortOrder: productQuery.sortOrder,
    ...(productQuery.search.trim() ? { search: productQuery.search.trim() } : {}),
    ...(productQuery.category !== "all" ? { category: productQuery.category } : {}),
  };

  const loadAdminData = async () => {
    setLoading(true);

    try {
      const [statsResponse, ordersResponse, usersResponse, productsResponse] =
        await Promise.all([
          getOrderStats(),
          getAllOrders(orderParams),
          getUsers(userParams),
          getProducts(productParams),
        ]);

      const statsPayload = normalizeResponse(statsResponse);
      const ordersPayload = normalizeResponse(ordersResponse);
      const usersPayload = normalizeResponse(usersResponse);
      const productsPayload = normalizeResponse(productsResponse);

      setStats(statsPayload);
      setOrders(ordersPayload.orders || []);
      setUsers(usersPayload.users || []);
      setProducts(productsPayload.products || []);
      setOrderPagination(ordersPayload.pagination || null);
      setUserPagination(usersPayload.pagination || null);
      setProductPagination(productsPayload.pagination || null);

      const drafts = {};
      (ordersPayload.orders || []).forEach((order) => {
        drafts[order.id] = {
          status: order.status || "pending",
          paymentStatus: order.paymentStatus || "pending",
        };
      });
      setOrderDrafts(drafts);
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to load admin dashboard",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    void loadAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, orderQuery, userQuery, productQuery]);

  if (!user && !hasSessionToken) {
    return <Navigate to="/account?tab=login" replace />;
  }

  if (!user && hasSessionToken) {
    return (
      <div className="section admin-shell">
        <div className="container">
          <div className="admin-panel admin-loading">Loading admin session…</div>
        </div>
      </div>
    );
  }

  const handleOrderDraftChange = (orderId, field, value) => {
    setOrderDrafts((current) => ({
      ...current,
      [orderId]: {
        ...(current[orderId] || {}),
        [field]: value,
      },
    }));
  };

  const updateOrderQuery = (field, value) => {
    setOrderQuery((current) => ({
      ...current,
      page: field === "page" ? value : 1,
      [field]: value,
    }));
  };

  const updateUserQuery = (field, value) => {
    setUserQuery((current) => ({
      ...current,
      page: field === "page" ? value : 1,
      [field]: value,
    }));
  };

  const updateProductQuery = (field, value) => {
    setProductQuery((current) => ({
      ...current,
      page: field === "page" ? value : 1,
      [field]: value,
    }));
  };

  const renderPagination = (pagination, currentPage, onPageChange) => {
    if (!pagination || pagination.pages <= 1) return null;

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(pagination.pages, startPage + 4);
    const pages = [];

    for (let index = startPage; index <= endPage; index += 1) {
      pages.push(index);
    }

    return (
      <div className="admin-pagination">
        <button
          type="button"
          className="btn-small btn-small--ghost"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1 || saving}
        >
          Previous
        </button>
        <div className="admin-pagination__pages">
          {pages.map((page) => (
            <button
              key={page}
              type="button"
              className={`admin-page-pill ${page === currentPage ? "active" : ""}`}
              onClick={() => onPageChange(page)}
              disabled={saving}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn-small btn-small--ghost"
          onClick={() => onPageChange(Math.min(pagination.pages, currentPage + 1))}
          disabled={currentPage >= pagination.pages || saving}
        >
          Next
        </button>
      </div>
    );
  };

  const handleOrderSave = async (orderId) => {
    const draft = orderDrafts[orderId];
    if (!draft) return;

    setSaving(true);
    try {
      await Promise.all([
        updateOrderStatus(orderId, { status: draft.status }),
        updateOrderPaymentStatus(orderId, { paymentStatus: draft.paymentStatus }),
      ]);
      showToast("Order updated", "success");
      await loadAdminData();
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to update order",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const resetOrderFilters = () =>
    setOrderQuery({ page: 1, limit: DEFAULT_LIMIT, search: "", status: "all", paymentStatus: "all" });

  const resetUserFilters = () =>
    setUserQuery({ page: 1, limit: DEFAULT_LIMIT, search: "", status: "all" });

  const resetProductFilters = () =>
    setProductQuery({
      page: 1,
      limit: DEFAULT_LIMIT,
      search: "",
      category: "all",
      sortBy: "createdAt",
      sortOrder: "DESC",
    });

  const handleUserAction = async (action, userId) => {
    setSaving(true);
    try {
      if (action === "deactivate") {
        await deactivateUser(userId);
      } else if (action === "reactivate") {
        await reactivateUser(userId);
      } else {
        await deleteUser(userId);
      }
      showToast("User updated", "success");
      await loadAdminData();
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to update user",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const beginEditProduct = (product) => {
    setSelectedProductId(product.id);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      category: product.category || "Smartphones",
      brand: product.brand || "",
      stock: String(product.stock ?? 0),
      featured: Boolean(product.featured),
      imageUrl: Array.isArray(product.images) ? product.images[0] || "" : "",
    });
    setActiveTab("products");
  };

  const clearProductForm = () => {
    setSelectedProductId(null);
    setProductForm(emptyProductForm);
  };

  const handleProductSave = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: Number(productForm.price),
      category: productForm.category,
      brand: productForm.brand.trim(),
      stock: Number(productForm.stock),
      featured: productForm.featured,
      imageUrl: productForm.imageUrl.trim(),
    };

    try {
      if (selectedProductId) {
        await updateProduct(selectedProductId, payload);
        showToast("Product updated", "success");
      } else {
        await createProduct(payload);
        showToast("Product created", "success");
      }
      clearProductForm();
      await loadAdminData();
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to save product",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleProductDelete = async (productId) => {
    setSaving(true);
    try {
      await deleteProduct(productId);
      if (selectedProductId === productId) {
        clearProductForm();
      }
      showToast("Product deleted", "success");
      await loadAdminData();
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to delete product",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="section admin-shell">
        <div className="container">
          <div className="admin-empty-state">
            <p className="admin-eyebrow">Restricted area</p>
            <h1>Admin access only</h1>
            <p>
              This account does not have admin permissions. Sign in with an
              admin account to manage orders, users, and products.
            </p>
            <div className="admin-empty-actions">
              <Link to="/dashboard" className="btn-secondary">
                Back to dashboard
              </Link>
              <Link to="/account" className="btn-primary">
                Switch account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section admin-shell">
      <div className="container">
        <div className="admin-hero">
          <div>
            <p className="admin-eyebrow">Admin console</p>
            <h1>Store operations at a glance.</h1>
            <p className="admin-subtitle">
              Manage catalog updates, customer accounts, and order fulfillment
              from one workspace.
            </p>
          </div>
          <div className="admin-hero-actions">
            <button type="button" className="btn-secondary" onClick={loadAdminData} disabled={loading || saving}>
              Refresh data
            </button>
            <Link to="/phones" className="btn-primary">
              Preview storefront
            </Link>
          </div>
        </div>

        <div className="admin-stats-grid">
          {dashboardCards.map((card) => (
            <article key={card.label} className="admin-stat-card">
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </article>
          ))}
        </div>

        <div className="admin-tabs" role="tablist" aria-label="Admin sections">
          {[
            ["overview", "Overview"],
            ["orders", "Orders"],
            ["users", "Users"],
            ["products", "Products"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`admin-tab ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="admin-panel admin-loading">Loading admin data…</div>
        ) : (
          <div className="admin-layout">
            {(activeTab === "overview" || activeTab === "orders") && (
              <section className="admin-panel admin-span-2">
                <div className="admin-panel-header">
                  <div>
                    <p className="admin-section-label">Orders</p>
                    <h2>Fulfillment queue</h2>
                  </div>
                  <span>{orderPagination?.total ?? orders.length} orders</span>
                </div>
                <div className="admin-toolbar">
                  <input
                    type="search"
                    className="admin-input"
                    placeholder="Search order number, customer, or email"
                    value={orderQuery.search}
                    onChange={(event) => updateOrderQuery("search", event.target.value)}
                  />
                  <select
                    className="admin-input"
                    value={orderQuery.status}
                    onChange={(event) => updateOrderQuery("status", event.target.value)}
                  >
                    <option value="all">All statuses</option>
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {toStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                  <select
                    className="admin-input"
                    value={orderQuery.paymentStatus}
                    onChange={(event) => updateOrderQuery("paymentStatus", event.target.value)}
                  >
                    <option value="all">All payments</option>
                    {PAYMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {toStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                  <button type="button" className="btn-small btn-small--ghost" onClick={resetOrderFilters}>
                    Reset
                  </button>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const draft = orderDrafts[order.id] || {};

                        return (
                          <tr key={order.id}>
                            <td>
                              <strong>{order.orderNumber || order.id?.slice(0, 8)}</strong>
                              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </td>
                            <td>
                              <strong>{order.user?.name || "Unknown user"}</strong>
                              <span>{order.user?.email || "No email"}</span>
                            </td>
                            <td>
                              <select
                                value={draft.status || order.status || "pending"}
                                onChange={(event) =>
                                  handleOrderDraftChange(order.id, "status", event.target.value)
                                }
                              >
                                {ORDER_STATUSES.map((status) => (
                                  <option key={status} value={status}>
                                    {toStatusLabel(status)}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <select
                                value={draft.paymentStatus || order.paymentStatus || "pending"}
                                onChange={(event) =>
                                  handleOrderDraftChange(order.id, "paymentStatus", event.target.value)
                                }
                              >
                                {PAYMENT_STATUSES.map((status) => (
                                  <option key={status} value={status}>
                                    {toStatusLabel(status)}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>₦{formatCurrency(order.totalAmount)}</td>
                            <td>
                              <button
                                type="button"
                                className="btn-small"
                                onClick={() => handleOrderSave(order.id)}
                                disabled={saving}
                              >
                                Save
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {renderPagination(
                  orderPagination,
                  orderQuery.page,
                  (page) => updateOrderQuery("page", page),
                )}
              </section>
            )}

            {(activeTab === "overview" || activeTab === "users") && (
              <section className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <p className="admin-section-label">Users</p>
                    <h2>Customer accounts</h2>
                  </div>
                  <span>{userPagination?.total ?? users.length} users</span>
                </div>
                <div className="admin-toolbar admin-toolbar--compact">
                  <input
                    type="search"
                    className="admin-input"
                    placeholder="Search name or email"
                    value={userQuery.search}
                    onChange={(event) => updateUserQuery("search", event.target.value)}
                  />
                  <select
                    className="admin-input"
                    value={userQuery.status}
                    onChange={(event) => updateUserQuery("status", event.target.value)}
                  >
                    <option value="all">All accounts</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button type="button" className="btn-small btn-small--ghost" onClick={resetUserFilters}>
                    Reset
                  </button>
                </div>
                <div className="admin-list">
                  {users.map((item) => (
                    <article key={item.id} className="admin-list-item">
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.email}</span>
                        <small>
                          Role: {item.role} · Status: {item.isActive === false ? "inactive" : "active"}
                        </small>
                      </div>
                      <div className="admin-item-actions">
                        {item.isActive === false ? (
                          <button
                            type="button"
                            className="btn-small"
                            onClick={() => handleUserAction("reactivate", item.id)}
                            disabled={saving}
                          >
                            Reactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-small btn-small--ghost"
                            onClick={() => handleUserAction("deactivate", item.id)}
                            disabled={saving}
                          >
                            Deactivate
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-small btn-small--danger"
                          onClick={() => handleUserAction("delete", item.id)}
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                {renderPagination(
                  userPagination,
                  userQuery.page,
                  (page) => updateUserQuery("page", page),
                )}
              </section>
            )}

            {(activeTab === "overview" || activeTab === "products") && (
              <section className="admin-panel admin-span-2">
                <div className="admin-panel-header">
                  <div>
                    <p className="admin-section-label">Products</p>
                    <h2>{selectedProductId ? "Edit catalog item" : "Add catalog item"}</h2>
                  </div>
                  {selectedProductId && (
                    <button type="button" className="btn-link" onClick={clearProductForm}>
                      Cancel edit
                    </button>
                  )}
                </div>

                <div className="admin-toolbar">
                  <input
                    type="search"
                    className="admin-input"
                    placeholder="Search products"
                    value={productQuery.search}
                    onChange={(event) => updateProductQuery("search", event.target.value)}
                  />
                  <select
                    className="admin-input"
                    value={productQuery.category}
                    onChange={(event) => updateProductQuery("category", event.target.value)}
                  >
                    <option value="all">All categories</option>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <select
                    className="admin-input"
                    value={productQuery.limit}
                    onChange={(event) => updateProductQuery("limit", Number(event.target.value))}
                  >
                    <option value={6}>6 / page</option>
                    <option value={12}>12 / page</option>
                    <option value={24}>24 / page</option>
                  </select>
                  <button type="button" className="btn-small btn-small--ghost" onClick={resetProductFilters}>
                    Reset
                  </button>
                </div>

                <form className="admin-form" onSubmit={handleProductSave}>
                  <div className="admin-form-grid">
                    <label>
                      <span>Name</span>
                      <input
                        value={productForm.name}
                        onChange={(event) =>
                          setProductForm((current) => ({ ...current, name: event.target.value }))
                        }
                        required
                      />
                    </label>
                    <label>
                      <span>Brand</span>
                      <input
                        value={productForm.brand}
                        onChange={(event) =>
                          setProductForm((current) => ({ ...current, brand: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>Price</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={productForm.price}
                        onChange={(event) =>
                          setProductForm((current) => ({ ...current, price: event.target.value }))
                        }
                        required
                      />
                    </label>
                    <label>
                      <span>Stock</span>
                      <input
                        type="number"
                        min="0"
                        value={productForm.stock}
                        onChange={(event) =>
                          setProductForm((current) => ({ ...current, stock: event.target.value }))
                        }
                        required
                      />
                    </label>
                    <label>
                      <span>Category</span>
                      <select
                        value={productForm.category}
                        onChange={(event) =>
                          setProductForm((current) => ({ ...current, category: event.target.value }))
                        }
                      >
                        {PRODUCT_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Primary image URL</span>
                      <input
                        value={productForm.imageUrl}
                        onChange={(event) =>
                          setProductForm((current) => ({ ...current, imageUrl: event.target.value }))
                        }
                      />
                    </label>
                    <label className="admin-form-wide">
                      <span>Description</span>
                      <textarea
                        rows="4"
                        value={productForm.description}
                        onChange={(event) =>
                          setProductForm((current) => ({ ...current, description: event.target.value }))
                        }
                        required
                      />
                    </label>
                    <label className="admin-check">
                      <input
                        type="checkbox"
                        checked={productForm.featured}
                        onChange={(event) =>
                          setProductForm((current) => ({ ...current, featured: event.target.checked }))
                        }
                      />
                      <span>Featured product</span>
                    </label>
                  </div>
                  <div className="admin-form-actions">
                    <button type="submit" className="btn-primary" disabled={saving}>
                      {selectedProductId ? "Update product" : "Create product"}
                    </button>
                    <button type="button" className="btn-secondary" onClick={clearProductForm}>
                      Clear form
                    </button>
                  </div>
                </form>

                <div className="admin-table-wrap admin-products-table">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <strong>{product.name}</strong>
                            <span>{product.brand || "No brand"}</span>
                          </td>
                          <td>{product.category}</td>
                          <td>{product.stock}</td>
                          <td>₦{formatCurrency(product.price)}</td>
                          <td>
                            <div className="admin-inline-actions">
                              <button
                                type="button"
                                className="btn-small"
                                onClick={() => beginEditProduct(product)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn-small btn-small--danger"
                                onClick={() => handleProductDelete(product.id)}
                                disabled={saving}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {renderPagination(
                  productPagination,
                  productQuery.page,
                  (page) => updateProductQuery("page", page),
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}