import type { Metadata } from "next";
import { getFullUrl } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Discover",
  description:
    "Explore news from across Africa. Browse by category, country, or source. Find stories from Zimbabwe, South Africa, Kenya, Nigeria, Ghana, and more African nations.",
  alternates: {
    canonical: getFullUrl("/discover"),
  },
  openGraph: {
    title: "Discover African News | Mukoko News",
    description:
      "Explore news from across Africa. Browse by category, country, or source.",
    url: getFullUrl("/discover"),
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Discover African News | Mukoko News",
    description:
      "Explore news from across Africa by category, country, or source.",
    creator: "@mukokoafrica",
  },
};

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
