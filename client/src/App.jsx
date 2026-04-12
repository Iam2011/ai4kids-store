import { Navigate, Route, Routes } from "react-router-dom";
import { AboutPage } from "./pages/AboutPage.jsx";
import { Layout } from "./components/Layout.jsx";
import { AdminDashboardPage } from "./pages/AdminDashboardPage.jsx";
import { AdminLoginPage } from "./pages/AdminLoginPage.jsx";
import { CartPage } from "./pages/CartPage.jsx";
import { CheckoutPage } from "./pages/CheckoutPage.jsx";
import { CodOrderSuccessPage } from "./pages/CodOrderSuccessPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { OrderSuccessPage } from "./pages/OrderSuccessPage.jsx";
import { PaymentFailurePage } from "./pages/PaymentFailurePage.jsx";
import { ProductPage } from "./pages/ProductPage.jsx";
import { ProductsPage } from "./pages/ProductsPage.jsx";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage.jsx";
import { ReturnRefundPage } from "./pages/ReturnRefundPage.jsx";

const AdminRoute = ({ children }) => {
  const token = window.localStorage.getItem("ai4kids-admin-token");
  return token ? children : <Navigate to="/admin" replace />;
};

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
        <Route path="/cod-success/:orderNumber" element={<CodOrderSuccessPage />} />
        <Route path="/payment-failure" element={<PaymentFailurePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/return-refund-policy" element={<ReturnRefundPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
      </Routes>
    </Layout>
  );
}
