import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jyotish Guru | Vedic Astrology Powered by Ancient Wisdom",
  description:
    "Discover your cosmic blueprint with Jyotish Guru. Get personalized Vedic astrology readings, birth chart analysis, and life guidance powered by ancient wisdom and modern AI.",
  keywords: [
    "vedic astrology",
    "jyotish",
    "birth chart",
    "kundli",
    "horoscope",
    "astrology readings",
    "dasha",
    "nakshatra",
  ],
  openGraph: {
    title: "Jyotish Guru | Vedic Astrology Powered by Ancient Wisdom",
    description:
      "Discover your cosmic blueprint with personalized Vedic astrology readings.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body
        className="min-h-screen antialiased"
        style={{
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          background: "#F8F3E8",
          color: "#1A1613",
        }}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
