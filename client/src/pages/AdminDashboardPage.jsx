import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createAdminProduct,
  downloadAdminOrdersExport,
  getAdminOrders,
  getAdminProducts,
  getAdminSummary,
  getAdminVisitAnalytics,
  importAdminCatalog,
  updateAdminProduct,
} from "../api/storeApi.js";
import { storefrontCategories } from "../constants/storefrontCategories.js";
import { formatCurrency } from "../utils/currency.js";

const confirmedOrderStatuses = new Set(["confirmed", "processing", "shipped", "delivered"]);

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
  category: "Educational & Learning Toys",
  rawCategory: "",
  subCategory: "",
  ageGroup: "3-5",
  moq: 1,
  stockCount: 10,
  limitedStock: false,
  badge: "",
  featured: false,
  features: "",
  rating: 4.5,
  reviewCount: 0,
  tags: "",
  isActive: true,
};

const downloadBlobFile = ({ blob, filename }) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

const formatVisitLocation = (visit) =>
  [visit.city, visit.state, visit.country].filter(Boolean).join(", ") || "Unknown";

const formatTopCitySummary = (analytics) => {
  const topCity = analytics.topCities?.[0];
  if (!topCity) {
    return "Start browsing the storefront to capture city-level visitor activity.";
  }

  return `${topCity.uniqueVisitors} visitors browsed from ${topCity.city}.`;
};

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const token = window.localStorage.getItem("ai4kids-admin-token");
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState({
    metrics: null,
    topCities: [],
    topPages: [],
    recentVisits: [],
  });
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState("");
  const [notice, setNotice] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [exportingFormat, setExportingFormat] = useState("");
  const [importingCatalog, setImportingCatalog] = useState(false);

  const loadDashboard = async () => {
    try {
      setDashboardLoading(true);
      const [summaryData, ordersData, productsData, analyticsData] = await Promise.all([
        getAdminSummary(token),
        getAdminOrders(token),
        getAdminProducts(token),
        getAdminVisitAnalytics(token),
      ]);

      setSummary(summaryData.metrics);
      setOrders(
        ordersData.orders.filter((order) => confirmedOrderStatuses.has(order.orderStatus))
      );
      setProducts(productsData.products);
      setAnalytics(analyticsData);
    } catch (error) {
      if (error.response?.status === 401) {
        window.localStorage.removeItem("ai4kids-admin-token");
        navigate("/admin", { replace: true });
        return;
      }
      setNotice(error.response?.data?.message || "Unable to load admin data.");
    } finally {
      setDashboardLoading(false);
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
      features: (product.features || []).join(", "),
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
      features: String(form.features || "")
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
        setNotice("Product updated and storefront cache cleared.");
      } else {
        await createAdminProduct(token, payload);
        setNotice("Product created and storefront cache cleared.");
      }

      setForm(emptyProduct);
      setEditingId("");
      await loadDashboard();
    } catch (error) {
      setNotice(error.response?.data?.message || "Unable to save product.");
    }
  };

  const handleCatalogImport = async () => {
    if (!uploadFile) {
      setNotice("Choose a CSV or XLSX catalog file first.");
      return;
    }

    try {
      setImportingCatalog(true);
      const response = await importAdminCatalog(token, uploadFile);
      const { summary: nextImportSummary, errors = [] } = response;
      setImportSummary({
        ...nextImportSummary,
        errors,
      });
      setNotice(
        `Catalog imported: ${nextImportSummary.created} created, ${nextImportSummary.updated} updated, ${nextImportSummary.skipped} skipped.`
      );
      setUploadFile(null);
      await loadDashboard();
    } catch (error) {
      setNotice(error.response?.data?.message || "Unable to import catalog.");
    } finally {
      setImportingCatalog(false);
    }
  };

  const handleExportOrders = async (format) => {
    try {
      setExportingFormat(format);
      const file = await downloadAdminOrdersExport(token, format);
      downloadBlobFile(file);
      setNotice(`${format.toUpperCase()} export downloaded.`);
    } catch (error) {
      setNotice(error.response?.data?.message || "Unable to export orders.");
    } finally {
      setExportingFormat("");
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
            <span className="eyebrow">Catalog upload</span>
            <h2>Import products by SKU</h2>
          </div>
        </div>

        <div className="admin-upload-panel">
          <p className="section-copy">
            Upload a CSV or Excel catalog to create new SKUs and update existing ones in one pass.
            Live product cache is cleared automatically after import.
          </p>
          <input
            className="text-input"
            type="file"
            accept=".xlsx,.csv"
            onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
          />
          <div className="hero-cta-row">
            <button
              className="primary-button"
              type="button"
              onClick={handleCatalogImport}
              disabled={importingCatalog}
            >
              {importingCatalog ? "Importing catalog..." : "Upload Catalog"}
            </button>
            {uploadFile ? <span className="helper-text">{uploadFile.name}</span> : null}
          </div>

          {importSummary ? (
            <div className="admin-import-summary">
              <div className="metric-grid compact">
                <div className="metric-card">
                  <span>Created</span>
                  <strong>{importSummary.created}</strong>
                </div>
                <div className="metric-card">
                  <span>Updated</span>
                  <strong>{importSummary.updated}</strong>
                </div>
                <div className="metric-card">
                  <span>Skipped</span>
                  <strong>{importSummary.skipped}</strong>
                </div>
                <div className="metric-card">
                  <span>Failed</span>
                  <strong>{importSummary.failed}</strong>
                </div>
              </div>

              <p className="helper-text">
                Source: {importSummary.filename} | Rows processed: {importSummary.totalRows}
              </p>

              {importSummary.errors?.length ? (
                <div className="admin-import-errors">
                  <strong>Import notes</strong>
                  {importSummary.errors.slice(0, 5).map((error) => (
                    <p key={`${error.row}-${error.message}`}>
                      Row {error.row}: {error.message}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
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
          <input className="text-input" name="rawCategory" placeholder="Raw category" value={form.rawCategory} onChange={handleChange} />
          <input className="text-input" name="subCategory" placeholder="Sub-category" value={form.subCategory} onChange={handleChange} />
          <select className="text-input" name="category" value={form.category} onChange={handleChange}>
            {storefrontCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select className="text-input" name="ageGroup" value={form.ageGroup} onChange={handleChange}>
            <option value="0-2">0-2</option>
            <option value="3-5">3-5</option>
            <option value="6-8">6-8</option>
            <option value="9+">9+</option>
          </select>
          <input className="text-input" name="moq" placeholder="MOQ" type="number" value={form.moq} onChange={handleChange} />
          <input className="text-input" name="stockCount" placeholder="Stock" type="number" value={form.stockCount} onChange={handleChange} />
          <input className="text-input" name="rating" placeholder="Rating" type="number" step="0.1" value={form.rating} onChange={handleChange} />
          <input className="text-input" name="reviewCount" placeholder="Review count" type="number" value={form.reviewCount} onChange={handleChange} />
          <input className="text-input" name="badge" placeholder="Badge" value={form.badge} onChange={handleChange} />
          <input className="text-input" name="shortDescription" placeholder="Short description" value={form.shortDescription} onChange={handleChange} />
          <textarea className="text-input textarea admin-wide" name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          <input className="text-input admin-wide" name="features" placeholder="Features, comma separated" value={form.features} onChange={handleChange} />
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
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setForm(emptyProduct);
                setEditingId("");
              }}
            >
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
            <p className="section-copy">
              Recent products from the live catalog. Editing here updates the storefront data source.
            </p>
          </div>
          {dashboardLoading ? <span className="helper-text">Refreshing catalog...</span> : null}
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
            <h2>Confirmed customer orders</h2>
            <p className="section-copy">
              Download confirmed-flow orders with order IDs, customer details, totals, and item lines.
            </p>
          </div>
          <div className="admin-action-row">
            <button
              className="secondary-button"
              type="button"
              onClick={() => handleExportOrders("csv")}
              disabled={exportingFormat === "csv"}
            >
              {exportingFormat === "csv" ? "Downloading CSV..." : "Download CSV"}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => handleExportOrders("xlsx")}
              disabled={exportingFormat === "xlsx"}
            >
              {exportingFormat === "xlsx" ? "Downloading Excel..." : "Download Excel"}
            </button>
          </div>
        </div>
        <div className="admin-table">
          {orders.map((order) => (
            <div key={order._id} className="admin-row large">
              <div>
                <strong>{order.orderNumber}</strong>
                <p>ID: {order._id}</p>
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

      <section className="section-panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Traffic analytics</span>
            <h2>Recent visit activity</h2>
            <p className="section-copy">{analytics.metrics?.trackingWindow || "Last 7 days"}</p>
          </div>
        </div>

        <div className="metric-grid">
          <div className="metric-card">
            <span>Unique visitors</span>
            <strong>{analytics.metrics?.uniqueVisitors || 0}</strong>
          </div>
          <div className="metric-card">
            <span>Page views</span>
            <strong>{analytics.metrics?.pageViews || 0}</strong>
          </div>
        </div>

        <div className="admin-analytics-summary">
          <strong>City insight</strong>
          <p>{formatTopCitySummary(analytics)}</p>
        </div>

        <div className="admin-analytics-grid">
          <div className="admin-table">
            <h3>Top cities</h3>
            {analytics.topCities.length ? (
              analytics.topCities.map((city) => (
                <div key={city.city} className="admin-row">
                  <div>
                    <strong>{city.city}</strong>
                    <p>{city.uniqueVisitors} visitors</p>
                  </div>
                  <div>
                    <span>{city.pageViews} views</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="helper-text">No city analytics captured yet.</p>
            )}
          </div>

          <div className="admin-table">
            <h3>Top pages</h3>
            {analytics.topPages.length ? (
              analytics.topPages.map((page) => (
                <div key={page.path} className="admin-row">
                  <div>
                    <strong>{page.path}</strong>
                  </div>
                  <div>
                    <span>{page.views} views</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="helper-text">Top pages will appear once visitors browse the storefront.</p>
            )}
          </div>
        </div>

        <div className="admin-table">
          <h3>Recent surfing feed</h3>
          {analytics.recentVisits.length ? (
            analytics.recentVisits.map((visit) => (
              <div key={visit.id} className="admin-row large">
                <div>
                  <strong>{visit.path}</strong>
                  <p>{formatVisitLocation(visit)}</p>
                  <p>Session: {visit.sessionId}</p>
                </div>
                <div>
                  <span>{visit.deviceType}</span>
                  <p>{new Date(visit.createdAt).toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="helper-text">
              No surfing activity captured yet. Visit the storefront to start logging anonymous sessions.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
