import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "News Widget",
  description:
    "Embeddable location-based news cards powered by Mukoko News.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EmbedIframeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Suspense boundary required for useSearchParams() in the client component
  // Standalone layout — no header/footer/nav for iframe embedding
  return <Suspense>{children}</Suspense>;
}
