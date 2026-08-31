import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Space_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const barlowCondensed = Barlow_Condensed({
  weight: ["600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OrderWars — Food Order Tracker & Friend Leaderboard",
  description: "Log every food delivery, track group spending, and compete on the canteen scoreboard.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1B1B1B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${spaceMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#141414] text-[#F5F2EC] selection:bg-[#C1432E] selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
