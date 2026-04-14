import { PolicyPage } from "@/components/static/policy-page";

export default function ShippingPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Shipping Policy"
      title="Shipping and delivery details"
      paragraphs={[
        "AI4Kids delivers across India. Delivery timelines vary by product availability, destination, and shipping partner serviceability.",
        "Orders are usually prepared quickly after confirmation. During high-demand periods or combo campaigns, dispatch may take slightly longer.",
        "If you choose Cash on Delivery, the confirmation amount is collected first and the remaining balance is due at delivery.",
      ]}
    />
  );
}
