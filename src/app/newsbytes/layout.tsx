import type { Metadata } from "next";
import { getFullUrl } from "@/lib/constants";

export const metadata: Metadata = {
  title: "NewsBytes",
  description:
    "Quick-scroll African news stories in a TikTok-style vertical feed. Browse trending headlines from Zimbabwe, South Africa, Kenya, Nigeria, and more.",
  alternates: {
    canonical: getFullUrl("/newsbytes"),
  },
  openGraph: {
    title: "NewsBytes - Quick African News | Mukoko News",
    description:
      "Quick-scroll African news stories in a TikTok-style vertical feed.",
    url: getFullUrl("/newsbytes"),
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "NewsBytes - Quick African News | Mukoko News",
    description: "Quick-scroll African news in a vertical feed format.",
    creator: "@mukokoafrica",
  },
};

export default function NewsBytesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // NewsBytes has its own fullscreen layout without header/footer
  return <>{children}</>;
}
