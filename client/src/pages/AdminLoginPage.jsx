import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../api/storeApi.js";

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await adminLogin({ email, password });
      window.localStorage.setItem("ai4kids-admin-token", response.token);
      navigate("/admin/dashboard");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-shell">
      <form className="admin-auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">Admin panel</span>
        <h1>Manage orders and products</h1>
        <input className="text-input" placeholder="Admin email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input className="text-input" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {errorMessage ? <p className="helper-text error-text">{errorMessage}</p> : null}
        <button className="primary-button large" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};
