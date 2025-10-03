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
  title: "ecom-store - Premium Fashion Collection",
  description: "Discover sophisticated fashion with ecom-store's curated collection of premium clothing and accessories.",
  keywords: ["fashion", "premium", "clothing", "accessories", "style", "elegance"],
  authors: [{ name: "ecom-store" }],
  creator: "ecom-store",
  publisher: "ecom-store",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ecom-store.example",
    title: "ecom-store - Premium Fashion Collection",
    description: "Discover sophisticated fashion with ecom-store's curated collection of premium clothing and accessories.",
    siteName: "ecom-store",
  },
  twitter: {
    card: "summary_large_image",
    title: "ecom-store - Premium Fashion Collection",
    description: "Discover sophisticated fashion with ecom-store's curated collection of premium clothing and accessories.",
    creator: "@ecom_store",
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
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
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