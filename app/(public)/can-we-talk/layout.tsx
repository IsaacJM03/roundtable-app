import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-cwt-heading",
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-cwt-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Can We Talk? — Roundtable",
  description:
    "A safe, anonymous space to be honest about faith, doubt, and life — with people who actually care.",
};

export default function CanWeTalkLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${fredoka.variable} ${nunito.variable}`}>{children}</div>
  );
}
