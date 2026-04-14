import { Order } from "../models/Order.js";
import { VisitEvent } from "../models/VisitEvent.js";
import { buildLandingLabel } from "../utils/analyticsAttribution.js";

const confirmedOrderStatuses = ["confirmed", "processing", "shipped", "delivered"];

const roundMetric = (value) => Math.round(Number(value || 0) * 10) / 10;

const buildRate = (numerator, denominator) =>
  denominator > 0 ? roundMetric((numerator / denominator) * 100) : 0;

const normalizeLegacyOrderSource = (source = "") => {
  const normalized = String(source || "").toLowerCase().trim();

  if (normalized.includes("instagram") && normalized.includes("ad")) {
    return { sourceLabel: "Instagram Paid", sourceType: "Paid", campaignLabel: "Instagram Paid" };
  }

  if (normalized.includes("instagram")) {
    return {
      sourceLabel: "Instagram Organic",
      sourceType: "Organic",
      campaignLabel: "Instagram Organic",
    };
  }

  if (normalized.includes("whatsapp")) {
    return { sourceLabel: "WhatsApp", sourceType: "Social", campaignLabel: "WhatsApp" };
  }

  if (normalized.includes("google")) {
    return { sourceLabel: "Google", sourceType: "Organic", campaignLabel: "Google" };
  }

  if (normalized.includes("facebook")) {
    return { sourceLabel: "Facebook", sourceType: "Social", campaignLabel: "Facebook" };
  }

  return { sourceLabel: "Direct", sourceType: "Direct", campaignLabel: "Direct" };
};

const parseRange = ({ range = "7d", startDate = "", endDate = "" } = {}) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (range === "today") {
    return {
      since: startOfToday,
      until: now,
      label: "Today",
      rangeKey: "today",
    };
  }

  if (range === "30d") {
    return {
      since: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      until: now,
      label: "Last 30 Days",
      rangeKey: "30d",
    };
  }

  if (range === "custom") {
    const since = startDate ? new Date(`${startDate}T00:00:00`) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const until = endDate ? new Date(`${endDate}T23:59:59.999`) : now;

    return {
      since,
      until,
      label: "Custom Range",
      rangeKey: "custom",
    };
  }

  return {
    since: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    until: now,
    label: "Last 7 Days",
    rangeKey: "7d",
  };
};

const getOrderAttribution = (order) => {
  if (order.analyticsSnapshot?.sourceLabel) {
    return {
      sourceLabel: order.analyticsSnapshot.sourceLabel,
      sourceType: order.analyticsSnapshot.sourceType || "Direct",
      campaignLabel: order.analyticsSnapshot.campaignLabel || order.analyticsSnapshot.sourceLabel,
      sessionId: order.analyticsSnapshot.sessionId || "",
      landingPageLabel: order.analyticsSnapshot.landingPageLabel || "",
    };
  }

  return normalizeLegacyOrderSource(order.source);
};

const pushUnique = (list, value) => {
  if (!value) return;
  if (!list.includes(value)) {
    list.push(value);
  }
};

const formatJourneyStep = (event) => {
  switch (event.eventType) {
    case "page_view":
      return event.pageLabel || "Page";
    case "hero_click":
      return "Hero Click";
    case "category_click":
      return `Category: ${event.categoryLabel || event.category || "Category"}`;
    case "product_view":
      return `Product View: ${event.productName || "Product"}`;
    case "product_click":
      return `Product Click: ${event.productName || "Product"}`;
    case "search_submit":
      return event.searchTerm ? `Search: ${event.searchTerm}` : "Search";
    case "add_to_cart":
      return `Add to Cart: ${event.productName || "Product"}`;
    case "buy_now_click":
      return `Buy Now: ${event.productName || "Product"}`;
    case "checkout_started":
      return "Checkout Started";
    case "payment_option_selected":
      return event.paymentOption ? `Payment: ${event.paymentOption}` : "Payment Selected";
    case "order_placed":
      return "Order Placed";
    default:
      return event.pageLabel || event.eventType;
  }
};

