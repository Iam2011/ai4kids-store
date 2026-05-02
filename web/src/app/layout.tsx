import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  metadataBase: new URL("https://ai4kids.in"),
  title: "AI4Kids | Best Toys for Kids",
  description: "Curated toys, playful gifting, and smart shopping for families across India.",
  openGraph: {
    title: "AI4Kids | Best Toys for Kids",
    description: "Curated toys, playful gifting, and smart shopping for families across India.",
    url: "https://ai4kids.in",
    siteName: "AI4Kids",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI4Kids | Best Toys for Kids",
    description: "Curated toys, playful gifting, and smart shopping for families across India.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
