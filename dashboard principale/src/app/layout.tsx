import type { Metadata } from "next";
import { Manrope, Montserrat, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dashboard Principale - Tunisie Telecom",
  description: "Dashboard de performance organisationnelle (données: all-data.xlsx)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={`${manrope.variable} ${plusJakartaSans.variable} ${montserrat.variable} h-full antialiased`}
      lang="fr"
    >
      <body className="min-h-full bg-tt-bg font-[family-name:var(--font-manrope)] text-gray-900">
        {children}
      </body>
    </html>
  );
}
