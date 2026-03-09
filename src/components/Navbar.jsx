// src/components/Navbar.jsx
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Navbar.css';

export default function Navbar() {
  const { theme, toggleTheme, cartCount, wishlist } = useApp();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/phones', label: 'Phones' },
    { to: '/laptops', label: 'Laptops' },
    { to: '/accessories', label: 'Accessories' },
    { to: '/deals', label: '🔥 Flash Deals' },
    { to: '/brands', label: 'Brands' },
    { to: '/contact', label: 'Contact Us' },
    { to: '/about', label: 'About' },
  ];

  return (
    <header className="navbar">
      {/* TOP BAR */}
      <div className="nav-top">
        <div className="container nav-top-inner">
          {/* Logo */}
          <Link to="/" className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">KSI Gadget</span>
          </Link>

          {/* Search */}
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search phones, laptops, accessories…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="search-btn" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>

          {/* Actions */}
          <div className="nav-actions">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <Link to="/wishlist" className="nav-icon-btn" title="Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
            </Link>

            <Link to="/cart" className="nav-icon-btn cart-btn" title="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </Link>

            <Link to="/account" className="nav-icon-btn" title="Account">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </Link>

            {/* Mobile Hamburger */}
            <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              <span className={menuOpen ? 'open' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <nav className={`nav-bottom ${menuOpen ? 'mobile-open' : ''}`}>
        <div className="container nav-bottom-inner">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
