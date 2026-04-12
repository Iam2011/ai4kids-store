import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export const Layout = ({ children }) => {
  const { itemCount } = useCart();

  return (
    <div className="site-shell">
      <div className="promo-strip">
        <span>Sale ending soon</span>
        <span>Instagram deal: extra value bundles for fast checkout</span>
        <span>COD available with just Rs 40 confirmation</span>
      </div>

      <header className="site-header">
        <Link to="/" className="brand-lockup">
          <img src="/logo.png" alt="AI4Kids logo" className="brand-logo" />
          <div>
            <p className="brand-name">AI4Kids</p>
            <p className="brand-tagline">Smart fun for children</p>
          </div>
        </Link>

        <nav className="site-nav">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/products">Shop</NavLink>
          <NavLink to="/checkout">Checkout</NavLink>
          <NavLink to="/admin">Admin</NavLink>
          <NavLink to="/cart" className="cart-pill">
            Cart
            <span>{itemCount}</span>
          </NavLink>
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
        </div>
      </footer>
    </div>
  );
};
