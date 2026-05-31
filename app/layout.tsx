import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";
import { ClientProviders } from "@/components/shared/ClientProviders";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Roundtable — Ask anything. Find community.",
  description:
    "A space to ask any question, seek prayer, find support, and be pointed to Jesus. No AI. Real people. Real conversations.",
  openGraph: {
    title: "Roundtable",
    description: "Ask anything. Find community. Be pointed to Jesus.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen">
        <ClientProviders>
          <Navbar />
          <main>{children}</main>
        </ClientProviders>
      </body>
    </html>
  );
}
