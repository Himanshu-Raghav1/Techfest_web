import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "NEXUS Techfest 2026 | Quantum Spindle",
  description: "Experience the next dimension of computing. Tinker with our interactive WebGL Nexus Core reactor and claim your holographic VIP pass.",
  keywords: ["NEXUS", "Techfest", "React Three Fiber", "Next.js", "WebGL", "ThreeJS", "Quantum Reactor", "Creative Frontend"],
  authors: [{ name: "NEXUS Techfest" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased scroll-smooth"
    >
      <body className="min-h-full flex flex-col bg-[#020203] text-zinc-100 selection:bg-gdg-blue/30 selection:text-white">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
