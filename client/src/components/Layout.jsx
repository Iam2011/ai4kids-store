import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const drawerLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/products", label: "Shop" },
  { to: "/checkout", label: "Checkout" },
  { to: "/about", label: "About Us" },
  { to: "/shipping-policy", label: "Shipping Policy" },
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/return-refund-policy", label: "Return & Refund" },
  { to: "/admin", label: "Admin" },
];

const browseNavLinks = [
  { to: "/", label: "Home", end: true, icon: "home" },
  { to: "/products", label: "Categories", icon: "grid" },
  { to: "/products?featured=true", label: "Offers", icon: "tag" },
  { to: "/cart", label: "Cart", icon: "cart" },
];

const getNavClassName = ({ isActive }, baseClassName = "") =>
  [baseClassName, isActive ? "active" : ""].filter(Boolean).join(" ");

const MenuIcon = () => (
  <>
    <span />
    <span />
    <span />
  </>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M10.5 4a6.5 6.5 0 014.83 10.84l4.41 4.41-1.42 1.42-4.41-4.41A6.5 6.5 0 1110.5 4zm0 2a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"
      fill="currentColor"
    />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M7 5h13l-1.55 5.41A2 2 0 0116.53 12H9.2l-.38 1.5h9.93v2H8a2 2 0 01-1.94-2.49L7.6 7H5V5h2zm1.5 12a1.75 1.75 0 110 3.5 1.75 1.75 0 010-3.5zm8 0a1.75 1.75 0 110 3.5 1.75 1.75 0 010-3.5z"
      fill="currentColor"
    />
  </svg>
);

const BottomIcon = ({ kind }) => {
  if (kind === "grid") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" fill="currentColor" />
      </svg>
    );
  }

  if (kind === "tag") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 10V4h6l10 10-6 6L3 10zm5-4H5v3l8 8 3-3L8 6z" fill="currentColor" />
      </svg>
    );
  }

  if (kind === "cart") {
    return <CartIcon />;
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4l8 6v10h-6v-6h-4v6H4V10l8-6z" fill="currentColor" />
    </svg>
  );
};

export const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isBrowseRoute =
    location.pathname === "/" ||
    location.pathname === "/products" ||
    location.pathname.startsWith("/products/");
  const showBottomNav = !isAdminRoute && ["/", "/products", "/cart"].includes(location.pathname);
  const showFooter = !isAdminRoute && !["/", "/products"].includes(location.pathname);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <div className={`site-shell ${mobileMenuOpen ? "menu-open" : ""}`}>
      <header className="site-header app-header">
        <div className="header-surface">
          <button
            type="button"
            className={`mobile-menu-toggle ${mobileMenuOpen ? "active" : ""}`}
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <MenuIcon />
          </button>

          <Link to="/" className="brand-wordmark" aria-label="AI4Kids home">
            <span>AI4</span>
            <span>Kids</span>
          </Link>

          <div className="header-actions">
            {!isAdminRoute ? (
              <button
                type="button"
                className="header-icon-button"
                onClick={() => navigate("/products")}
                aria-label="Search products"
              >
                <SearchIcon />
              </button>
            ) : null}

            {!isAdminRoute ? (
              <NavLink
                to="/cart"
                className={(state) => getNavClassName(state, "header-cart-button")}
                aria-label="Open cart"
              >
                <CartIcon />
                {itemCount ? <span className="cart-badge">{itemCount}</span> : null}
              </NavLink>
            ) : null}
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
            {drawerLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={(state) => getNavClassName(state)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="drawer-support-card">
            <strong>Need help with an order?</strong>
            <p>Support for combo orders, delivery updates, or payment help.</p>
            <a href="mailto:support@ai4kids.in">support@ai4kids.in</a>
          </div>
        </nav>
      </header>

      <main className={`site-main ${isBrowseRoute ? "browse-main" : ""}`}>{children}</main>

      {showFooter ? (
        <footer className="site-footer">
          <div className="footer-brand-block">
            <strong className="footer-wordmark">AI4Kids</strong>
            <p>Curated toy shopping with combo offers, COD support, and mobile-first ordering.</p>
          </div>
          <div className="footer-grid">
            <div>
              <h4>Shop</h4>
              <p><Link to="/products?featured=true">Best Sellers</Link></p>
              <p><Link to="/products?category=Remote%20Toys">Cars</Link></p>
              <p><Link to="/products?category=Outdoor">Scooters</Link></p>
            </div>
            <div>
              <h4>Policies</h4>
              <p><Link to="/about">About Us</Link></p>
              <p><Link to="/privacy-policy">Privacy Policy</Link></p>
              <p><Link to="/return-refund-policy">Return & Refund</Link></p>
            </div>
          </div>
        </footer>
      ) : null}

      {showBottomNav ? (
        <div className="mobile-bottom-nav" aria-label="Primary mobile navigation">
          {browseNavLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={(state) => getNavClassName(state, "bottom-nav-link")}
            >
              <BottomIcon kind={link.icon} />
              <span>{link.label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            className="bottom-nav-link bottom-nav-action"
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-label="Open more menu links"
          >
            <span className="menu-dots" aria-hidden="true" />
            <span>More</span>
          </button>
        </div>
      ) : null}
    </div>
  );
};
