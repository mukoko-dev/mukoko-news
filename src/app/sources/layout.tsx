import type { Metadata } from "next";
import { getFullUrl } from "@/lib/constants";

export const metadata: Metadata = {
  title: "News Sources",
  description:
    "Browse all news sources aggregated by Mukoko News. See article counts, fetch status, and coverage across Zimbabwe, South Africa, Kenya, Nigeria, and more African nations.",
  alternates: {
    canonical: getFullUrl("/sources"),
  },
  openGraph: {
    title: "News Sources | Mukoko News",
    description:
      "Browse all news sources aggregated by Mukoko News across Africa.",
    url: getFullUrl("/sources"),
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "News Sources | Mukoko News",
    description:
      "Browse all news sources aggregated by Mukoko News across Africa.",
    creator: "@mukokoafrica",
  },
};

export default function SourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
