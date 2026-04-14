import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { getOrder } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils/format-price";
import { OrderTracker } from "./order-tracker";

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrder(orderNumber).catch(() => null);

  return (
    <PageContainer>
      <section className="rounded-[30px] bg-white/95 p-6 shadow-[0_24px_60px_rgba(153,132,196,0.15)]">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a89b6]">
          Order Confirmed
        </span>
        <h1 className="mt-2 text-3xl font-black text-[#40346f]">Your order has been placed.</h1>
        <p className="mt-3 text-sm leading-7 text-[#6d6790]">
          Thanks for shopping with AI4Kids. Your payment is confirmed and your order is now in the processing queue.
        </p>
        <div className="mt-5 rounded-[24px] bg-[#f6f1ff] p-4">
          <p className="text-sm text-[#6d6790]">Order ID</p>
          <strong className="text-lg text-[#33285f]">{orderNumber}</strong>
          {order ? (
            <p className="mt-2 text-sm text-[#6d6790]">Amount paid: {formatPrice(order.paymentAmount)}</p>
          ) : null}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/" className="inline-flex min-h-11 items-center rounded-full bg-gradient-to-r from-[#ff7f6b] via-[#ff6b96] to-[#8f6dff] px-5 text-sm font-semibold text-white">
            Continue Shopping
          </Link>
          <a
            href="mailto:support@ai4kids.in"
            className="inline-flex min-h-11 items-center rounded-full border border-[#eadcf4] bg-white px-5 text-sm font-semibold text-[#4a3f75]"
          >
            Contact Support
          </a>
        </div>
      </section>
      <OrderTracker orderNumber={orderNumber} orderValue={order?.totalAmount || 0} paymentOption="Pay Now" />
    </PageContainer>
  );
}
