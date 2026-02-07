import type { Metadata } from "next";
import { getFullUrl } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your Mukoko News profile, preferences, and settings.",
  alternates: {
    canonical: getFullUrl("/profile"),
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
