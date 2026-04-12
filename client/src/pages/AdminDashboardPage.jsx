import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createAdminProduct,
  getAdminOrders,
  getAdminProducts,
  getAdminSummary,
  updateAdminProduct,
} from "../api/storeApi.js";
import { formatCurrency } from "../utils/currency.js";

const emptyProduct = {
  sku: "",
  name: "",
  slug: "",
  price: 0,
  originalPrice: 0,
  discountPercent: 0,
  imageUrl: "",
  gallery: "",
  videoUrl: "",
  description: "",
  shortDescription: "",
  category: "Educational",
  subCategory: "",
  ageGroup: "3-5",
  moq: 1,
  stockCount: 10,
  limitedStock: false,
  badge: "",
  featured: false,
  tags: "",
  isActive: true,
};

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const token = window.localStorage.getItem("ai4kids-admin-token");
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState("");
  const [notice, setNotice] = useState("");

  const loadDashboard = async () => {
    try {
      const [summaryData, ordersData, productsData] = await Promise.all([
        getAdminSummary(token),
        getAdminOrders(token),
        getAdminProducts(token),
      ]);

      setSummary(summaryData.metrics);
      setOrders(ordersData.orders);
      setProducts(productsData.products);
    } catch (error) {
      if (error.response?.status === 401) {
        window.localStorage.removeItem("ai4kids-admin-token");
        navigate("/admin", { replace: true });
        return;
      }
      setNotice(error.response?.data?.message || "Unable to load admin data.");
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      ...product,
      gallery: (product.gallery || []).join(", "),
      tags: (product.tags || []).join(", "),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      gallery: String(form.gallery || "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
      tags: String(form.tags || "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
    };

    try {
      if (editingId) {
        await updateAdminProduct(token, editingId, payload);
        setNotice("Product updated.");
      } else {
        await createAdminProduct(token, payload);
        setNotice("Product created.");
      }

      setForm(emptyProduct);
      setEditingId("");
      await loadDashboard();
    } catch (error) {
      setNotice(error.response?.data?.message || "Unable to save product.");
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem("ai4kids-admin-token");
    window.location.assign("/admin");
  };

  return (
    <div className="page-stack admin-dashboard">
      <section className="section-panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Admin</span>
            <h1>Dashboard</h1>
          </div>
          <button className="secondary-button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="metric-grid">
          <div className="metric-card">
            <span>Total products</span>
            <strong>{summary?.productCount || 0}</strong>
          </div>
          <div className="metric-card">
            <span>Total orders</span>
            <strong>{summary?.orderCount || 0}</strong>
          </div>
          <div className="metric-card">
            <span>Pending orders</span>
            <strong>{summary?.pendingOrders || 0}</strong>
          </div>
          <div className="metric-card">
            <span>Captured revenue</span>
            <strong>{formatCurrency(summary?.capturedRevenue || 0)}</strong>
          </div>
        </div>
      </section>

      <section className="section-panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Product editor</span>
            <h2>{editingId ? "Edit product" : "Add product"}</h2>
          </div>
        </div>

        <form className="admin-form-grid" onSubmit={handleSubmit}>
          <input className="text-input" name="sku" placeholder="SKU" value={form.sku} onChange={handleChange} />
          <input className="text-input" name="name" placeholder="Name" value={form.name} onChange={handleChange} />
          <input className="text-input" name="slug" placeholder="Slug" value={form.slug} onChange={handleChange} />
          <input className="text-input" name="imageUrl" placeholder="Image URL" value={form.imageUrl} onChange={handleChange} />
          <input className="text-input" name="gallery" placeholder="Gallery URLs, comma separated" value={form.gallery} onChange={handleChange} />
          <input className="text-input" name="videoUrl" placeholder="Video URL" value={form.videoUrl} onChange={handleChange} />
          <input className="text-input" name="price" placeholder="Price" type="number" value={form.price} onChange={handleChange} />
          <input className="text-input" name="originalPrice" placeholder="Original price" type="number" value={form.originalPrice} onChange={handleChange} />
          <input className="text-input" name="discountPercent" placeholder="Discount %" type="number" value={form.discountPercent} onChange={handleChange} />
          <input className="text-input" name="subCategory" placeholder="Sub-category" value={form.subCategory} onChange={handleChange} />
          <select className="text-input" name="category" value={form.category} onChange={handleChange}>
            <option value="Remote Toys">Remote Toys</option>
            <option value="Board Games">Board Games</option>
            <option value="Educational">Educational</option>
            <option value="Outdoor">Outdoor</option>
          </select>
          <select className="text-input" name="ageGroup" value={form.ageGroup} onChange={handleChange}>
            <option value="0-2">0-2</option>
            <option value="3-5">3-5</option>
            <option value="6-8">6-8</option>
            <option value="9+">9+</option>
          </select>
          <input className="text-input" name="moq" placeholder="MOQ" type="number" value={form.moq} onChange={handleChange} />
          <input className="text-input" name="stockCount" placeholder="Stock" type="number" value={form.stockCount} onChange={handleChange} />
          <input className="text-input" name="badge" placeholder="Badge" value={form.badge} onChange={handleChange} />
          <input className="text-input" name="shortDescription" placeholder="Short description" value={form.shortDescription} onChange={handleChange} />
          <textarea className="text-input textarea admin-wide" name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          <input className="text-input admin-wide" name="tags" placeholder="Tags, comma separated" value={form.tags} onChange={handleChange} />
          <label className="check-row">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
            Featured
          </label>
          <label className="check-row">
            <input type="checkbox" name="limitedStock" checked={form.limitedStock} onChange={handleChange} />
            Limited stock
          </label>
          <label className="check-row">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
            Active
          </label>
          {notice ? <p className="helper-text admin-wide">{notice}</p> : null}
          <div className="hero-cta-row admin-wide">
            <button className="primary-button" type="submit">
              {editingId ? "Update Product" : "Create Product"}
            </button>
            <button className="secondary-button" type="button" onClick={() => { setForm(emptyProduct); setEditingId(""); }}>
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="section-panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Products</span>
            <h2>Catalog view</h2>
          </div>
        </div>
        <div className="admin-table">
          {products.map((product) => (
            <div key={product._id} className="admin-row">
              <div>
                <strong>{product.name}</strong>
                <p>{product.category} | {product.ageGroup}</p>
              </div>
              <div>
                <span>{formatCurrency(product.price)}</span>
              </div>
              <button className="secondary-button" onClick={() => handleEdit(product)}>
                Edit
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="section-panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Orders</span>
            <h2>Recent order feed</h2>
          </div>
        </div>
        <div className="admin-table">
          {orders.map((order) => (
            <div key={order._id} className="admin-row large">
              <div>
                <strong>{order.orderNumber}</strong>
                <p>{order.customer.name} | {order.customer.mobile}</p>
                <p>
                  {order.items
                    .map((item) =>
                      item.itemType === "combo"
                        ? `${item.name} (${item.bundleItems?.map((bundleItem) => bundleItem.name).join(", ")})`
                        : item.name
                    )
                    .join(" | ")}
                </p>
              </div>
              <div>
                <span>{formatCurrency(order.totalAmount)}</span>
                <p>{order.paymentStatus} | {order.orderStatus}</p>
                {order.paymentMode === "cod_deposit" ? (
                  <p>
                    COD Fee {formatCurrency(order.codConfirmationFee || order.paymentAmount)} | Paid now {formatCurrency(order.paymentAmount)}
                  </p>
                ) : null}
              </div>
              <div>
                <span>{order.paymentMode}</span>
                <p>{new Date(order.createdAt).toLocaleString("en-IN")}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
