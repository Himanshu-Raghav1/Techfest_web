"use client";

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import TechLogo from "./TechLogo";
import DebrisField from "./DebrisField";

interface AntiGravityCanvasProps {
  gravityOn: boolean;
}

export default function AntiGravityCanvas({ gravityOn }: AntiGravityCanvasProps) {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check screen size
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Return null on SSR or if it's a mobile device to prevent rendering heavy WebGL
  if (!mounted || !isDesktop) {
    return null;
  }

  return (
    <div className="absolute inset-y-0 right-0 w-full md:w-1/2 h-full pointer-events-none z-0">
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        {/* Lights configuration */}
        <ambientLight intensity={0.2} />
        
        {/* Key Directional Light for general metallic sheen */}
        <directionalLight
          position={[5, 10, 3]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        
        {/* GDG Color Light Rig to project vibrant chrome highlights */}
        {/* Neon Red - Top Left */}
        <pointLight position={[-4, 3, 2]} intensity={4} distance={10} color="#FF003C" />
        
        {/* Electric Blue - Top Right */}
        <pointLight position={[4, 3, 2]} intensity={4} distance={10} color="#00A2FF" />
        
        {/* Cyber Yellow - Bottom Left */}
        <pointLight position={[-4, -3, 2]} intensity={4} distance={10} color="#FFE600" />
        
        {/* Bio Green - Bottom Right */}
        <pointLight position={[4, -3, 2]} intensity={4} distance={10} color="#00FF66" />
        
        {/* Extra glowing backlight to separate objects from dark background */}
        <pointLight position={[0, 0, -3]} intensity={3} distance={8} color="#00A2FF" />

        {/* 3D Scene Components */}
        <TechLogo gravityOn={gravityOn} />
        
        <DebrisField gravityOn={gravityOn} />

        {/* Subtle camera controls for mild interactivity (auto-rotates and allows minor user tilt) */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          rotateSpeed={0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={2 * Math.PI / 3}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}
