import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClientProviders } from "./providers";
import MiniCart from "@/components/cart/MiniCart";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shah Brothers - Premium Stationery & Office Supplies",
  description: "Discover premium writing instruments, notebooks, and desk accessories curated by Shah Brothers.",
  keywords: ["stationery", "premium", "office supplies", "pens", "notebooks", "desk accessories"],
  authors: [{ name: "Shah Brothers" }],
  creator: "Shah Brothers",
  publisher: "Shah Brothers",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shahbrothers.example",
    title: "Shah Brothers - Premium Stationery & Office Supplies",
    description: "Discover premium writing instruments, notebooks, and desk accessories curated by Shah Brothers.",
    siteName: "Shah Brothers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shah Brothers - Premium Stationery & Office Supplies",
    description: "Discover premium writing instruments, notebooks, and desk accessories curated by Shah Brothers.",
    creator: "@shah_brothers",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
 

// Avoid static optimization during development to prevent refresh-only crashes
// export const dynamic = 'force-dynamic';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import AnimatedCursor from "@/components/Cursor/AnimatedCursor";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <AnimatedCursor />
        <ClientProviders>
          <TooltipProvider>
            {children}
            <Toaster />
            <Sonner />
            <MiniCart />
          </TooltipProvider>
        </ClientProviders>
      </body>
    </html>
  );
}