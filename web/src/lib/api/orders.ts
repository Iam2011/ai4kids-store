import type { OrderRecord } from "@/types/checkout";
import { apiFetch } from "./client";

export const getOrder = (orderNumber: string) =>
  apiFetch<OrderRecord>(`/orders/${orderNumber}`, { revalidate: 0 });
