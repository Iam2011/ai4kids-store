import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";

export default async function PaymentFailurePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const orderNumber = typeof params.orderNumber === "string" ? params.orderNumber : "";
  const reason =
    typeof params.reason === "string" ? params.reason : "The payment could not be completed.";

  return (
    <PageContainer>
      <section className="rounded-[30px] bg-white/95 p-6 shadow-[0_24px_60px_rgba(153,132,196,0.15)]">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a89b6]">
          Payment Failed
        </span>
        <h1 className="mt-2 text-3xl font-black text-[#40346f]">Your payment did not go through.</h1>
        <p className="mt-3 text-sm leading-7 text-[#6d6790]">
          You can retry checkout safely and continue from your current cart. If the amount was debited and not confirmed, wait for your bank update and contact support if needed.
        </p>
        {orderNumber ? (
          <p className="mt-4 text-sm text-[#6d6790]">
            Order reference: <strong>{orderNumber}</strong>
          </p>
        ) : null}
        <p className="mt-4 rounded-[20px] bg-[#fff0f4] px-4 py-3 text-sm text-[#d04f76]">{reason}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/checkout" className="inline-flex min-h-11 items-center rounded-full bg-gradient-to-r from-[#ff7f6b] via-[#ff6b96] to-[#8f6dff] px-5 text-sm font-semibold text-white">
            Retry Payment
          </Link>
          <Link href="/cart" className="inline-flex min-h-11 items-center rounded-full border border-[#eadcf4] bg-white px-5 text-sm font-semibold text-[#4a3f75]">
            Return to Cart
          </Link>
        </div>
      </section>
    </PageContainer>
  );
}
