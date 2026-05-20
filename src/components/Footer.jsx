// src/components/Footer.jsx
import { Link } from "react-router-dom";
import { Building2, CreditCard, Globe2, Smartphone, Zap } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <Link to="/" className="footer-logo">
              <span className="logo-icon">
                <Zap size={16} />
              </span>
              <span className="logo-text">KSI Gadget</span>
            </Link>
            <p>
              Nigeria's #1 gadget store. Quality electronics, fast delivery,
              guaranteed authenticity.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Social">
                <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24"><path fill="#ffffffff" d="m8.78 6.91l7.68 10.11h-1.19L7.51 6.91z"/><path fill="#ffffffff" d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5m-2.32 16.3l-3.38-4.4l-3.88 4.4H5.28l5-5.71L5 5.7h4.43l3.06 4l3.51-4h2.14L13.48 11L19 18.3z"/></svg>
              </a>
              <a href="#" aria-label="Social">
                <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 23 23"><path fill="#ffffffff" d="M18.857 3H5.143A2.145 2.145 0 0 0 3 5.143v13.714C3 20.04 3.961 21 5.143 21h13.714A2.145 2.145 0 0 0 21 18.857V5.143A2.145 2.145 0 0 0 18.857 3m-1.712 7.853a3.17 3.17 0 0 1-1.822-.371a3.2 3.2 0 0 1-1.16-1.066v4.944a3.654 3.654 0 1 1-3.654-3.654c.076 0 .15.007.225.011v1.801c-.075-.009-.148-.023-.225-.023a1.865 1.865 0 1 0 0 3.73c1.03 0 1.94-.811 1.94-1.841l.018-8.398h1.723a3.21 3.21 0 0 0 2.957 2.865v2.002"/></svg>
              </a>
              <a href="#" aria-label="Social">
                <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 26 20"><path fill="#ffffff" fillRule="evenodd" d="M18.896 0H1.104C.494 0 0 .494 0 1.104v17.792C0 19.506.494 20 1.104 20h9.578v-7.745H8.076V9.237h2.606V7.01c0-2.584 1.578-3.99 3.883-3.99c1.104 0 2.052.082 2.329.119v2.7h-1.598c-1.254 0-1.496.596-1.496 1.47v1.927h2.989l-.39 3.018h-2.6V20h5.097c.61 0 1.104-.494 1.104-1.104V1.104C20 .494 19.506 0 18.896 0Z"/></svg>
              </a>
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
          <p>
            © {new Date().getFullYear()} KSI Gadget Nigeria. All rights
            reserved.
          </p>
          <div className="payment-icons">
            <CreditCard size={16} /> <Building2 size={16} />{" "}
            <Smartphone size={16} />
          </div>
        </div>
      </div>
    </footer>
  );
}
