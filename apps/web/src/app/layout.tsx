import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { NetworkStatus } from '@trionyx/ui';

const rounded = M_PLUS_Rounded_1c({
  variable: "--font-rounded",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const paperMono = localFont({
  src: "./fonts/PaperMono.woff2",
  variable: "--font-paper-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trionyx India — Surface Chemistry & Advanced Coatings",
  description: "Trionyx official website, formulations, dealer directory, and public warranty registry.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${rounded.variable} ${paperMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}<NetworkStatus /></body>
    </html>
  );
}
