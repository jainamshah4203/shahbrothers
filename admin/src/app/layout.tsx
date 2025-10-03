import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ecom-store Admin",
  description: "Admin panel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600&family=Noto+Sans+Symbols+2&display=swap"
          rel="stylesheet"
        />
        <meta charSet="utf-8" />
      </head>
      <body>{children}</body>
    </html>
  );
}
