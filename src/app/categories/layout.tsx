import type { Metadata } from "next";
import { getFullUrl } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse African news by category — politics, economy, sports, technology, health, education, entertainment, and more topics from across Africa.",
  alternates: {
    canonical: getFullUrl("/categories"),
  },
  openGraph: {
    title: "News Categories | Mukoko News",
    description:
      "Browse African news by category — politics, economy, sports, technology, and more.",
    url: getFullUrl("/categories"),
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "News Categories | Mukoko News",
    description: "Browse African news by topic and category.",
    creator: "@mukokoafrica",
  },
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
