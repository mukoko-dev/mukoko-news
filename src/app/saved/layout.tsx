import type { Metadata } from "next";
import { getFullUrl } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Saved Articles",
  description: "Your bookmarked articles on Mukoko News. Access saved stories for later reading.",
  alternates: {
    canonical: getFullUrl("/saved"),
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function SavedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
