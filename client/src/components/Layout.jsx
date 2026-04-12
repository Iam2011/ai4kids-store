import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { LiveActivityToast } from "./LiveActivityToast.jsx";

const primaryLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Shop" },
  { to: "/checkout", label: "Checkout" },
  { to: "/about", label: "About Us" },
  { to: "/shipping-policy", label: "Shipping Policy" },
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/return-refund-policy", label: "Return & Refund" },
  { to: "/admin", label: "Admin" },
];

const bottomLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Shop" },
  { to: "/cart", label: "Cart" },
];

export const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isProductDetailRoute = location.pathname.startsWith("/products/");
  const isTransactionalRoute =
    isAdminRoute ||
    isProductDetailRoute ||
    ["/cart", "/checkout"].includes(location.pathname) ||
    location.pathname.startsWith("/order-success/") ||
    location.pathname.startsWith("/cod-success/");
  const hideLiveActivity = isTransactionalRoute || location.pathname === "/payment-failure";

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className={`site-shell ${mobileMenuOpen ? "menu-open" : ""}`}>
      {!isAdminRoute ? (
        <div className="promo-strip app-announcement">
          <span>COD available</span>
          <span>Premium toy picks for gifting</span>
          <span>Fast mobile checkout</span>
        </div>
      ) : null}

      <header className="site-header app-header">
        <div className="header-surface">
          <Link to="/" className="brand-lockup app-brand" aria-label="AI4Kids home">
            <span className="brand-mark" aria-hidden="true">
              <span />
            </span>
            <div className="brand-copy">
              <p className="brand-name">AI4Kids</p>
              <p className="brand-tagline">Smart fun for children</p>
            </div>
          </Link>

          <div className="header-actions">
            {!isAdminRoute ? (
              <button
                type="button"
                className="search-trigger"
                onClick={() => navigate("/products")}
              >
                Search
              </button>
            ) : null}

            {!isAdminRoute ? (
              <NavLink to="/cart" className="cart-pill">
                Cart
                <span>{itemCount}</span>
              </NavLink>
            ) : null}

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
        </div>

        <button
          type="button"
          className={`drawer-backdrop ${mobileMenuOpen ? "open" : ""}`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden={!mobileMenuOpen}
          tabIndex={mobileMenuOpen ? 0 : -1}
        />

        <nav className={`site-nav app-drawer ${mobileMenuOpen ? "open" : ""}`}>
          <div className="drawer-head">
            <div>
              <span className="eyebrow">Quick Menu</span>
              <h2>Browse AI4Kids</h2>
            </div>
            <button
              type="button"
              className="drawer-close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              Close
            </button>
          </div>

          <div className="drawer-links">
            {primaryLinks.map((link) => (
              <NavLink key={link.to} to={link.to}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="drawer-support-card">
            <strong>Need help with an order?</strong>
            <p>Use our support mail for payment, delivery, or combo order questions.</p>
            <a href="mailto:support@ai4kids.in">support@ai4kids.in</a>
          </div>
        </nav>
      </header>

      <main className="site-main">{children}</main>

      {!isAdminRoute ? (
        <footer className="site-footer">
          <div className="footer-brand-block">
            <h3>AI4Kids Toy Store</h3>
            <p>
              Mobile-first toy shopping for parents, gifting buyers, and fast-moving combo offers.
            </p>
          </div>
          <div className="footer-grid">
            <div>
              <h4>Shop</h4>
              <p>
                <Link to="/products?featured=true">Best Sellers</Link>
              </p>
              <p>
                <Link to="/products?ageGroup=3-5">Ages 3-5</Link>
              </p>
              <p>
                <Link to="/products?ageGroup=6-8">Ages 6-8</Link>
              </p>
            </div>
            <div>
              <h4>Trust</h4>
              <p>Secure Razorpay checkout</p>
              <p>COD with transparent fee</p>
              <p>Fast dispatch support</p>
            </div>
            <div>
              <h4>Policies</h4>
              <p>
                <Link to="/about">About Us</Link>
              </p>
              <p>
                <Link to="/shipping-policy">Shipping Policy</Link>
              </p>
              <p>
                <Link to="/privacy-policy">Privacy Policy</Link>
              </p>
              <p>
                <Link to="/return-refund-policy">Return & Refund Policy</Link>
              </p>
            </div>
          </div>
        </footer>
      ) : null}

      {!isTransactionalRoute ? (
        <div className="mobile-bottom-nav" aria-label="Primary mobile navigation">
          {bottomLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className="bottom-nav-link">
              <span>{link.label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            className="bottom-nav-link bottom-nav-action"
            onClick={() => setMobileMenuOpen((current) => !current)}
          >
            <span>Menu</span>
          </button>
        </div>
      ) : null}

      {!hideLiveActivity ? <LiveActivityToast /> : null}
    </div>
  );
};
