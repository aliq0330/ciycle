import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ciycle — Motosiklet & Bisiklet Sosyal Ağı",
    template: "%s | Ciycle",
  },
  description:
    "Motosikletçiler ve bisikletçiler için premium sosyal ağ. Rota paylaş, etkinliklere katıl, kulüpler kur.",
  keywords: ["motosiklet", "bisiklet", "sosyal ağ", "rota", "sürüş", "topluluk"],
  authors: [{ name: "Ciycle" }],
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    siteName: "Ciycle",
    title: "Ciycle — Motosiklet & Bisiklet Sosyal Ağı",
    description: "Motosikletçiler ve bisikletçiler için premium sosyal ağ.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ciycle",
  },
};

export const viewport: Viewport = {
  themeColor: "#3FA36C",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${inter.variable} h-full`}>
      <body className="h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
