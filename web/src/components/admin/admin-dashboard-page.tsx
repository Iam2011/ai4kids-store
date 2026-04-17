"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ADMIN_TOKEN_STORAGE_KEY,
  ApiError,
  createAdminProduct,
  downloadAdminOrdersExport,
  getAdminOrders,
  getAdminProducts,
  getAdminSummary,
  getAdminVisitAnalytics,
  importAdminCatalog,
  updateAdminProduct,
} from "@/lib/api/admin";
import { storefrontCategories } from "@/lib/constants/categories";
import { formatPrice } from "@/lib/utils/format-price";
import type { AdminAnalyticsReport, AdminOrder } from "@/types/admin";
import type { Product } from "@/types/product";

const MIN_VISIBLE_PRODUCT_PRICE = 0;
const confirmedOrderStatuses = new Set(["confirmed", "processing", "shipped", "delivered"]);

type AdminProductFormState = {
  sku: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  imageUrl: string;
  gallery: string;
  videoUrl: string;
  description: string;
  shortDescription: string;
  category: string;
  rawCategory: string;
  subCategory: string;
  ageGroup: Product["ageGroup"];
  moq: number;
  stockCount: number;
  limitedStock: boolean;
  badge: string;
  featured: boolean;
  features: string;
  rating: number;
  reviewCount: number;
  tags: string;
  isActive: boolean;
};

