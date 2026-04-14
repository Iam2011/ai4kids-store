"use client";

import { useEffect } from "react";
import { trackOrderPlacedOnce } from "@/lib/analytics/track";

export function OrderTracker({
  orderNumber,
  orderValue,
  paymentOption,
}: {
  orderNumber: string;
  orderValue: number;
  paymentOption: string;
}) {
  useEffect(() => {
    void trackOrderPlacedOnce({
      orderNumber,
      orderValue,
      paymentOption,
    });
  }, [orderNumber, orderValue, paymentOption]);

  return null;
}
