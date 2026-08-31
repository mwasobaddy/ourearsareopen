import React from "react"
import type { Metadata, Viewport } from "next";
import { Inter, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import "./globals.css";
import { LayoutShell } from "@/components/layout-shell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "Our Ears Are Open | Compassionate Listening Support",
  description:
    "Accessible, inclusive listening support for adults 18+. Connect with a caring listener through phone or chat — no judgment, no pressure.",
  keywords: [
    "listening support",
    "mental wellness",
    "phone conversations",
    "chat conversations",
    "crisis help",
    "community support",
  ],
};

export const viewport: Viewport = {
  themeColor: "#9A6B4B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <LayoutShell>{children}</LayoutShell>
        <Toaster richColors position="top-center" />
        <Analytics />
      </body>
    </html>
  );
}