const emptyProduct: AdminProductFormState = {
  sku: "",
  name: "",
  slug: "",
  price: MIN_VISIBLE_PRODUCT_PRICE,
  originalPrice: MIN_VISIBLE_PRODUCT_PRICE,
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

const analyticsInitialState: AdminAnalyticsReport = {
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

const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

const downloadBlobFile = ({ blob, filename }: { blob: Blob; filename: string }) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

const toProductPayload = (form: AdminProductFormState) => ({
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
});

const validateProductForm = (form: AdminProductFormState) => {
  if (!String(form.sku || "").trim()) return "SKU is required.";
  if (!String(form.name || "").trim()) return "Product name is required.";
  if (!String(form.imageUrl || "").trim()) return "Image URL is required.";
  if (MIN_VISIBLE_PRODUCT_PRICE > 0 && Number(form.price) < MIN_VISIBLE_PRODUCT_PRICE) {
    return `Products below ${formatPrice(MIN_VISIBLE_PRODUCT_PRICE)} are not allowed in the live catalog.`;
  }
  return "";
};

function SectionCard({
  title,
  eyebrow,
  subtitle,
  actions,
  children,
}: {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[30px] border border-white/80 bg-white/95 p-5 shadow-[0_24px_60px_rgba(153,132,196,0.14)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          {eyebrow ? (
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#9a89b6]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-2xl font-black tracking-tight text-[#40346f]">{title}</h2>
          {subtitle ? <p className="mt-2 text-sm leading-6 text-[#756a94]">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-[#efe5fb] bg-[#fcf9ff] p-4 shadow-[0_14px_32px_rgba(162,137,200,0.08)]">
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9a89b6]">{label}</span>
      <strong className="mt-2 block text-2xl font-black text-[#3d3068]">{value}</strong>
    </div>
  );
}

function SimpleTable({
  columns,
  rows,
  emptyText,
  renderRow,
}: {
  columns: string[];
  rows: Array<Record<string, unknown>>;
  emptyText: string;
  renderRow: (row: Record<string, unknown>) => React.ReactNode;
}) {
  if (!rows.length) {
    return <p className="rounded-[18px] bg-[#faf6ff] px-4 py-3 text-sm text-[#7a6d98]">{emptyText}</p>;
  }

  return (
    <div className="overflow-hidden rounded-[22px] border border-[#efe5fb]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-3 bg-[#faf7ff] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8f81b1]">
        {columns.map((column) => (
          <span key={column}>{column}</span>
        ))}
      </div>
      <div className="divide-y divide-[#f1e9fb] bg-white">
        {rows.map((row, index) => (
          <div
            key={String(row.id || row.sourceLabel || row.productName || row.categoryLabel || row.campaignLabel || index)}
            className="grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-3 px-4 py-3 text-sm text-[#514472]"
          >
            {renderRow(row)}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [summary, setSummary] = useState<{ productCount: number; orderCount: number; pendingOrders: number; capturedRevenue: number } | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalyticsReport>(analyticsInitialState);
  const [analyticsRange, setAnalyticsRange] = useState("7d");
  const [customRange, setCustomRange] = useState({ startDate: "", endDate: "" });
  const [form, setForm] = useState<AdminProductFormState>(emptyProduct);
  const [editingId, setEditingId] = useState("");
  const [notice, setNotice] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [importSummary, setImportSummary] = useState<{
    filename: string;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
    totalRows: number;
    errors?: Array<{ row: number; message: string }>;
  } | null>(null);
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

  const redirectToLogin = useCallback(() => {
    window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    router.replace("/admin");
  }, [router]);

  const refreshAdminBasics = async (activeToken: string) => {
    const [summaryData, ordersData, productsData] = await Promise.all([
      getAdminSummary(activeToken),
      getAdminOrders(activeToken),
      getAdminProducts(activeToken),
    ]);

    setSummary(summaryData.metrics);
    setOrders(ordersData.orders.filter((order) => confirmedOrderStatuses.has(order.orderStatus)));
    setProducts(productsData.products);
  };

  useEffect(() => {
    const storedToken = window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    if (!storedToken) {
      router.replace("/admin");
      return;
    }
    setToken(storedToken);
  }, [router]);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        setDashboardLoading(true);
        await refreshAdminBasics(token);
      } catch (error) {
        if (isApiError(error) && error.status === 401) {
          redirectToLogin();
          return;
        }
        setNotice(error instanceof Error ? error.message : "Unable to load admin data.");
      } finally {
        setDashboardLoading(false);
      }
    };

    void load();
  }, [redirectToLogin, token]);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        setAnalyticsLoading(true);
        setAnalyticsError("");
        const analyticsData = await getAdminVisitAnalytics(token, analyticsParams);
        setAnalytics(analyticsData);
      } catch (error) {
        if (isApiError(error) && error.status === 401) {
          redirectToLogin();
          return;
        }
        setAnalyticsError(error instanceof Error ? error.message : "Unable to load analytics right now.");
      } finally {
        setAnalyticsLoading(false);
      }
    };

    void load();
  }, [analyticsParams, redirectToLogin, token]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;
    const checked = "checked" in event.target ? event.target.checked : false;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  const handleEdit = (product: Product) => {
    setEditingId(product._id);
    setForm({
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice,
      discountPercent: product.discountPercent,
      imageUrl: product.imageUrl,
      gallery: (product.gallery || []).join(", "),
      videoUrl: product.videoUrl || "",
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      category: product.category,
      rawCategory: product.rawCategory || "",
      subCategory: product.subCategory || "",
      ageGroup: product.ageGroup,
      moq: product.moq,
      stockCount: product.stockCount,
      limitedStock: Boolean(product.limitedStock),
      badge: product.badge || "",
      featured: Boolean(product.featured),
      features: (product.features || []).join(", "),
      rating: product.rating || 4.5,
      reviewCount: product.reviewCount || 0,
      tags: (product.tags || []).join(", "),
      isActive: product.isActive !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationMessage = validateProductForm(form);
    if (validationMessage) {
      setNotice(validationMessage);
      return;
    }

    try {
      if (editingId) {
        await updateAdminProduct(token, editingId, toProductPayload(form));
        setNotice("Product updated successfully.");
      } else {
        await createAdminProduct(token, toProductPayload(form));
        setNotice("Product created successfully.");
      }

      setForm(emptyProduct);
      setEditingId("");
      await refreshAdminBasics(token);
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        redirectToLogin();
        return;
      }
      setNotice(error instanceof Error ? error.message : "Unable to save product.");
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
      setImportSummary({
        ...response.summary,
        errors: response.errors || [],
      });
      setNotice(
        `Catalog imported: ${response.summary.created} created, ${response.summary.updated} updated, ${response.summary.skipped} skipped.`
      );
      setUploadFile(null);
      await refreshAdminBasics(token);
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        redirectToLogin();
        return;
      }
      setNotice(error instanceof Error ? error.message : "Unable to import catalog.");
    } finally {
      setImportingCatalog(false);
    }
  };

  const handleExportOrders = async (format: "csv" | "xlsx") => {
    try {
      setExportingFormat(format);
      const file = await downloadAdminOrdersExport(token, format);
      downloadBlobFile(file);
      setNotice(`${format.toUpperCase()} export downloaded.`);
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        redirectToLogin();
        return;
      }
      setNotice(error instanceof Error ? error.message : "Unable to export orders.");
    } finally {
      setExportingFormat("");
    }
  };

  const handleLogout = () => {
    redirectToLogin();
  };

  if (!token) {
    return null;
  }

  return (
    <main className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 px-4 py-6 pb-10 sm:px-6">
      <SectionCard
        title="Decision Dashboard"
        eyebrow="Admin"
        subtitle="Understand traffic quality, product intent, campaign performance, and where shoppers drop before they buy."
        actions={
          <button
            className="rounded-full border border-[#eadcf4] bg-white/95 px-4 py-2 text-sm font-semibold text-[#4a3f75] shadow-[0_12px_24px_rgba(139,116,180,0.12)]"
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total products" value={summary?.productCount || 0} />
          <MetricCard label="Total orders" value={summary?.orderCount || 0} />
          <MetricCard label="Pending orders" value={summary?.pendingOrders || 0} />
          <MetricCard label="Captured revenue" value={formatPrice(summary?.capturedRevenue || 0)} />
        </div>
      </SectionCard>

      <SectionCard title={analytics.filters?.label || "Last 7 Days"} eyebrow="Analytics window">
        <div className="flex flex-wrap gap-2">
          {dateFilterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                analyticsRange === option.value
                  ? "bg-gradient-to-r from-[#ff8a63] via-[#ff6f96] to-[#8f6dff] text-white shadow-[0_12px_26px_rgba(143,109,255,0.28)]"
                  : "bg-[#f6f1ff] text-[#6e6296]"
              }`}
              onClick={() => setAnalyticsRange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        {analyticsRange === "custom" ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              className="min-h-12 rounded-[18px] border border-[#eadff6] bg-[#fcf9ff] px-4 text-sm"
              type="date"
              value={customRange.startDate}
              onChange={(event) =>
                setCustomRange((current) => ({ ...current, startDate: event.target.value }))
              }
            />
            <input
              className="min-h-12 rounded-[18px] border border-[#eadff6] bg-[#fcf9ff] px-4 text-sm"
              type="date"
              value={customRange.endDate}
              onChange={(event) =>
                setCustomRange((current) => ({ ...current, endDate: event.target.value }))
              }
            />
          </div>
        ) : null}
      </SectionCard>

      {analyticsError ? (
        <SectionCard title="Analytics status" eyebrow="Retry">
          <div className="rounded-[20px] bg-[#fff1f4] px-4 py-4 text-sm text-[#bf4e76]">
            {analyticsError}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title="What traffic came and what converted" eyebrow="Traffic Overview">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Visitors" value={analytics.overview?.visitors || 0} />
          <MetricCard label="Sessions" value={analytics.overview?.sessions || 0} />
          <MetricCard label="Page Views" value={analytics.overview?.pageViews || 0} />
          <MetricCard label="Orders" value={analytics.overview?.orders || 0} />
          <MetricCard label="Conversion Rate" value={`${analytics.overview?.conversionRate || 0}%`} />
          <MetricCard label="Revenue" value={formatPrice(analytics.overview?.revenue || 0)} />
          <MetricCard label="Hero Clicks" value={analytics.overview?.heroClicks || 0} />
          <MetricCard label="Search Usage" value={analytics.overview?.searchUsage || 0} />
        </div>
        {analyticsLoading ? <p className="mt-4 text-sm text-[#8f81b1]">Refreshing analytics...</p> : null}
      </SectionCard>

      <SectionCard
        title="Traffic Sources"
        subtitle="See which channels bring visits, checkout starts, orders, and revenue."
      >
        <SimpleTable
          columns={["Source", "Visits", "Page Views", "Checkout", "Orders", "Conv.", "Revenue"]}
          rows={analytics.trafficSources as Array<Record<string, unknown>>}
          emptyText="No traffic sources recorded yet."
          renderRow={(row) => (
            <>
              <span>{String(row.sourceLabel || "")}</span>
              <span>{String(row.visits || 0)}</span>
              <span>{String(row.pageViews || 0)}</span>
              <span>{String(row.checkoutStarted || 0)}</span>
              <span>{String(row.orders || 0)}</span>
              <span>{String(row.conversionRate || 0)}%</span>
              <span>{formatPrice(Number(row.revenue || 0))}</span>
            </>
          )}
        />
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard title="Conversion Funnel" subtitle="See where shoppers move forward and where they drop.">
          <SimpleTable
            columns={["Stage", "Count", "Drop-off"]}
            rows={analytics.conversionFunnel as Array<Record<string, unknown>>}
            emptyText="Funnel data will appear after traffic and checkout activity."
            renderRow={(row) => (
              <>
                <span>{String(row.label || "")}</span>
                <span>{String(row.count || 0)}</span>
                <span>{String(row.dropOffRate || 0)}%</span>
              </>
            )}
          />
        </SectionCard>

        <SectionCard title="Top Landing Pages" subtitle="Understand which first-touch pages bring sessions in.">
          <SimpleTable
            columns={["Landing Label", "Visits"]}
            rows={analytics.topLandingPages as Array<Record<string, unknown>>}
            emptyText="Landing page data will appear once visitors enter the storefront."
            renderRow={(row) => (
              <>
                <span>{String(row.label || "")}</span>
                <span>{String(row.visits || 0)}</span>
              </>
            )}
          />
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard title="Product Performance" subtitle="Find which products draw attention and convert.">
          <div className="space-y-5">
            <div>
              <h3 className="mb-3 text-lg font-black text-[#41356e]">Most Viewed</h3>
              <SimpleTable
                columns={["Product", "Views", "Conv."]}
                rows={analytics.productPerformance.mostViewed as Array<Record<string, unknown>>}
                emptyText="No product view data yet."
                renderRow={(row) => (
                  <>
                    <span>{String(row.productName || "")}</span>
                    <span>{String(row.views || 0)}</span>
                    <span>{String(row.conversionRate || 0)}%</span>
                  </>
                )}
              />
            </div>
            <div>
              <h3 className="mb-3 text-lg font-black text-[#41356e]">Most Clicked</h3>
              <SimpleTable
                columns={["Product", "Clicks"]}
                rows={analytics.productPerformance.mostClicked as Array<Record<string, unknown>>}
                emptyText="No product click data yet."
                renderRow={(row) => (
                  <>
                    <span>{String(row.productName || "")}</span>
                    <span>{String(row.clicks || 0)}</span>
                  </>
                )}
              />
            </div>
            <div>
              <h3 className="mb-3 text-lg font-black text-[#41356e]">Most Added to Cart</h3>
              <SimpleTable
                columns={["Product", "Add to Cart", "Conv."]}
                rows={analytics.productPerformance.mostAddedToCart as Array<Record<string, unknown>>}
                emptyText="No add-to-cart data yet."
                renderRow={(row) => (
                  <>
                    <span>{String(row.productName || "")}</span>
                    <span>{String(row.addToCart || 0)}</span>
                    <span>{String(row.conversionRate || 0)}%</span>
                  </>
                )}
              />
            </div>
            <div>
              <h3 className="mb-3 text-lg font-black text-[#41356e]">Highest Converting</h3>
              <SimpleTable
                columns={["Product", "Orders", "Conv."]}
                rows={analytics.productPerformance.highestConverting as Array<Record<string, unknown>>}
                emptyText="No conversion data yet."
                renderRow={(row) => (
                  <>
                    <span>{String(row.productName || "")}</span>
                    <span>{String(row.orders || 0)}</span>
                    <span>{String(row.conversionRate || 0)}%</span>
                  </>
                )}
              />
            </div>
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Category Performance" subtitle="See which categories attract clicks and convert into orders.">
            <SimpleTable
              columns={["Category", "Clicks", "Orders", "Conv."]}
              rows={analytics.categoryPerformance as Array<Record<string, unknown>>}
              emptyText="No category click data yet."
              renderRow={(row) => (
                <>
                  <span>{String(row.categoryLabel || "")}</span>
                  <span>{String(row.clicks || 0)}</span>
                  <span>{String(row.orders || 0)}</span>
                  <span>{String(row.conversionRate || 0)}%</span>
                </>
              )}
            />
          </SectionCard>
          <SectionCard title="Campaign Performance" subtitle="Identify which campaigns create sessions, orders, and revenue.">
            <SimpleTable
              columns={["Campaign", "Source", "Sessions", "Orders", "Conv.", "Revenue"]}
              rows={analytics.campaignPerformance as Array<Record<string, unknown>>}
              emptyText="No campaign-tagged traffic yet."
              renderRow={(row) => (
                <>
                  <span>{String(row.campaignLabel || "")}</span>
                  <span>{String(row.sourceLabel || "")}</span>
                  <span>{String(row.sessions || 0)}</span>
                  <span>{String(row.orders || 0)}</span>
                  <span>{String(row.conversionRate || 0)}%</span>
                  <span>{formatPrice(Number(row.revenue || 0))}</span>
                </>
              )}
            />
          </SectionCard>
          <SectionCard title="Geo Insight" subtitle="Know where interested visitors are browsing from.">
            {analytics.geoInsight?.note ? (
              <p className="mb-4 rounded-[16px] bg-[#f7f0ff] px-4 py-3 text-sm text-[#6b5e94]">
                {analytics.geoInsight.note}
              </p>
            ) : null}
            <SimpleTable
              columns={["Location", "Sessions"]}
              rows={analytics.geoInsight.rows as Array<Record<string, unknown>>}
              emptyText="No geo data captured yet."
              renderRow={(row) => (
                <>
                  <span>{String(row.label || "")}</span>
                  <span>{String(row.sessions || 0)}</span>
                </>
              )}
            />
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title="Recent Visitor Journeys"
        subtitle="Review real session paths to understand interest and drop-off behavior."
      >
        <div className="space-y-3">
          {analytics.recentVisitorJourneys.length ? (
            analytics.recentVisitorJourneys.map((journey) => (
              <details
                key={journey.sessionId}
                className="rounded-[22px] border border-[#ece3f7] bg-[#fcf9ff] px-4 py-3"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                  <div>
                    <strong className="text-[#43376e]">{journey.sourceLabel}</strong>
                    <p className="text-sm text-[#776c96]">{journey.location}</p>
                  </div>
                  <span className="text-xs font-medium text-[#978ab6]">
                    {new Date(journey.endedAt).toLocaleString("en-IN")}
                  </span>
                </summary>
                <p className="mt-3 text-sm font-semibold text-[#534776]">
                  {journey.steps.join(" -> ") || "No journey steps recorded yet."}
                </p>
                <p className="mt-2 text-sm text-[#776c96]">
                  Landing: {journey.landingLabel} | Page views: {journey.pageViews}
                </p>
              </details>
            ))
          ) : (
            <p className="rounded-[18px] bg-[#faf6ff] px-4 py-3 text-sm text-[#7a6d98]">
              No recent visitor journeys captured yet.
            </p>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Technical Debug"
        subtitle="Raw attribution details for troubleshooting campaigns and links."
      >
        <div className="space-y-3">
          {analytics.technicalDebug.length ? (
            analytics.technicalDebug.map((item) => (
              <details
                key={`${item.sessionId}-debug`}
                className="rounded-[22px] border border-[#ece3f7] bg-[#fcf9ff] px-4 py-3"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                  <div>
                    <strong className="text-[#43376e]">{item.sourceLabel}</strong>
                    <p className="text-sm text-[#776c96]">{item.landingLabel}</p>
                  </div>
                  <span className="text-xs font-medium break-all text-[#978ab6]">{item.sessionId}</span>
                </summary>
                <div className="mt-3 grid gap-2 text-sm text-[#5a4f81] md:grid-cols-2">
                  <p><strong>Landing path:</strong> {item.landingPath || "N/A"}</p>
                  <p><strong>Raw referrer:</strong> {item.rawReferrer || "Direct"}</p>
                  <p><strong>UTM source:</strong> {item.rawUTM?.source || "N/A"}</p>
                  <p><strong>UTM medium:</strong> {item.rawUTM?.medium || "N/A"}</p>
                  <p><strong>UTM campaign:</strong> {item.rawUTM?.campaign || "N/A"}</p>
                </div>
              </details>
            ))
          ) : (
            <p className="rounded-[18px] bg-[#faf6ff] px-4 py-3 text-sm text-[#7a6d98]">
              Debug attribution details will appear after tracked sessions begin.
            </p>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Import products by SKU"
        eyebrow="Catalog upload"
        subtitle={`Upload a CSV or Excel catalog to create new SKUs and update existing ones. Products below ${formatPrice(MIN_VISIBLE_PRODUCT_PRICE)} are skipped automatically.`}
      >
        <div className="space-y-4">
          <input
            className="block min-h-12 w-full rounded-[18px] border border-[#eadff6] bg-[#fcf9ff] px-4 py-3 text-sm text-[#40346f]"
            type="file"
            accept=".xlsx,.csv"
            onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#ff8a63] via-[#ff6f96] to-[#8f6dff] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,111,149,0.25)]"
              type="button"
              onClick={handleCatalogImport}
              disabled={importingCatalog}
            >
              {importingCatalog ? "Importing catalog..." : "Upload Catalog"}
            </button>
            {uploadFile ? <span className="text-sm text-[#776c96]">{uploadFile.name}</span> : null}
          </div>

          {importSummary ? (
            <div className="rounded-[24px] border border-[#efe5fb] bg-[#fcf9ff] p-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Created" value={importSummary.created} />
                <MetricCard label="Updated" value={importSummary.updated} />
                <MetricCard label="Skipped" value={importSummary.skipped} />
                <MetricCard label="Failed" value={importSummary.failed} />
              </div>
              <p className="mt-4 text-sm text-[#776c96]">
                Source: {importSummary.filename} | Rows processed: {importSummary.totalRows}
              </p>
              {importSummary.errors?.length ? (
                <div className="mt-4 rounded-[18px] bg-white px-4 py-3 text-sm text-[#62547f]">
                  <strong className="block text-[#43376e]">Import notes</strong>
                  {importSummary.errors.slice(0, 5).map((error) => (
                    <p key={`${error.row}-${error.message}`} className="mt-1">
                      Row {error.row}: {error.message}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title={editingId ? "Edit product" : "Add product"} eyebrow="Product editor">
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" onSubmit={handleSubmit}>
          {[
            { name: "sku", placeholder: "SKU", type: "text" },
            { name: "name", placeholder: "Name", type: "text" },
            { name: "slug", placeholder: "Slug", type: "text" },
            { name: "imageUrl", placeholder: "Image URL", type: "text" },
            { name: "gallery", placeholder: "Gallery URLs, comma separated", type: "text" },
            { name: "videoUrl", placeholder: "Video URL", type: "text" },
            { name: "price", placeholder: "Price", type: "number" },
            { name: "originalPrice", placeholder: "Original price", type: "number" },
            { name: "discountPercent", placeholder: "Discount %", type: "number" },
            { name: "rawCategory", placeholder: "Raw category", type: "text" },
            { name: "subCategory", placeholder: "Sub-category", type: "text" },
            { name: "moq", placeholder: "MOQ", type: "number" },
            { name: "stockCount", placeholder: "Stock", type: "number" },
            { name: "rating", placeholder: "Rating", type: "number" },
            { name: "reviewCount", placeholder: "Review count", type: "number" },
            { name: "badge", placeholder: "Badge", type: "text" },
            { name: "shortDescription", placeholder: "Short description", type: "text" },
          ].map((field) => (
            <input
              key={field.name}
              className="min-h-12 rounded-[18px] border border-[#eadff6] bg-[#fcf9ff] px-4 text-sm text-[#40346f] outline-none placeholder:text-[#a194bf]"
              name={field.name}
              placeholder={field.placeholder}
              type={field.type}
              step={field.name === "rating" ? "0.1" : undefined}
              value={String(form[field.name as keyof AdminProductFormState] ?? "")}
              onChange={handleChange}
            />
          ))}
          <select
            className="min-h-12 rounded-[18px] border border-[#eadff6] bg-[#fcf9ff] px-4 text-sm text-[#40346f] outline-none"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            {storefrontCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            className="min-h-12 rounded-[18px] border border-[#eadff6] bg-[#fcf9ff] px-4 text-sm text-[#40346f] outline-none"
            name="ageGroup"
            value={form.ageGroup}
            onChange={handleChange}
          >
            <option value="0-2">0-2</option>
            <option value="3-5">3-5</option>
            <option value="6-8">6-8</option>
            <option value="9+">9+</option>
          </select>
          <textarea
            className="min-h-[128px] rounded-[18px] border border-[#eadff6] bg-[#fcf9ff] px-4 py-3 text-sm text-[#40346f] outline-none placeholder:text-[#a194bf] md:col-span-2 xl:col-span-3"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />
          <input
            className="min-h-12 rounded-[18px] border border-[#eadff6] bg-[#fcf9ff] px-4 text-sm text-[#40346f] outline-none placeholder:text-[#a194bf] md:col-span-2 xl:col-span-3"
            name="features"
            placeholder="Features, comma separated"
            value={form.features}
            onChange={handleChange}
          />
          <input
            className="min-h-12 rounded-[18px] border border-[#eadff6] bg-[#fcf9ff] px-4 text-sm text-[#40346f] outline-none placeholder:text-[#a194bf] md:col-span-2 xl:col-span-3"
            name="tags"
            placeholder="Tags, comma separated"
            value={form.tags}
            onChange={handleChange}
          />
          <label className="flex items-center gap-2 rounded-[18px] bg-[#faf6ff] px-4 py-3 text-sm font-semibold text-[#5e5288]">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
            Featured
          </label>
          <label className="flex items-center gap-2 rounded-[18px] bg-[#faf6ff] px-4 py-3 text-sm font-semibold text-[#5e5288]">
            <input type="checkbox" name="limitedStock" checked={form.limitedStock} onChange={handleChange} />
            Limited stock
          </label>
          <label className="flex items-center gap-2 rounded-[18px] bg-[#faf6ff] px-4 py-3 text-sm font-semibold text-[#5e5288]">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
            Active
          </label>
          {notice ? (
            <p className="rounded-[18px] bg-[#f7f0ff] px-4 py-3 text-sm text-[#6d5d9a] md:col-span-2 xl:col-span-3">
              {notice}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3 md:col-span-2 xl:col-span-3">
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#ff8a63] via-[#ff6f96] to-[#8f6dff] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,111,149,0.25)]"
              type="submit"
            >
              {editingId ? "Update Product" : "Create Product"}
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#eadcf4] bg-white/95 px-5 py-3 text-sm font-semibold text-[#4a3f75] shadow-[0_12px_24px_rgba(139,116,180,0.12)]"
              type="button"
              onClick={() => {
                setForm(emptyProduct);
                setEditingId("");
                setNotice("");
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Catalog view"
        eyebrow="Products"
        subtitle={`Live catalog products at or above ${formatPrice(MIN_VISIBLE_PRODUCT_PRICE)}.`}
      >
        {dashboardLoading ? (
          <p className="text-sm text-[#8f81b1]">Refreshing catalog...</p>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product._id || product.slug}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[#efe5fb] bg-[#fcf9ff] px-4 py-3"
              >
                <div>
                  <strong className="text-[#43376e]">{product.name}</strong>
                  <p className="text-sm text-[#776c96]">
                    {product.category} | {product.ageGroup}
                  </p>
                </div>
                <div className="text-sm font-semibold text-[#5b4f84]">{formatPrice(product.price)}</div>
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#eadcf4] bg-white/95 px-4 py-2 text-sm font-semibold text-[#4a3f75] shadow-[0_12px_24px_rgba(139,116,180,0.12)]"
                  onClick={() => handleEdit(product)}
                  type="button"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Confirmed customer orders"
        eyebrow="Orders"
        subtitle="Download confirmed-flow orders with order IDs, customer details, totals, and item lines."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#eadcf4] bg-white/95 px-4 py-2 text-sm font-semibold text-[#4a3f75] shadow-[0_12px_24px_rgba(139,116,180,0.12)]"
              type="button"
              onClick={() => handleExportOrders("csv")}
              disabled={exportingFormat === "csv"}
            >
              {exportingFormat === "csv" ? "Downloading CSV..." : "Download CSV"}
            </button>
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#eadcf4] bg-white/95 px-4 py-2 text-sm font-semibold text-[#4a3f75] shadow-[0_12px_24px_rgba(139,116,180,0.12)]"
              type="button"
              onClick={() => handleExportOrders("xlsx")}
              disabled={exportingFormat === "xlsx"}
            >
              {exportingFormat === "xlsx" ? "Downloading Excel..." : "Download Excel"}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className="grid gap-3 rounded-[22px] border border-[#efe5fb] bg-[#fcf9ff] px-4 py-4 md:grid-cols-[1.4fr_0.8fr_0.7fr]"
            >
              <div className="text-sm text-[#5d507f]">
                <strong className="block text-base text-[#43376e]">{order.orderNumber}</strong>
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
              <div className="text-sm text-[#5d507f]">
                <span className="block text-base font-bold text-[#43376e]">{formatPrice(order.totalAmount)}</span>
                <p>{order.paymentStatus} | {order.orderStatus}</p>
                {order.paymentMode === "cod_deposit" ? (
                  <p>
                    COD Fee {formatPrice(order.codConfirmationFee || order.paymentAmount)} | Paid now{" "}
                    {formatPrice(order.paymentAmount)}
                  </p>
                ) : null}
              </div>
              <div className="text-sm text-[#5d507f]">
                <span>{order.paymentMode}</span>
                <p>{new Date(order.createdAt).toLocaleString("en-IN")}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </main>
  );
}
