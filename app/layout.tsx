import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");

  return {
    metadataBase: new URL(`${protocol}://${host}`),
    title: "BrokerLens — Transparent Business Valuation",
    description:
      "A broker-ready valuation workspace that combines normalized earnings, risk adjustments, and sourced local market research.",
    openGraph: {
      title: "BrokerLens — Price the business. Show the reasoning.",
      description:
        "Turn owner financials, deal quality, and local market evidence into a defensible asking price.",
      type: "website",
      images: [{ url: "/og.png", width: 1734, height: 909, alt: "BrokerLens valuation intelligence" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "BrokerLens",
      description: "Transparent, source-aware business valuation for brokers.",
      images: ["/og.png"],
    },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
