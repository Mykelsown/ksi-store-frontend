// src/pages/Account.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, UserRound } from "lucide-react";
import { useApp } from "../context/useApp";
import "./Account.css";
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  verifyTwoFactorLogin,
} from "../api/auth";
import TwoFactorSettings from "../components/TwoFactorSettings";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

const getPasswordValidationErrors = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push("at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("one lowercase letter");
  }
  if (!/\d/.test(password)) {
    errors.push("one digit");
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("one special character from !@#$%^&*");
  }

  return errors;
};

export default function Account() {
  const { showToast, setUser, user } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(
    searchParams.get("tab") === "register" ? "register" : "login",
  );
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorUserId, setTwoFactorUserId] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  useEffect(() => {
    const nextTab = searchParams.get("tab");
    if (nextTab === "login" || nextTab === "register") {
      setTab(nextTab);
    }
  }, [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    if (!form.email || !form.password || (tab === "register" && !form.name)) {
      showToast("Please fill in all fields");
      return;
    }

    if (tab === "register") {
      if (form.name.trim().length < 2) {
        showToast("Name must be at least 2 characters long");
        return;
      }

      if (!passwordPattern.test(form.password)) {
        const validationErrors = getPasswordValidationErrors(form.password);
        showToast(`Password must contain: ${validationErrors.join(", ")}`);
        return;
      }
    }

    setIsLoading(true);

    try {
      if (tab === "login") {
        const data = await loginUser({
          email: form.email,
          password: form.password,
        });

        const payload = data?.data || {};

        if (payload.twoFactorRequired) {
          setTwoFactorUserId(payload.userId);
          setIsLoading(false);
          return;
        }

        if (payload.accessToken) {
          sessionStorage.setItem("token", payload.accessToken);
        }
        if (payload.refreshToken) {
          sessionStorage.setItem("refreshToken", payload.refreshToken);
        }
        if (payload.user) {
          sessionStorage.setItem("user", JSON.stringify(payload.user));
          setUser(payload.user);
        }

        showToast("Signed in successfully", "success");
        navigate(payload.user?.role === "admin" ? "/admin" : "/dashboard");
      } else {
        const data = await registerUser({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        });

        const payload = data?.data || {};
        if (payload.accessToken) {
          sessionStorage.setItem("token", payload.accessToken);
        }
        if (payload.refreshToken) {
          sessionStorage.setItem("refreshToken", payload.refreshToken);
        }
        if (payload.user) {
          sessionStorage.setItem("user", JSON.stringify(payload.user));
          setUser(payload.user);
        }

        showToast("Account created! Please sign in.", "success");
        setForm({ email: form.email.trim(), password: "", name: "" });
        setTab("login");
        navigate("/account?tab=login", { replace: true });
      }
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      const validationMessage =
        Array.isArray(backendErrors) && backendErrors.length > 0
          ? backendErrors[0]
          : null;

      const message =
        validationMessage ||
        err.response?.data?.message ||
        (err.message === "Network Error"
          ? "Backend is unavailable. Start the API server on http://localhost:5000 and try again."
          : "Something went wrong");

      if (err.response) {
        console.error(err.response.data || err.message);
      }
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTwoFactor = async (event) => {
    event.preventDefault();
    if (!twoFactorCode.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const data = await verifyTwoFactorLogin(
        twoFactorUserId,
        twoFactorCode.trim(),
      );
      const payload = data?.data || {};

      if (payload.accessToken) {
        sessionStorage.setItem("token", payload.accessToken);
      }
      if (payload.refreshToken) {
        sessionStorage.setItem("refreshToken", payload.refreshToken);
      }
      if (payload.user) {
        sessionStorage.setItem("user", JSON.stringify(payload.user));
        setUser(payload.user);
      }

      showToast("Signed in successfully", "success");
      navigate(payload.user?.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Invalid two-factor code",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (twoFactorUserId) {
    return (
      <div className="section">
        <div className="container account-container">
          <div className="account-card">
            <div className="account-avatar">
              <UserRound size={44} />
            </div>
            <h3 style={{ textAlign: "center", marginBottom: "0.5rem" }}>
              Two-Factor Authentication
            </h3>
            <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
              Enter the 6-digit code from your authenticator app.
            </p>
            <form className="account-form" onSubmit={handleVerifyTwoFactor}>
              <div className="form-group">
                <label>Authentication Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="123456"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", padding: "1rem", fontSize: "1rem" }}
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </button>
              <p className="forgot-link">
                <a onClick={() => setTwoFactorUserId(null)}>Back to sign in</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="section">
        <div className="container account-container">
          <div className="account-card">
            <div className="account-avatar">
              <UserRound size={44} />
            </div>
            <h3 style={{ textAlign: "center", marginBottom: "0.5rem" }}>
              {user.name}
            </h3>
            <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              {user.email}
            </p>
            <TwoFactorSettings />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container account-container">
        <div className="account-card">
          <div className="account-avatar">
            <UserRound size={44} />
          </div>
          <div className="account-tabs">
            <button
              type="button"
              className={`tab-btn ${tab === "login" ? "active" : ""}`}
              onClick={() => setTab("login")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`tab-btn ${tab === "register" ? "active" : ""}`}
              onClick={() => setTab("register")}
            >
              Register
            </button>
          </div>

          <form className="account-form" onSubmit={handleSubmit}>
            {tab === "register" && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  autoComplete="name"
                  placeholder="e.g. Emeka Obi"
                  value={form.name}
                  disabled={isLoading}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            )}
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-input"
                autoComplete="email"
                placeholder="you@email.com"
                value={form.email}
                disabled={isLoading}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input password-input"
                  autoComplete={
                    tab === "login" ? "current-password" : "new-password"
                  }
                  placeholder="Your password"
                  value={form.password}
                  disabled={isLoading}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {tab === "register" && (
                <small className="form-help">
                  Password must include uppercase, lowercase, number, special
                  character, and be at least 8 characters long.
                </small>
              )}
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", padding: "1rem", fontSize: "1rem" }}
              disabled={isLoading}
            >
              {isLoading
                ? tab === "login"
                  ? "Signing In..."
                  : "Creating Account..."
                : tab === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
            {tab === "login" && (
              <p className="forgot-link">
                <a
                  onClick={async () => {
                    if (!form.email.trim()) {
                      showToast(
                        "Enter your email first to request a reset link",
                      );
                      return;
                    }

                    try {
                      await requestPasswordReset(form.email.trim());
                      showToast("Password reset link sent");
                    } catch (error) {
                      const message =
                        error?.response?.data?.message ||
                        "Could not send reset link";
                      showToast(message);
                    }
                  }}
                >
                  Forgot password?
                </a>
              </p>
            )}
          </form>

          <div className="account-benefits">
            <h4>Member Benefits</h4>
            <div className="benefit-list">
              {[
                "Track your orders",
                "Save wishlists",
                "Exclusive deals",
                "Faster checkout",
              ].map((b) => (
                <span key={b} className="benefit-item">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
