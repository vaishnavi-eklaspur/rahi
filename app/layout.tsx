import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import AuthorFooter from "@/components/AuthorFooter";

// Fraunces (serif, some character) for headlines; Inter for everything else.
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["opsz"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Rahi — find your path",
  description: "A quiet, careful career companion. Discover the work that fits your interests, aptitude, and emotional strengths.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header />
        {children}
        <AuthorFooter />
      </body>
    </html>
  );
}
