import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { LiveActivityToast } from "./LiveActivityToast.jsx";

const primaryLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Shop" },
  { to: "/checkout", label: "Checkout" },
  { to: "/about", label: "About Us" },
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/return-refund-policy", label: "Return & Refund" },
  { to: "/admin", label: "Admin" },
];

export const Layout = ({ children }) => {
  const location = useLocation();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="site-shell">
      <div className="promo-strip">
        <span>Sale ending soon</span>
        <span>Instagram deal: extra value bundles for fast checkout</span>
        <span>COD available with per-product confirmation</span>
      </div>

      <header className="site-header">
        <Link to="/" className="brand-lockup">
          <img src="/logo.png" alt="AI4Kids logo" className="brand-logo" />
          <div>
            <p className="brand-name">AI4Kids</p>
            <p className="brand-tagline">Smart fun for children</p>
          </div>
        </Link>

        <div className="header-actions">
          <NavLink to="/cart" className="cart-pill">
            Cart
            <span>{itemCount}</span>
          </NavLink>
          <button
            type="button"
            className={`mobile-menu-toggle ${mobileMenuOpen ? "active" : ""}`}
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav className={`site-nav ${mobileMenuOpen ? "open" : ""}`}>
          {primaryLinks.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div>
          <h3>AI4Kids</h3>
          <p>Built for fast mobile shopping, trusted checkout, and toy gifting that converts.</p>
        </div>
        <div className="footer-grid">
          <div>
            <h4>Highlights</h4>
            <p>Age-first discovery</p>
            <p>Discount-led cards</p>
            <p>COD confirmation flow</p>
          </div>
          <div>
            <h4>Trust</h4>
            <p>Secure Razorpay checkout</p>
            <p>Fast order processing</p>
            <p>WhatsApp order alerts</p>
          </div>
          <div>
            <h4>Policies</h4>
            <p><Link to="/about">About Us</Link></p>
            <p><Link to="/privacy-policy">Privacy Policy</Link></p>
            <p><Link to="/return-refund-policy">Return & Refund Policy</Link></p>
          </div>
        </div>
      </footer>
      {!isAdminRoute ? <LiveActivityToast /> : null}
    </div>
  );
};
