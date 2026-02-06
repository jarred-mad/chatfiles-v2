// Build trigger: 2026-02-04-v2
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AgeVerification from "@/components/ui/AgeVerification";
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
        {/* Ezoic Domain Verification */}
        <meta name="ezoic-site-verification" content="olOYBUxF2oaAMyaqirvPbrhPZYTX99" />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-GFZS9CDFWN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GFZS9CDFWN');
          `}
        </Script>
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {/* Hidden Google Translate element */}
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        <AgeVerification />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
// Vercel deploy trigger: 1770350202
// Build 1770350624
