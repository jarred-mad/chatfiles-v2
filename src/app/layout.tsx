import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdSlot from "@/components/ui/AdSlot";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://chatfiles.org"),
  title: {
    default: "ChatFiles.org - Searchable DOJ Epstein Files Archive",
    template: "%s | ChatFiles.org",
  },
  description:
    "Search and explore 935,000+ pages of publicly released DOJ documents. Full-text search, facial recognition, and OCR-processed files from the Epstein disclosure.",
  keywords: [
    "Epstein files",
    "DOJ documents",
    "searchable archive",
    "public records",
    "document search",
  ],
  authors: [{ name: "ChatFiles.org" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chatfiles.org",
    siteName: "ChatFiles.org",
    title: "ChatFiles.org - Searchable DOJ Epstein Files Archive",
    description:
      "Search and explore 935,000+ pages of publicly released DOJ documents.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ChatFiles.org",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatFiles.org - Searchable DOJ Epstein Files Archive",
    description:
      "Search and explore 935,000+ pages of publicly released DOJ documents.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5314062114057461"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Header />

        {/* Leaderboard ad below header */}
        <div className="bg-gray-50 py-2 flex justify-center">
          <AdSlot size="leaderboard" id="header-leaderboard" />
        </div>

        {/* Main content */}
        <main className="flex-1">{children}</main>

        {/* Mobile banner ad */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-center py-1 z-40">
          <AdSlot size="mobile-banner" id="mobile-footer" />
        </div>

        <Footer />
      </body>
    </html>
  );
}
