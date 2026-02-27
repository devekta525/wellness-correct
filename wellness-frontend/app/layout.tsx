import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/lib/redux/provider";
import PromoPopup from "@/components/home/promo-popup";
import { Providers } from "@/app/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
  title: 'Wellness Fuel — Premium Healthcare & Nutrition',
  description:
    'Discover our curated collection of superfoods, marine collagen, glutathione tablets, and authentic Himalayan Shilajit for optimal health and vitality.',
  keywords: 'superfoods, marine collagen, glutathione, shilajit, wellness, nutrition, healthcare supplements',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ReduxProvider>
          <Providers>
            {children}
            <PromoPopup />
          </Providers>
        </ReduxProvider>
      </body>
    </html>
  );
}
