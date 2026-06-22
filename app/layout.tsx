import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";
import { ClientProviders } from "@/components/shared/ClientProviders";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Roundtable — Bring your doubts to the table.",
  description:
    "Ask the hard questions. Share what hurts. Get real prayer. A safe, anonymous space to be honest about faith, doubt, and life — with people who actually care.",
  openGraph: {
    title: "Roundtable",
    description: "Bring your doubts, questions, and fears to the table. Anonymous, always — with people who care.",
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
