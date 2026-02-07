import type { Metadata } from "next";
import { getFullUrl } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Analytics and trending topics across African news. See platform stats, trending categories, and top journalists on Mukoko News.",
  alternates: {
    canonical: getFullUrl("/insights"),
  },
  openGraph: {
    title: "News Insights & Analytics | Mukoko News",
    description:
      "Trending topics, analytics, and top journalists across African news.",
    url: getFullUrl("/insights"),
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "News Insights | Mukoko News",
    description: "Trending topics and analytics across African news.",
    creator: "@mukokoafrica",
  },
};

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
