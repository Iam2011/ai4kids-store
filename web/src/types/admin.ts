import type { Product } from "@/types/product";

export type AdminSummaryResponse = {
  metrics: {
    productCount: number;
    orderCount: number;
    pendingOrders: number;
    capturedRevenue: number;
  };
};

export type AdminOrder = {
  _id: string;
  orderNumber: string;
  createdAt: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMode: string;
  paymentAmount: number;
  totalAmount: number;
  codConfirmationFee?: number;
  customer: {
    name: string;
    mobile: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  items: Array<{
    itemType: string;
    name: string;
    quantity: number;
    bundleItems?: Array<{ name: string }>;
  }>;
};

export type AdminOrdersResponse = {
  orders: AdminOrder[];
};

export type AdminProductsResponse = {
  products: Product[];
};

export type AdminImportError = {
  row: number;
  message: string;
};

export type AdminImportResponse = {
  summary: {
    filename: string;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
    totalRows: number;
  };
  errors: AdminImportError[];
};

export type AdminAnalyticsReport = {
  filters: {
    range: string;
    startDate: string;
    endDate: string;
    label: string;
  };
  overview: {
    visitors: number;
    sessions: number;
    pageViews: number;
    orders: number;
    conversionRate: number;
    revenue: number;
    heroClicks: number;
    searchUsage: number;
  } | null;
  trafficSources: Array<{
    sourceLabel: string;
    visits: number;
    pageViews: number;
    checkoutStarted: number;
    orders: number;
    conversionRate: number;
    revenue: number;
  }>;
  conversionFunnel: Array<{
    label: string;
    count: number;
    dropOffRate: number;
  }>;
  productPerformance: {
    mostViewed: Array<{ productName: string; views?: number; conversionRate: number }>;
    mostClicked: Array<{ productName: string; clicks?: number; conversionRate?: number }>;
    mostAddedToCart: Array<{ productName: string; addToCart?: number; conversionRate: number }>;
    highestConverting: Array<{ productName: string; orders?: number; conversionRate: number }>;
  };
  categoryPerformance: Array<{
    categoryLabel: string;
    clicks: number;
    orders: number;
    conversionRate: number;
  }>;
  campaignPerformance: Array<{
    campaignLabel: string;
    sourceLabel: string;
    sessions: number;
    orders: number;
    conversionRate: number;
    revenue: number;
  }>;
  geoInsight: {
    rows: Array<{ label: string; sessions: number }>;
    note: string;
  };
  topLandingPages: Array<{ label: string; visits: number }>;
  recentVisitorJourneys: Array<{
    sessionId: string;
    sourceLabel: string;
    location: string;
    endedAt: string;
    steps: string[];
    landingLabel: string;
    pageViews: number;
  }>;
  technicalDebug: Array<{
    sessionId: string;
    sourceLabel: string;
    landingLabel: string;
    landingPath?: string;
    rawReferrer?: string;
    rawUTM?: {
      source?: string;
      medium?: string;
      campaign?: string;
    };
  }>;
};
