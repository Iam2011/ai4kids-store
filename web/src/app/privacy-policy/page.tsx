import { PolicyPage } from "@/components/static/policy-page";

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Privacy Policy"
      title="How we handle your information"
      paragraphs={[
        "AI4Kids uses your order and contact details to process purchases, provide support, and share delivery-related updates.",
        "We do not ask for unnecessary personal information. Payment processing is handled through the selected secure payment flow.",
        "If you need help with your account, orders, or support details, you can contact us directly at info@ai4kids.in.",
      ]}
    />
  );
}
