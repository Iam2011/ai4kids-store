"use client";

import { Suspense } from "react";
import { AnalyticsProvider } from "./analytics-provider";
import { CartProvider } from "./cart-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Suspense fallback={null}>
        <AnalyticsProvider />
      </Suspense>
      {children}
    </CartProvider>
  );
}
