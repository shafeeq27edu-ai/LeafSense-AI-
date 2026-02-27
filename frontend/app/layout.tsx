import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgriVision AI",
  description: "Intelligent Crop Disease Detection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen pb-12 antialiased selection:bg-[var(--color-primary)]/30`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
