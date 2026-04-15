import type {
  AdminAnalyticsReport,
  AdminImportResponse,
  AdminOrdersResponse,
  AdminProductsResponse,
  AdminSummaryResponse,
} from "@/types/admin";
import type { Product } from "@/types/product";

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ai4kids-api.onrender.com/api";

export const ADMIN_TOKEN_STORAGE_KEY = "ai4kids-admin-token";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const buildUrl = (path: string, params?: Record<string, string | number | boolean | undefined>) => {
  const url = new URL(`${DEFAULT_API_URL}${path}`);

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });

  return url.toString();
};

const parseError = async (response: Response) => {
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  return new ApiError(payload?.message || "Request failed.", response.status);
};

const authHeaders = (token: string, extraHeaders: HeadersInit = {}) => ({
  Authorization: `Bearer ${token}`,
  ...extraHeaders,
});

async function adminJsonFetch<T>(
  path: string,
  token: string,
  options: RequestInit & {
    params?: Record<string, string | number | boolean | undefined>;
  } = {}
): Promise<T> {
  const response = await fetch(buildUrl(path, options.params), {
    ...options,
    cache: "no-store",
    headers: authHeaders(token, options.headers || {}),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return response.json() as Promise<T>;
}

export const adminLogin = async (payload: { email: string; password: string }) => {
  const response = await fetch(buildUrl("/admin/login"), {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return response.json() as Promise<{
    token: string;
    admin: { id: string; name: string; email: string; role: string };
  }>;
};

export const getAdminSummary = (token: string) =>
  adminJsonFetch<AdminSummaryResponse>("/admin/summary", token);

export const getAdminOrders = (token: string) =>
  adminJsonFetch<AdminOrdersResponse>("/admin/orders", token);

export const getAdminProducts = (token: string) =>
  adminJsonFetch<AdminProductsResponse>("/admin/products", token);

export const createAdminProduct = (token: string, payload: Partial<Product>) =>
  adminJsonFetch<{ product: Product }>("/admin/products", token, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const updateAdminProduct = (token: string, productId: string, payload: Partial<Product>) =>
  adminJsonFetch<{ product: Product }>(`/admin/products/${productId}`, token, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const importAdminCatalog = async (token: string, file: File) => {
  const arrayBuffer = await file.arrayBuffer();

  return adminJsonFetch<AdminImportResponse>("/admin/products/import", token, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "X-Upload-Filename": file.name,
    },
    body: arrayBuffer,
  });
};

export const downloadAdminOrdersExport = async (token: string, format: "csv" | "xlsx") => {
  const response = await fetch(buildUrl(`/admin/orders/export.${format}`), {
    cache: "no-store",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  const disposition = response.headers.get("content-disposition") || "";
  const filenameMatch = disposition.match(/filename=\"?([^\"]+)\"?/i);

  return {
    blob: await response.blob(),
    filename: filenameMatch?.[1] || `ai4kids-confirmed-orders.${format === "csv" ? "csv" : "xls"}`,
  };
};

export const getAdminVisitAnalytics = (
  token: string,
  params: { range: string; startDate?: string; endDate?: string }
) =>
  adminJsonFetch<AdminAnalyticsReport>("/admin/analytics/visits", token, {
    params,
  });
