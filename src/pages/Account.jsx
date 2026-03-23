// src/pages/Account.jsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Account.css';
import { loginUser, registerUser } from "../api/auth";

export default function Account() {
  const { showToast } = useApp();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });

  const handleSubmit = async () => {
  if (!form.email || !form.password) {
    showToast('Please fill in all fields');
    return;
  }

  try {
    if (tab === "login") {
      const data = await loginUser({
        email: form.email,
        password: form.password,
      });

      // Save token
      localStorage.setItem("token", data.token);

      showToast("Signed in successfully! 👋");

      console.log("LOGIN RESPONSE:", data);

    } else {
      const data = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      showToast("Account created! Welcome 🎉");

      console.log("REGISTER RESPONSE:", data);
    }

  } catch (err) {
    console.error(err.response?.data || err.message);

    showToast(
      err.response?.data?.message || "Something went wrong ❌"
    );
  }
};

  return (
    <div className="section">
      <div className="container account-container">
        <div className="account-card">
          <div className="account-avatar">👤</div>
          <div className="account-tabs">
            <button
              className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
              onClick={() => setTab('login')}
            >
              Sign In
            </button>
            <button
              className={`tab-btn ${tab === 'register' ? 'active' : ''}`}
              onClick={() => setTab('register')}
            >
              Register
            </button>
          </div>

          <div className="account-form">
            {tab === 'register' && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Emeka Obi"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
            )}
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }} onClick={handleSubmit}>
              {tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
            {tab === 'login' && (
              <p className="forgot-link">
                <a onClick={() => showToast('Password reset link sent 📧')}>Forgot password?</a>
              </p>
            )}
          </div>

          <div className="account-benefits">
            <h4>Member Benefits</h4>
            <div className="benefit-list">
              {['🛒 Track your orders', '❤️ Save wishlists', '🎁 Exclusive deals', '🚀 Faster checkout'].map(b => (
                <span key={b} className="benefit-item">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
