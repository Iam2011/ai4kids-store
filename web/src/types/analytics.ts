export type TrackedEventType =
  | "page_view"
  | "hero_click"
  | "category_click"
  | "product_view"
  | "product_click"
  | "search_submit"
  | "add_to_cart"
  | "buy_now_click"
  | "checkout_started"
  | "payment_option_selected"
  | "order_placed";

export type AnalyticsSnapshot = {
  sessionId: string;
  sourceLabel: string;
  sourceType: string;
  campaignLabel: string;
  rawReferrer: string;
  rawUTM: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
  landingPath: string;
  landingPageLabel: string;
};
