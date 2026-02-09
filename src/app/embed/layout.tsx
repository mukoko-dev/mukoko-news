import type { Metadata } from "next";
import { getFullUrl } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Embed News Widgets",
  description:
    "Add live Zimbabwe news to any website or app. Embeddable news feed powered by Mukoko News — free, no API key required.",
  alternates: {
    canonical: getFullUrl("/embed"),
  },
  openGraph: {
    title: "Embed News Widgets | Mukoko News",
    description:
      "Add live Zimbabwe news to any website or app. Free embeddable news widget.",
    url: getFullUrl("/embed"),
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Embed News Widgets | Mukoko News",
    description:
      "Add live Zimbabwe news to any website or app. Free embeddable news widget.",
    creator: "@mukokoafrica",
    site: "@mukokoafrica",
  },
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
