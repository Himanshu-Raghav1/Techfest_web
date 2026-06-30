"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Cpu, Shield, Sparkles, Terminal, Activity, Zap, Compass } from "lucide-react";
import AntiGravityCanvas from "@/components/AntiGravityCanvas";
import MobileParallax from "@/components/MobileParallax";
import HolographicPassCanvas from "@/components/HolographicPassCanvas";

export default function Home() {
  const [gravityOn, setGravityOn] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Developer");

  useEffect(() => {
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Change nav styling on scroll
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // ScrollTrigger to reset gravity when scrolling past Hero
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "bottom 80%",
        onLeave: () => {
          setGravityOn(true);
        },
      });
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      ctx.revert();
    };
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      setRegistered(true);
      // Scroll smoothly to the pass card
      setTimeout(() => {
        const element = document.getElementById("cyber-pass-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-darker text-zinc-100 flex flex-col relative font-sans">
      {/* Cyber Grid Base Backgrounds */}
      <div className="fixed inset-0 w-full h-full cyber-grid opacity-30 pointer-events-none z-[1]" />
      <div className="fixed inset-0 w-full h-full cyber-grid-dots opacity-40 pointer-events-none z-[1]" />

      {/* Futuristic Navbar */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-cyber-dark/85 backdrop-blur-md py-4 border-white/10"
            : "bg-transparent py-6 border-white/0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gdg-red via-gdg-blue to-gdg-green flex items-center justify-center p-[2px]">
              <div className="w-full h-full bg-cyber-darker rounded-[6px] flex items-center justify-center">
                <Terminal className="w-5 h-5 text-gdg-blue" />
              </div>
            </div>
            <div>
              <span className="font-orbitron font-bold tracking-wider text-lg bg-gradient-to-r from-gdg-blue via-gdg-green to-gdg-yellow bg-clip-text text-transparent">
                GDG TECHFEST
              </span>
              <span className="text-[9px] font-mono block text-white/50 leading-none">
                VER. 2026.06
              </span>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="hidden md:flex items-center gap-6 font-mono text-[10px] text-white/60">
            <div className="flex items-center gap-2 border border-white/5 px-3 py-1 rounded bg-white/5">
              <Activity className="w-3.5 h-3.5 text-gdg-green animate-pulse" />
              <span>SYS STATUS: <span className="text-gdg-green font-semibold">ACTIVE</span></span>
            </div>
            <div className="flex items-center gap-2 border border-white/5 px-3 py-1 rounded bg-white/5">
              <Zap className="w-3.5 h-3.5 text-gdg-yellow" />
              <span>ENV GRAVITY: <span className={gravityOn ? "text-gdg-blue" : "text-gdg-red font-semibold animate-pulse"}>{gravityOn ? "1.0G (STD)" : "0.0G (ZERO)"}</span></span>
            </div>
          </div>

          <a
            href="#register"
            className="font-orbitron text-xs tracking-wider border border-gdg-blue/30 px-5 py-2 rounded-md bg-gdg-blue/5 text-gdg-blue hover:bg-gdg-blue/20 hover:shadow-[0_0_15px_rgba(0,162,255,0.3)] transition-all duration-300"
          >
            CLAIM PASS
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        ref={heroRef}
        className="min-h-screen flex flex-col justify-center items-center relative px-6 pt-24 overflow-hidden z-10"
      >
        {/* R3F Sandbox canvas - fixed inside back of Hero */}
        <AntiGravityCanvas gravityOn={gravityOn} />
        
        {/* 2D Mobile Parallax fallback */}
        <MobileParallax />

        {/* Easter Egg Promo Code (Behind the Canvas floating components) */}
        <div className="absolute inset-y-0 right-0 w-full md:w-1/2 flex items-center justify-center pointer-events-none z-0">
          <div
            className={`transition-all duration-700 transform ${
              !gravityOn ? "opacity-100 scale-100 blur-none" : "opacity-0 scale-95 blur-md"
            } flex flex-col items-center justify-center`}
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-gdg-blue/60 mb-2 font-mono">
              ★ Easter Egg Unlocked ★
            </span>
            <h2 className="text-4xl md:text-6xl font-bold font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-gdg-red via-gdg-yellow to-gdg-green filter drop-shadow-[0_0_15px_rgba(0,162,255,0.7)]">
              LAUNCH2026
            </h2>
            <span className="text-xs font-mono tracking-widest text-white/70 mt-3 border border-white/10 px-4 py-1.5 rounded-full bg-cyber-dark/80 backdrop-blur-md shadow-inner">
              Use for VIP Entry
            </span>
          </div>
        </div>

        {/* Foreground Content Panel */}
        <div className="max-w-7xl w-full mx-auto px-6 flex flex-col md:flex-row items-center justify-between relative z-10 mt-12 md:mt-0 gap-12">
          {/* Left Column: Text Content (Left-aligned on desktop, centered on mobile) */}
          <div className="w-full md:w-[48%] flex flex-col items-center md:items-start text-center md:text-left gap-6 pointer-events-none">
            <div className="inline-flex items-center gap-2 border border-gdg-blue/20 px-3 py-1 rounded-full bg-cyber-dark/40 backdrop-blur-md shadow-[0_0_10px_rgba(0,162,255,0.05)]">
              <span className="w-1.5 h-1.5 rounded-full bg-gdg-blue animate-ping" />
              <span className="font-mono text-[10px] tracking-wider text-gdg-blue uppercase">
                Google Developer Groups Present
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-orbitron tracking-tight leading-none">
              <span className="text-white block md:inline">QUANTUM</span>{" "}
              <span className="bg-gradient-to-r from-gdg-red via-gdg-yellow to-gdg-blue bg-clip-text text-transparent filter drop-shadow-[0_0_30px_rgba(0,162,255,0.2)]">
                SHIFT
              </span>
            </h1>

            <p className="max-w-xl text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed font-light">
              Enter the next dimension of developer collaboration. Tinker with our interactive WebGL antigravity field or register to claim your iridescent VIP flip pass.
            </p>

            {/* Interactive controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 pointer-events-auto">
              {/* Gravity Toggle Button */}
              <button
                onClick={() => setGravityOn(!gravityOn)}
                className={`font-orbitron font-semibold tracking-wider text-xs px-8 py-4 rounded-lg border-2 transition-all duration-300 flex items-center gap-3 relative overflow-hidden group shadow-lg ${
                  gravityOn
                    ? "border-gdg-blue/30 bg-cyber-dark/60 text-gdg-blue hover:bg-gdg-blue/15 hover:shadow-[0_0_20px_rgba(0,162,255,0.2)]"
                    : "border-gdg-red/50 bg-gdg-red/10 text-gdg-red hover:bg-gdg-red/20 hover:shadow-[0_0_20px_rgba(255,0,60,0.3)]"
                }`}
              >
                <Compass className={`w-4.5 h-4.5 ${!gravityOn ? "animate-spin" : ""}`} />
                <span>{gravityOn ? "TOGGLE ZERO GRAVITY" : "RESTORE GRAVITY"}</span>
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-current to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </button>

              <a
                href="#register"
                className="font-orbitron font-semibold tracking-wider text-xs px-8 py-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all duration-300"
              >
                REGISTER FOR VIP PASS
              </a>
            </div>
          </div>

          {/* Right Column Spacer: Reserves space for the 3D WebGL Logo Canvas */}
          <div className="hidden md:block w-[48%] h-[500px]" />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none opacity-50">
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase">Scroll Down</span>
          <div className="w-[1.5px] h-8 bg-white/20 relative overflow-hidden rounded-full">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gdg-blue rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 px-6 relative z-10 border-t border-white/5 bg-cyber-dark/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-xl mx-auto">
            <h2 className="font-orbitron text-2xl md:text-3xl font-bold tracking-wider mb-4">
              CYBERNETIC CIRCUITS
            </h2>
            <p className="text-zinc-400 text-sm font-light leading-relaxed">
              Explore the core developmental modules curated to challenge and shape the future of technological integration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="border border-white/5 bg-cyber-dark/60 rounded-xl p-8 hover:border-gdg-blue/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-gdg-blue/10 border border-gdg-blue/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6 text-gdg-blue" />
              </div>
              <h3 className="font-orbitron font-bold text-lg mb-3 tracking-wide text-zinc-100 group-hover:text-gdg-blue transition-colors">
                QUANTUM INTERFACING
              </h3>
              <p className="text-zinc-400 text-sm font-light leading-relaxed">
                Connect and compile workflows on mock quantum infrastructure. Code algorithms directly targeting localized qubits and observe immediate outputs.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="border border-white/5 bg-cyber-dark/60 rounded-xl p-8 hover:border-gdg-yellow/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-gdg-yellow/10 border border-gdg-yellow/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-gdg-yellow" />
              </div>
              <h3 className="font-orbitron font-bold text-lg mb-3 tracking-wide text-zinc-100 group-hover:text-gdg-yellow transition-colors">
                NEURAL COMPUTING
              </h3>
              <p className="text-zinc-400 text-sm font-light leading-relaxed">
                Deploy transformer models to optimize processing efficiency. Build custom neural agents that collaborate synchronously to resolve data voids.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="border border-white/5 bg-cyber-dark/60 rounded-xl p-8 hover:border-gdg-green/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-gdg-green/10 border border-gdg-green/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-gdg-green" />
              </div>
              <h3 className="font-orbitron font-bold text-lg mb-3 tracking-wide text-zinc-100 group-hover:text-gdg-green transition-colors">
                ENCRYPTED SYNAPSE
              </h3>
              <p className="text-zinc-400 text-sm font-light leading-relaxed">
                Deconstruct cryptographically locked protocols in a simulated network. Prove network integrity and earn verified digital credits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section & Holographic Ticket */}
      <section
        id="register"
        className="py-24 px-6 relative z-10 border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Form Column */}
            <div>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 border border-gdg-green/20 px-3 py-1 rounded bg-gdg-green/5 text-gdg-green font-mono text-[9px] uppercase tracking-wider mb-3">
                  STATION 04
                </div>
                <h2 className="font-orbitron text-3xl md:text-4xl font-extrabold tracking-wider text-white mb-4">
                  RESERVE ACCESS
                </h2>
                <p className="text-zinc-400 text-sm font-light leading-relaxed">
                  Join hundreds of cyber-engineers. Fill in your details below to generate a unique cryptographically signed, iridescent 3D pass.
                </p>
              </div>

              {!registered ? (
                <form onSubmit={handleRegister} className="space-y-6">
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold tracking-wider font-orbitron uppercase mb-2">
                      OPERATOR NAME
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Ada Lovelace"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-cyber-dark/80 border border-white/10 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-white/20 focus:border-gdg-blue/50 focus:outline-none transition-all duration-300 shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold tracking-wider font-orbitron uppercase mb-2">
                      COMMS EMAIL
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g., ada@quantum.net"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-cyber-dark/80 border border-white/10 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-white/20 focus:border-gdg-blue/50 focus:outline-none transition-all duration-300 shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold tracking-wider font-orbitron uppercase mb-2">
                      SPECIALTY DIVISION
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-cyber-dark/80 border border-white/10 rounded-lg px-4 py-3 text-sm text-zinc-100 focus:border-gdg-blue/50 focus:outline-none transition-all duration-300"
                    >
                      <option value="Developer">Frontend Architect</option>
                      <option value="AI Specialist">AI/ML Researcher</option>
                      <option value="Cybersec">Security Architect</option>
                      <option value="Designer">Creative Technologist</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full font-orbitron font-semibold tracking-widest text-xs px-6 py-4 rounded-lg bg-gradient-to-r from-gdg-blue to-gdg-green hover:shadow-[0_0_20px_rgba(0,162,255,0.4)] text-cyber-darker transition-all duration-300 hover:scale-[1.01]"
                  >
                    COMPILE CREDENTIALS
                  </button>
                </form>
              ) : (
                <div className="border border-gdg-green/20 bg-gdg-green/5 rounded-xl p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-gdg-green/10 flex items-center justify-center mx-auto mb-4 border border-gdg-green/20">
                    <Sparkles className="w-6 h-6 text-gdg-green" />
                  </div>
                  <h3 className="font-orbitron font-bold text-lg text-gdg-green mb-2 uppercase">
                    CREDENTIALS REGISTERED
                  </h3>
                  <p className="text-zinc-400 text-sm font-light mb-6">
                    Welcome aboard, <span className="text-white font-semibold">{name}</span>. Your holographic security pass has been compiled. Explore it on the right by hovering your cursor over it!
                  </p>
                  <button
                    onClick={() => setRegistered(false)}
                    className="text-xs text-gdg-blue underline font-mono hover:text-white"
                  >
                    Edit Registration Details
                  </button>
                </div>
              )}
            </div>

            {/* Canvas Column */}
            <div id="cyber-pass-section" className="flex flex-col items-center justify-center relative">
              {/* Decorative Frame */}
              <div className="absolute inset-0 border border-white/5 rounded-2xl bg-cyber-dark/30 backdrop-blur-md pointer-events-none z-0" />
              
              {/* Holographic Canvas */}
              <div className="relative z-10 w-full">
                <HolographicPassCanvas />
              </div>

              {/* Pass details summary overlay */}
              <div className="relative z-10 mt-4 text-center px-6 pb-6">
                <span className="text-[10px] font-mono text-white/40 tracking-wider">
                  SECURE HOLO-TICKET DEPLOYED | TYPE: R3F_IRIDESCENT_PHYSICS
                </span>
                {registered && (
                  <div className="mt-2 text-xs font-mono text-gdg-green flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gdg-green animate-ping" />
                    <span>HOLO-KEY REGISTERED TO: {name.toUpperCase()} ({role.toUpperCase()})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cyberpunk Footer */}
      <footer className="mt-auto py-12 px-6 border-t border-white/5 bg-cyber-darker text-center relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-mono text-xs text-white/40">
            © 2026 GDG Techfest Group. All rights reserved.
          </span>
          
          <div className="flex items-center gap-6 font-mono text-xs text-white/40">
            <a href="#" className="hover:text-gdg-blue transition-colors">POLICIES</a>
            <span>/</span>
            <a href="#" className="hover:text-gdg-blue transition-colors">TERMINAL_LOGS</a>
            <span>/</span>
            <a href="#" className="hover:text-gdg-blue transition-colors">API_SHEETS</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
