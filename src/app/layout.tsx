import type { Metadata } from "next";
import { Orbitron, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GDG Techfest 2026 | Quantum Shift",
  description: "Experience the next dimension of developer collaboration. Tinker with our interactive WebGL antigravity sandbox and claim your holographic VIP flip pass.",
  keywords: ["GDG", "Techfest", "React Three Fiber", "Next.js", "WebGL", "ThreeJS", "Antigravity", "Creative Frontend"],
  authors: [{ name: "GDG Organizers" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${inter.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#020203] text-zinc-100 selection:bg-gdg-blue/30 selection:text-white">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
