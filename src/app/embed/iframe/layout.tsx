import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zimbabwe News Widget",
  description:
    "Embeddable Zimbabwe news feed powered by Mukoko News.",
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
  // Standalone layout — no header/footer/nav for iframe embedding
  return <>{children}</>;
}
