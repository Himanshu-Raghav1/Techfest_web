"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function MobileParallax() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const shape1Ref = useRef<HTMLDivElement>(null);
  const shape2Ref = useRef<HTMLDivElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Parallax animations using GSAP
      // 1. Grid drifts slowly downward
      if (gridRef.current) {
        gsap.to(gridRef.current, {
          y: scrollY * 0.18,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      // 2. Text Content drifts slightly upward/downward to create separation
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          y: scrollY * -0.06,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      // 3. Floating layered shape cards move faster
      if (shape1Ref.current) {
        gsap.to(shape1Ref.current, {
          y: scrollY * -0.22,
          rotation: scrollY * 0.08,
          duration: 0.6,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
      if (shape2Ref.current) {
        gsap.to(shape2Ref.current, {
          y: scrollY * -0.32,
          rotation: scrollY * -0.05,
          duration: 0.6,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      // 4. Background glowing color blobs shift at unique rates
      if (blob1Ref.current) {
        gsap.to(blob1Ref.current, {
          y: scrollY * 0.08,
          x: Math.sin(scrollY * 0.005) * 20,
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
      if (blob2Ref.current) {
        gsap.to(blob2Ref.current, {
          y: scrollY * -0.15,
          x: Math.cos(scrollY * 0.005) * 15,
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
    >
      {/* Parallax Background Grid */}
      <div
        ref={gridRef}
        className="absolute inset-0 w-full h-[120%] cyber-grid opacity-20 pointer-events-none"
      />

      {/* Blob 1: Neon Blue glow */}
      <div
        ref={blob1Ref}
        className="absolute top-1/4 left-[-10%] w-[60vw] h-[60vw] rounded-full bg-gdg-blue/15 blur-[80px]"
      />

      {/* Blob 2: Neon Red glow */}
      <div
        ref={blob2Ref}
        className="absolute top-1/2 right-[-20%] w-[70vw] h-[70vw] rounded-full bg-gdg-red/10 blur-[100px]"
      />

      {/* Floating 2D Tech elements (Layered cards mimicking 3D depth) */}
      <div
        ref={shape1Ref}
        className="absolute top-[18%] right-[8%] w-16 h-16 rounded-xl border border-gdg-blue/30 bg-cyber-dark/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(0,162,255,0.15)] pointer-events-none"
      >
        <span className="text-gdg-blue font-mono text-xs font-semibold">⚡ CLOUD</span>
      </div>

      <div
        ref={shape2Ref}
        className="absolute top-[48%] left-[10%] w-20 h-20 rounded-xl border border-gdg-green/30 bg-cyber-dark/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(0,255,102,0.15)] pointer-events-none"
      >
        <span className="text-gdg-green font-mono text-xs font-semibold">🤖 AI/ML</span>
      </div>
    </div>
  );
}
