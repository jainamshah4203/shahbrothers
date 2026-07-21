import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClientProviders } from "./providers";
import CartDrawer from "@/components/cart/CartDrawer";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnimatedCursor from "@/components/Cursor/AnimatedCursor";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shah Brothers — Artisan Stationery House",
  description:
    "Curated writing instruments, notebooks, and desk objects. Personalized foil, archival papers, and stationery with presence.",
  keywords: [
    "stationery",
    "fountain pens",
    "notebooks",
    "foil stamping",
    "desk accessories",
    "Shah Brothers",
  ],
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
    url: "https://shahbrothers.vercel.app",
    title: "Shah Brothers — Artisan Stationery House",
    description:
      "Curated writing instruments, notebooks, and desk objects. Personalized foil, archival papers, and stationery with presence.",
    siteName: "Shah Brothers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shah Brothers — Artisan Stationery House",
    description:
      "Curated writing instruments, notebooks, and desk objects. Personalized foil, archival papers, and stationery with presence.",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${cormorant.variable} font-sans antialiased tracking-tight bg-warm-off-white paper-grain`}
      >
        <AnimatedCursor />
        <ClientProviders>
          <TooltipProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <div className="relative z-10 flex-1">{children}</div>
              <Footer />
            </div>
            <Toaster />
            <Sonner />
            <CartDrawer />
          </TooltipProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
