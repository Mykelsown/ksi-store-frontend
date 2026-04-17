// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import { Building2, CreditCard, Globe2, Smartphone, Zap } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <Link to="/" className="footer-logo">
              <span className="logo-icon"><Zap size={16} /></span>
              <span className="logo-text">KSI Gadget</span>
            </Link>
            <p>Nigeria's #1 gadget store. Quality electronics, fast delivery, guaranteed authenticity.</p>
            <div className="social-links">
              <a href="#" aria-label="Social"><Globe2 size={16} /></a>
              <a href="#" aria-label="Social"><Globe2 size={16} /></a>
              <a href="#" aria-label="Social"><Globe2 size={16} /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/phones">Smartphones</Link>
            <Link to="/laptops">Laptops</Link>
            <Link to="/accessories">Accessories</Link>
            <Link to="/deals">Flash Deals</Link>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Track Order</a>
            <a href="#">Returns</a>
            <Link to="/contact">Contact Us</Link>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <a href="#">Careers</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} KSI Gadget Nigeria. All rights reserved.</p>
          <div className="payment-icons">
            <CreditCard size={16} /> <Building2 size={16} /> <Smartphone size={16} />
          </div>
        </div>
      </div>
    </footer>
  );
}
