import { useEffect, useMemo, useState } from "react";
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

const analyticsInitialState = {
  filters: { range: "7d", startDate: "", endDate: "", label: "Last 7 Days" },
  overview: null,
  trafficSources: [],
  conversionFunnel: [],
  productPerformance: {
    mostViewed: [],
    mostClicked: [],
    mostAddedToCart: [],
    highestConverting: [],
  },
  categoryPerformance: [],
  campaignPerformance: [],
  geoInsight: { rows: [], note: "" },
  topLandingPages: [],
  recentVisitorJourneys: [],
  technicalDebug: [],
};

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "custom", label: "Custom Range" },
];

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

const TableCard = ({ title, subtitle = "", emptyText, children, actions = null }) => (
  <section className="section-panel analytics-card">
    <div className="section-head">
      <div>
        <h3>{title}</h3>
        {subtitle ? <p className="section-copy">{subtitle}</p> : null}
      </div>
      {actions}
    </div>
    {children || <p className="helper-text">{emptyText}</p>}
  </section>
);

const AnalyticsTable = ({ columns, rows, renderRow, emptyText = "No data yet." }) => {
  if (!rows.length) {
    return <p className="helper-text">{emptyText}</p>;
  }

  return (
    <div className="analytics-table">
      <div className="analytics-table-head">
        {columns.map((column) => (
          <span key={column}>{column}</span>
        ))}
      </div>
      <div className="analytics-table-body">
        {rows.map((row, index) => (
          <div
            key={
              row.id ||
              row.sourceLabel ||
              row.productName ||
              row.categoryLabel ||
              row.campaignLabel ||
              `${index}`
            }
            className="analytics-table-row"
          >
            {renderRow(row)}
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const token = window.localStorage.getItem("ai4kids-admin-token");
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(analyticsInitialState);
  const [analyticsRange, setAnalyticsRange] = useState("7d");
  const [customRange, setCustomRange] = useState({ startDate: "", endDate: "" });
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState("");
  const [notice, setNotice] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");
  const [exportingFormat, setExportingFormat] = useState("");
  const [importingCatalog, setImportingCatalog] = useState(false);

  const analyticsParams = useMemo(
    () => ({
      range: analyticsRange,
      startDate: analyticsRange === "custom" ? customRange.startDate : "",
      endDate: analyticsRange === "custom" ? customRange.endDate : "",
    }),
    [analyticsRange, customRange.endDate, customRange.startDate]
  );

  const loadAdminBasics = async () => {
    try {
      setDashboardLoading(true);
      const [summaryData, ordersData, productsData] = await Promise.all([
        getAdminSummary(token),
        getAdminOrders(token),
        getAdminProducts(token),
      ]);

      setSummary(summaryData.metrics);
      setOrders(
        ordersData.orders.filter((order) => confirmedOrderStatuses.has(order.orderStatus))
      );
      setProducts(productsData.products);
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

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError("");
      const analyticsData = await getAdminVisitAnalytics(token, analyticsParams);
      setAnalytics(analyticsData);
    } catch (error) {
      if (error.response?.status === 401) {
        window.localStorage.removeItem("ai4kids-admin-token");
        navigate("/admin", { replace: true });
        return;
      }
      setAnalyticsError(error.response?.data?.message || "Unable to load analytics right now.");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminBasics();
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [analyticsParams.range, analyticsParams.startDate, analyticsParams.endDate]);

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
      await loadAdminBasics();
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
      await loadAdminBasics();
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
            <h1>Decision Dashboard</h1>
            <p className="section-copy">
              Understand traffic quality, product intent, campaign performance, and where shoppers drop before they buy.
            </p>
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

      <section className="section-panel analytics-filter-panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Analytics window</span>
            <h2>{analytics.filters?.label || "Last 7 Days"}</h2>
          </div>
          {analyticsLoading ? <span className="helper-text">Refreshing analytics...</span> : null}
        </div>

        <div className="chip-row">
          {dateFilterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`filter-chip ${analyticsRange === option.value ? "active" : ""}`}
              onClick={() => setAnalyticsRange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {analyticsRange === "custom" ? (
          <div className="analytics-date-grid">
            <label className="field-stack">
              <span>Start date</span>
              <input
                className="text-input"
                type="date"
                value={customRange.startDate}
                onChange={(event) =>
                  setCustomRange((current) => ({ ...current, startDate: event.target.value }))
                }
              />
            </label>
            <label className="field-stack">
              <span>End date</span>
              <input
                className="text-input"
                type="date"
                value={customRange.endDate}
                onChange={(event) =>
                  setCustomRange((current) => ({ ...current, endDate: event.target.value }))
                }
              />
            </label>
          </div>
        ) : null}
      </section>

      {analyticsError ? (
        <section className="section-panel">
          <div className="empty-state">
            <p>{analyticsError}</p>
            <button type="button" className="primary-button" onClick={loadAnalytics}>
              Retry Analytics
            </button>
          </div>
        </section>
      ) : null}

      <section className="section-panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Traffic Overview</span>
            <h2>What traffic came and what converted</h2>
          </div>
        </div>
        <div className="metric-grid analytics-overview-grid">
          {analyticsLoading ? (
            Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="metric-card analytics-skeleton-card" />
            ))
          ) : (
            <>
              <div className="metric-card">
                <span>Visitors</span>
                <strong>{analytics.overview?.visitors || 0}</strong>
              </div>
              <div className="metric-card">
                <span>Sessions</span>
                <strong>{analytics.overview?.sessions || 0}</strong>
              </div>
              <div className="metric-card">
                <span>Page Views</span>
                <strong>{analytics.overview?.pageViews || 0}</strong>
              </div>
              <div className="metric-card">
                <span>Orders</span>
                <strong>{analytics.overview?.orders || 0}</strong>
              </div>
              <div className="metric-card">
                <span>Conversion Rate</span>
                <strong>{analytics.overview?.conversionRate || 0}%</strong>
              </div>
              <div className="metric-card">
                <span>Revenue</span>
                <strong>{formatCurrency(analytics.overview?.revenue || 0)}</strong>
              </div>
              <div className="metric-card">
                <span>Hero Clicks</span>
                <strong>{analytics.overview?.heroClicks || 0}</strong>
              </div>
              <div className="metric-card">
                <span>Search Usage</span>
                <strong>{analytics.overview?.searchUsage || 0}</strong>
              </div>
            </>
          )}
        </div>
      </section>

      <TableCard
        title="Traffic Sources"
        subtitle="See which channels bring visits, checkout starts, orders, and revenue."
      >
        {analyticsLoading ? (
          <div className="analytics-skeleton-table" />
        ) : (
          <AnalyticsTable
            columns={["Source", "Visits", "Page Views", "Checkout", "Orders", "Conv.", "Revenue"]}
            rows={analytics.trafficSources}
            emptyText="No traffic sources recorded yet."
            renderRow={(row) => (
              <>
                <span>{row.sourceLabel}</span>
                <span>{row.visits}</span>
                <span>{row.pageViews}</span>
                <span>{row.checkoutStarted}</span>
                <span>{row.orders}</span>
                <span>{row.conversionRate}%</span>
                <span>{formatCurrency(row.revenue)}</span>
              </>
            )}
          />
        )}
      </TableCard>

      <div className="admin-analytics-grid">
        <TableCard
          title="Conversion Funnel"
          subtitle="See where shoppers move forward and where they drop."
        >
          {analyticsLoading ? (
            <div className="analytics-skeleton-table" />
          ) : (
            <AnalyticsTable
              columns={["Stage", "Count", "Drop-off"]}
              rows={analytics.conversionFunnel}
              emptyText="Funnel data will appear after traffic and checkout activity."
              renderRow={(row) => (
                <>
                  <span>{row.label}</span>
                  <span>{row.count}</span>
                  <span>{row.dropOffRate}%</span>
                </>
              )}
            />
          )}
        </TableCard>

        <TableCard
          title="Top Landing Pages"
          subtitle="Understand which first-touch pages bring sessions in."
        >
          {analyticsLoading ? (
            <div className="analytics-skeleton-table" />
          ) : (
            <AnalyticsTable
              columns={["Landing Label", "Visits"]}
              rows={analytics.topLandingPages}
              emptyText="Landing page data will appear once visitors enter the storefront."
              renderRow={(row) => (
                <>
                  <span>{row.label}</span>
                  <span>{row.visits}</span>
                </>
              )}
            />
          )}
        </TableCard>
      </div>

      <div className="admin-analytics-grid">
        <TableCard title="Product Performance" subtitle="Find which products draw attention and convert.">
          {analyticsLoading ? (
            <div className="analytics-tab-stack">
              <div className="analytics-skeleton-table" />
            </div>
          ) : (
            <div className="analytics-tab-stack">
              <div>
                <h4>Most Viewed</h4>
                <AnalyticsTable
                  columns={["Product", "Views", "Conv."]}
                  rows={analytics.productPerformance?.mostViewed || []}
                  emptyText="No product view data yet."
                  renderRow={(row) => (
                    <>
                      <span>{row.productName}</span>
                      <span>{row.views}</span>
                      <span>{row.conversionRate}%</span>
                    </>
                  )}
                />
              </div>
              <div>
                <h4>Most Clicked</h4>
                <AnalyticsTable
                  columns={["Product", "Clicks"]}
                  rows={analytics.productPerformance?.mostClicked || []}
                  emptyText="No product click data yet."
                  renderRow={(row) => (
                    <>
                      <span>{row.productName}</span>
                      <span>{row.clicks}</span>
                    </>
                  )}
                />
              </div>
              <div>
                <h4>Most Added to Cart</h4>
                <AnalyticsTable
                  columns={["Product", "Add to Cart", "Conv."]}
                  rows={analytics.productPerformance?.mostAddedToCart || []}
                  emptyText="No add-to-cart data yet."
                  renderRow={(row) => (
                    <>
                      <span>{row.productName}</span>
                      <span>{row.addToCart}</span>
                      <span>{row.conversionRate}%</span>
                    </>
                  )}
                />
              </div>
              <div>
                <h4>Highest Converting</h4>
                <AnalyticsTable
                  columns={["Product", "Orders", "Conv."]}
                  rows={analytics.productPerformance?.highestConverting || []}
                  emptyText="No conversion data yet."
                  renderRow={(row) => (
                    <>
                      <span>{row.productName}</span>
                      <span>{row.orders}</span>
                      <span>{row.conversionRate}%</span>
                    </>
                  )}
                />
              </div>
            </div>
          )}
        </TableCard>

        <TableCard title="Category Performance" subtitle="See which categories attract clicks and convert into orders.">
          {analyticsLoading ? (
            <div className="analytics-skeleton-table" />
          ) : (
            <AnalyticsTable
              columns={["Category", "Clicks", "Orders", "Conv."]}
              rows={analytics.categoryPerformance}
              emptyText="No category click data yet."
              renderRow={(row) => (
                <>
                  <span>{row.categoryLabel}</span>
                  <span>{row.clicks}</span>
                  <span>{row.orders}</span>
                  <span>{row.conversionRate}%</span>
                </>
              )}
            />
          )}
        </TableCard>
      </div>

      <div className="admin-analytics-grid">
        <TableCard title="Campaign Performance" subtitle="Identify which campaigns create sessions, orders, and revenue.">
          {analyticsLoading ? (
            <div className="analytics-skeleton-table" />
          ) : (
            <AnalyticsTable
              columns={["Campaign", "Source", "Sessions", "Orders", "Conv.", "Revenue"]}
              rows={analytics.campaignPerformance}
              emptyText="No campaign-tagged traffic yet."
              renderRow={(row) => (
                <>
                  <span>{row.campaignLabel}</span>
                  <span>{row.sourceLabel}</span>
                  <span>{row.sessions}</span>
                  <span>{row.orders}</span>
                  <span>{row.conversionRate}%</span>
                  <span>{formatCurrency(row.revenue)}</span>
                </>
              )}
            />
          )}
        </TableCard>

        <TableCard title="Geo Insight" subtitle="Know where interested visitors are browsing from.">
          {analyticsLoading ? (
            <div className="analytics-skeleton-table" />
          ) : (
            <>
              {analytics.geoInsight?.note ? (
                <p className="helper-text">{analytics.geoInsight.note}</p>
              ) : null}
              <AnalyticsTable
                columns={["Location", "Sessions"]}
                rows={analytics.geoInsight?.rows || []}
                emptyText="No geo data captured yet."
                renderRow={(row) => (
                  <>
                    <span>{row.label}</span>
                    <span>{row.sessions}</span>
                  </>
                )}
              />
            </>
          )}
        </TableCard>
      </div>

      <TableCard
        title="Recent Visitor Journeys"
        subtitle="Review real session paths to understand interest and drop-off behavior."
      >
        {analyticsLoading ? (
          <div className="analytics-skeleton-table" />
        ) : analytics.recentVisitorJourneys.length ? (
          <div className="journey-list">
            {analytics.recentVisitorJourneys.map((journey) => (
              <details key={journey.sessionId} className="journey-card">
                <summary>
                  <div>
                    <strong>{journey.sourceLabel}</strong>
                    <p>{journey.location}</p>
                  </div>
                  <span>{new Date(journey.endedAt).toLocaleString("en-IN")}</span>
                </summary>
                <p className="journey-path">{journey.steps.join(" -> ") || "No journey steps recorded yet."}</p>
                <p className="helper-text">
                  Landing: {journey.landingLabel} | Page views: {journey.pageViews}
                </p>
              </details>
            ))}
          </div>
        ) : (
          <p className="helper-text">No recent visitor journeys captured yet.</p>
        )}
      </TableCard>

      <TableCard title="Technical Debug" subtitle="Raw attribution details for troubleshooting campaigns and links.">
        {analyticsLoading ? (
          <div className="analytics-skeleton-table" />
        ) : analytics.technicalDebug.length ? (
          <div className="journey-list">
            {analytics.technicalDebug.map((item) => (
              <details key={`${item.sessionId}-debug`} className="journey-card">
                <summary>
                  <div>
                    <strong>{item.sourceLabel}</strong>
                    <p>{item.landingLabel}</p>
                  </div>
                  <span>{item.sessionId}</span>
                </summary>
                <div className="debug-grid">
                  <p><strong>Landing path:</strong> {item.landingPath || "N/A"}</p>
                  <p><strong>Raw referrer:</strong> {item.rawReferrer || "Direct"}</p>
                  <p><strong>UTM source:</strong> {item.rawUTM?.source || "N/A"}</p>
                  <p><strong>UTM medium:</strong> {item.rawUTM?.medium || "N/A"}</p>
                  <p><strong>UTM campaign:</strong> {item.rawUTM?.campaign || "N/A"}</p>
                </div>
              </details>
            ))}
          </div>
        ) : (
          <p className="helper-text">Debug attribution details will appear after tracked sessions begin.</p>
        )}
      </TableCard>

      <section className="section-panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Catalog upload</span>
            <h2>Import products by SKU</h2>
          </div>
        </div>

        <div className="admin-upload-panel">
          <p className="section-copy">
            Upload a CSV or Excel catalog to create new SKUs and update existing ones in one pass. Live product cache is cleared automatically after import.
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
    </div>
  );
};