export const buildAnalyticsReport = async ({ range, startDate, endDate } = {}) => {
  const { since, until, label, rangeKey } = parseRange({ range, startDate, endDate });
  const [events, orders] = await Promise.all([
    VisitEvent.find({
      createdAt: { $gte: since, $lte: until },
    })
      .sort({ createdAt: 1 })
      .lean(),
    Order.find({
      createdAt: { $gte: since, $lte: until },
      orderStatus: { $in: confirmedOrderStatuses },
    }).lean(),
  ]);

  const sessionMap = new Map();
  const sourceMap = new Map();
  const landingMap = new Map();
  const campaignMap = new Map();
  const productViewMap = new Map();
  const productClickMap = new Map();
  const productAddMap = new Map();
  const categoryClickMap = new Map();
  const geoMap = new Map();
  const funnel = {
    homepage: new Set(),
    productView: new Set(),
    addToCart: new Set(),
    checkoutStarted: new Set(),
    paymentSelected: new Set(),
    orderPlaced: new Set(),
  };

  let pageViews = 0;
  let searchUsage = 0;
  let heroClicks = 0;

  for (const event of events) {
    const sessionId = event.sessionId || `unknown-${event._id}`;
    const session = sessionMap.get(sessionId) || {
      sessionId,
      sourceLabel: event.sourceLabel || "Direct",
      sourceType: event.sourceType || "Direct",
      campaignLabel: event.campaignLabel || "Direct",
      pageViews: 0,
      startedAt: event.createdAt,
      endedAt: event.createdAt,
      location: [event.city, event.state, event.country].filter(Boolean).join(", ") || "Location not available",
      city: event.city || "Unknown",
      state: event.state || "",
      country: event.country || "",
      landingPath: event.isLandingPage ? event.path : "",
      landingLabel: event.isLandingPage
        ? buildLandingLabel({ pageLabel: event.pageLabel, sourceLabel: event.sourceLabel })
        : "",
      rawReferrer: event.rawReferrer || event.referrer || "",
      rawUTM: event.rawUTM || {},
      steps: [],
    };

    session.endedAt = event.createdAt;
    session.pageViews += event.eventType === "page_view" ? 1 : 0;
    session.sourceLabel = session.sourceLabel || event.sourceLabel || "Direct";
    session.sourceType = session.sourceType || event.sourceType || "Direct";
    session.campaignLabel = session.campaignLabel || event.campaignLabel || "Direct";

    if (event.isLandingPage) {
      session.landingPath = event.path;
      session.landingLabel =
        buildLandingLabel({ pageLabel: event.pageLabel, sourceLabel: event.sourceLabel }) ||
        session.landingLabel;
      session.rawReferrer = event.rawReferrer || session.rawReferrer;
      session.rawUTM = event.rawUTM || session.rawUTM;
    }

    const stepLabel = formatJourneyStep(event);
    if (stepLabel && session.steps[session.steps.length - 1] !== stepLabel) {
      session.steps.push(stepLabel);
    }

    sessionMap.set(sessionId, session);

    const sourceKey = event.sourceLabel || "Direct";
    const sourceEntry = sourceMap.get(sourceKey) || {
      sourceLabel: sourceKey,
      sourceType: event.sourceType || "Direct",
      sessions: new Set(),
      pageViews: 0,
      checkoutStarted: new Set(),
      orders: 0,
      revenue: 0,
    };
    sourceEntry.sessions.add(sessionId);
    if (event.eventType === "page_view") {
      sourceEntry.pageViews += 1;
      pageViews += 1;
    }
    if (event.eventType === "checkout_started") {
      sourceEntry.checkoutStarted.add(sessionId);
    }
    sourceMap.set(sourceKey, sourceEntry);

    if (event.isLandingPage) {
      const landingKey =
        buildLandingLabel({ pageLabel: event.pageLabel, sourceLabel: event.sourceLabel }) ||
        "Landing";
      const landingEntry = landingMap.get(landingKey) || {
        label: landingKey,
        pageLabel: event.pageLabel || "Landing",
        sourceLabel: event.sourceLabel || "Direct",
        path: event.path || "",
        sessions: new Set(),
      };
      landingEntry.sessions.add(sessionId);
      landingMap.set(landingKey, landingEntry);
    }

    const campaignKey = event.campaignLabel || event.sourceLabel || "Direct";
    const campaignEntry = campaignMap.get(campaignKey) || {
      campaignLabel: campaignKey,
      sourceLabel: event.sourceLabel || "Direct",
      sessions: new Set(),
      orders: 0,
      revenue: 0,
    };
    campaignEntry.sessions.add(sessionId);
    campaignMap.set(campaignKey, campaignEntry);

    const geoKey = `${event.city || "Unknown"}|${event.state || ""}|${event.country || ""}`;
    const geoEntry = geoMap.get(geoKey) || {
      city: event.city || "Unknown",
      state: event.state || "",
      country: event.country || "",
      sessions: new Set(),
    };
    geoEntry.sessions.add(sessionId);
    geoMap.set(geoKey, geoEntry);

    if (event.pageLabel === "Homepage") funnel.homepage.add(sessionId);
    if (event.eventType === "product_view") funnel.productView.add(sessionId);
    if (event.eventType === "add_to_cart") funnel.addToCart.add(sessionId);
    if (event.eventType === "checkout_started") funnel.checkoutStarted.add(sessionId);
    if (event.eventType === "payment_option_selected") funnel.paymentSelected.add(sessionId);

    if (event.eventType === "search_submit") {
      searchUsage += 1;
    }

    if (event.eventType === "hero_click") {
      heroClicks += 1;
    }

    if (event.eventType === "product_view" && event.productName) {
      const key = event.productId || event.productName;
      const entry = productViewMap.get(key) || {
        productId: event.productId || "",
        productName: event.productName,
        category: event.category || "",
        count: 0,
        sessions: new Set(),
        orderCount: 0,
      };
      entry.count += 1;
      entry.sessions.add(sessionId);
      productViewMap.set(key, entry);
    }

    if (event.eventType === "product_click" && event.productName) {
      const key = event.productId || event.productName;
      const entry = productClickMap.get(key) || {
        productId: event.productId || "",
        productName: event.productName,
        category: event.category || "",
        count: 0,
        sessions: new Set(),
      };
      entry.count += 1;
      entry.sessions.add(sessionId);
      productClickMap.set(key, entry);
    }

    if (event.eventType === "add_to_cart" && event.productName) {
      const key = event.productId || event.productName;
      const entry = productAddMap.get(key) || {
        productId: event.productId || "",
        productName: event.productName,
        category: event.category || "",
        count: 0,
        sessions: new Set(),
        orderCount: 0,
      };
      entry.count += 1;
      entry.sessions.add(sessionId);
      productAddMap.set(key, entry);
    }

    if (event.eventType === "category_click" && (event.categoryLabel || event.category)) {
      const key = event.categoryLabel || event.category;
      const entry = categoryClickMap.get(key) || {
        categoryLabel: key,
        count: 0,
        sessions: new Set(),
        orderCount: 0,
      };
      entry.count += 1;
      entry.sessions.add(sessionId);
      categoryClickMap.set(key, entry);
    }
  }

  const categoryOrders = new Map();
  const productOrders = new Map();

  for (const order of orders) {
    const attribution = getOrderAttribution(order);
    const sourceEntry = sourceMap.get(attribution.sourceLabel) || {
      sourceLabel: attribution.sourceLabel,
      sourceType: attribution.sourceType,
      sessions: new Set(),
      pageViews: 0,
      checkoutStarted: new Set(),
      orders: 0,
      revenue: 0,
    };
    if (attribution.sessionId) {
      sourceEntry.sessions.add(attribution.sessionId);
      funnel.orderPlaced.add(attribution.sessionId);
    }
    sourceEntry.orders += 1;
    sourceEntry.revenue += Number(order.totalAmount || 0);
    sourceMap.set(attribution.sourceLabel, sourceEntry);

    const campaignEntry = campaignMap.get(attribution.campaignLabel) || {
      campaignLabel: attribution.campaignLabel,
      sourceLabel: attribution.sourceLabel,
      sessions: new Set(),
      orders: 0,
      revenue: 0,
    };
    if (attribution.sessionId) {
      campaignEntry.sessions.add(attribution.sessionId);
    }
    campaignEntry.orders += 1;
    campaignEntry.revenue += Number(order.totalAmount || 0);
    campaignMap.set(attribution.campaignLabel, campaignEntry);

    for (const item of order.items || []) {
      const productKey = item.product ? String(item.product) : item.name;
      productOrders.set(productKey, (productOrders.get(productKey) || 0) + 1);
      categoryOrders.set(item.category, (categoryOrders.get(item.category) || 0) + 1);
    }
  }

  for (const [key, entry] of productViewMap) {
    entry.orderCount = productOrders.get(key) || productOrders.get(entry.productName) || 0;
  }

  for (const [key, entry] of productAddMap) {
    entry.orderCount = productOrders.get(key) || productOrders.get(entry.productName) || 0;
  }

  for (const [key, entry] of categoryClickMap) {
    entry.orderCount = categoryOrders.get(key) || 0;
  }

  const totalSessions = sessionMap.size;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

  const sourcePerformance = Array.from(sourceMap.values())
    .map((entry) => {
      const visits = entry.sessions.size;
      const checkoutStarts = entry.checkoutStarted.size;
      return {
        sourceLabel: entry.sourceLabel,
        sourceType: entry.sourceType,
        visits,
        pageViews: entry.pageViews,
        checkoutStarted: checkoutStarts,
        orders: entry.orders,
        conversionRate: buildRate(entry.orders, visits),
        revenue: Number(entry.revenue || 0),
      };
    })
    .sort((left, right) => right.orders - left.orders || right.visits - left.visits);

  const funnelRows = [
    { key: "homepage", label: "Homepage", count: funnel.homepage.size },
    { key: "productView", label: "Product View", count: funnel.productView.size },
    { key: "addToCart", label: "Add to Cart", count: funnel.addToCart.size },
    { key: "checkoutStarted", label: "Checkout Started", count: funnel.checkoutStarted.size },
    { key: "paymentSelected", label: "Payment Selected", count: funnel.paymentSelected.size },
    { key: "orderPlaced", label: "Order Placed", count: funnel.orderPlaced.size || totalOrders },
  ].map((row, index, list) => {
    const next = list[index + 1];
    return {
      ...row,
      dropOffRate: next ? buildRate(row.count - next.count, row.count) : 0,
    };
  });

  const topProductsByViews = Array.from(productViewMap.values())
    .map((entry) => ({
      productId: entry.productId,
      productName: entry.productName,
      category: entry.category,
      views: entry.count,
      conversionRate: buildRate(entry.orderCount, entry.sessions.size),
    }))
    .sort((left, right) => right.views - left.views)
    .slice(0, 8);

  const topProductsByClicks = Array.from(productClickMap.values())
    .map((entry) => ({
      productId: entry.productId,
      productName: entry.productName,
      category: entry.category,
      clicks: entry.count,
    }))
    .sort((left, right) => right.clicks - left.clicks)
    .slice(0, 8);

  const topProductsByCart = Array.from(productAddMap.values())
    .map((entry) => ({
      productId: entry.productId,
      productName: entry.productName,
      category: entry.category,
      addToCart: entry.count,
      conversionRate: buildRate(entry.orderCount, entry.sessions.size),
    }))
    .sort((left, right) => right.addToCart - left.addToCart)
    .slice(0, 8);

  const highestConvertingProducts = Array.from(productViewMap.values())
    .map((entry) => ({
      productId: entry.productId,
      productName: entry.productName,
      category: entry.category,
      orders: entry.orderCount,
      conversionRate: buildRate(entry.orderCount, entry.sessions.size),
    }))
    .filter((entry) => entry.orders > 0)
    .sort((left, right) => right.conversionRate - left.conversionRate || right.orders - left.orders)
    .slice(0, 8);

  const categoryPerformance = Array.from(categoryClickMap.values())
    .map((entry) => ({
      categoryLabel: entry.categoryLabel,
      clicks: entry.count,
      orders: entry.orderCount,
      conversionRate: buildRate(entry.orderCount, entry.sessions.size),
    }))
    .sort((left, right) => right.clicks - left.clicks)
    .slice(0, 8);

  const campaignPerformance = Array.from(campaignMap.values())
    .map((entry) => ({
      campaignLabel: entry.campaignLabel,
      sourceLabel: entry.sourceLabel,
      sessions: entry.sessions.size,
      orders: entry.orders,
      conversionRate: buildRate(entry.orders, entry.sessions.size),
      revenue: Number(entry.revenue || 0),
    }))
    .sort((left, right) => right.orders - left.orders || right.sessions - left.sessions)
    .slice(0, 10);

  const geoInsight = Array.from(geoMap.values())
    .map((entry) => ({
      city: entry.city || "Unknown",
      state: entry.state || "",
      country: entry.country || "",
      sessions: entry.sessions.size,
      label:
        entry.city === "Unknown"
          ? "Location not available"
          : [entry.city, entry.state, entry.country].filter(Boolean).join(", "),
    }))
    .sort((left, right) => right.sessions - left.sessions)
    .slice(0, 10);

  const topLandingPages = Array.from(landingMap.values())
    .map((entry) => ({
      label: entry.label,
      pageLabel: entry.pageLabel,
      sourceLabel: entry.sourceLabel,
      path: entry.path,
      visits: entry.sessions.size,
    }))
    .sort((left, right) => right.visits - left.visits)
    .slice(0, 10);

  const recentVisitorJourneys = Array.from(sessionMap.values())
    .sort((left, right) => new Date(right.endedAt) - new Date(left.endedAt))
    .slice(0, 12)
    .map((session) => ({
      sessionId: session.sessionId,
      sourceLabel: session.sourceLabel,
      campaignLabel: session.campaignLabel,
      location: session.city === "Unknown" ? "Location not available" : session.location,
      landingLabel: session.landingLabel || "Landing",
      steps: session.steps.slice(0, 8),
      pageViews: session.pageViews,
      endedAt: session.endedAt,
      rawReferrer: session.rawReferrer,
      rawUTM: session.rawUTM,
      landingPath: session.landingPath,
    }));

  return {
    filters: {
      range: rangeKey,
      startDate: startDate || "",
      endDate: endDate || "",
      label,
    },
    overview: {
      visitors: totalSessions,
      sessions: totalSessions,
      pageViews,
      orders: totalOrders,
      revenue: totalRevenue,
      conversionRate: buildRate(totalOrders, totalSessions),
      heroClicks,
      searchUsage,
    },
    trafficSources: sourcePerformance,
    conversionFunnel: funnelRows,
    productPerformance: {
      mostViewed: topProductsByViews,
      mostClicked: topProductsByClicks,
      mostAddedToCart: topProductsByCart,
      highestConverting: highestConvertingProducts,
    },
    categoryPerformance,
    campaignPerformance,
    geoInsight: {
      rows: geoInsight,
      note: geoInsight.some((entry) => entry.city === "Unknown")
        ? "Location not available means the visitor IP could not be resolved."
        : "",
    },
    topLandingPages,
    recentVisitorJourneys,
    technicalDebug: recentVisitorJourneys.slice(0, 8),
  };
};
