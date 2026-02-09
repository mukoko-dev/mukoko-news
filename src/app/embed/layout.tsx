import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zimbabwe News Widget",
  description:
    "Embeddable Zimbabwe news feed powered by Mukoko News. Latest headlines from Zimbabwe's top news sources.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
