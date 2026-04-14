import { PolicyPage } from "@/components/static/policy-page";

export default function ReturnRefundPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Return & Refund"
      title="Returns, replacement, and refund support"
      paragraphs={[
        "If a product arrives damaged or there is an issue with the order, contact AI4Kids support as soon as possible with your order details.",
        "Eligible refund or replacement decisions depend on the product issue, delivery condition, and support review.",
        "For COD confirmation orders, the balance due and refund handling will follow the confirmed order and payment status recorded for that order.",
      ]}
    />
  );
}
