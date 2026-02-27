import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-space-mono" });

export const metadata: Metadata = {
  title: "LeafSense AI",
  description: "Next-Gen Intelligent Crop Disease Detection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceMono.variable} font-sans min-h-screen pb-12 antialiased selection:bg-[#39ff14]/30 overflow-x-hidden`}>
        <Navigation />
        <div className="pt-24 min-h-[calc(100vh-6rem)]">
          {children}
        </div>
      </body>
    </html>
  );
}
