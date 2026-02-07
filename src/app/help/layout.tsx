import type { Metadata } from "next";
import { getFullUrl } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Get help with Mukoko News. Find answers to frequently asked questions about personalization, NewsBytes, saved articles, themes, and country coverage.",
  alternates: {
    canonical: getFullUrl("/help"),
  },
  openGraph: {
    title: "Help Center | Mukoko News",
    description:
      "FAQs and support for Mukoko News — Pan-African news aggregation platform.",
    url: getFullUrl("/help"),
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Help Center | Mukoko News",
    description: "Get help and find answers to common questions.",
    creator: "@mukokoafrica",
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
