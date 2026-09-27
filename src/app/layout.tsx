import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Recharge Nation",
    default: "Recharge Nation - Premium Event Management Platform"
  },
  description: "Experience premium cultural programs, talent hunts, singing & dance competitions, startup conferences, trade expos, and food festivals across India. Book tickets and register online today.",
  keywords: ["Recharge Nation", "Event Tickets", "Dance Competition", "Singing Competition", "Business Expo", "Cultural Festival", "Food Festival", "India Events"],
  authors: [{ name: "Recharge Nation Team" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://rechargenation.in",
    title: "Recharge Nation - Premium Event Management Platform",
    description: "Discover and participate in premium cultural, educational, business, and entertainment events across India.",
    siteName: "Recharge Nation"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
