"use client";

import { useState, useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import TechLogo from "./TechLogo";
import DebrisField from "./DebrisField";

interface AntiGravityCanvasProps {
  gravityOn: boolean;
  coreSpeed?: number;
  coreHeat?: string;
  coreEntropy?: number;
}

// Camera Director handles the scroll-linked viewport transitions and zooming
interface CameraDirectorProps {
  scrollPercentRef: React.RefObject<number>;
}

function CameraDirector({ scrollPercentRef }: CameraDirectorProps) {
  const { camera } = useThree();
  const activeLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    const scrollPercent = scrollPercentRef.current;
    
    const targetCamPos = new THREE.Vector3(0, 0, 5);
    const targetLookAt = new THREE.Vector3(0, 0, 0);
    let targetFov = 60;

    if (scrollPercent <= 0.3) {
      // Section 1: Hero
      // Shift camera further left and look further left to render the 3D logo more to the right
      const t = scrollPercent / 0.3;
      targetCamPos.set(-1.8, 0.1 + t * 0.2, 4.8 - t * 1.0); // push-in from 4.8 to 3.8
      targetLookAt.set(-0.8, 0, 0);
      targetFov = 60 - t * 5;
    } else if (scrollPercent <= 0.7) {
      // Section 2: Features
      // Glides camera from left to right, orbiting the logo to the left side of the screen
      const t = (scrollPercent - 0.3) / 0.4;
      targetCamPos.set(
        -1.8 + t * 3.0,     // Shifts smoothly from -1.8 to +1.2
        0.3 + t * 0.5,      // Climbs from 0.3 to 0.8
        3.8                 // Keeps distance at 3.8
      );
      targetLookAt.set(
        -0.8 + t * 1.2,     // Shifts focus smoothly from -0.8 to +0.4
        -t * 0.1,
        0
      );
      targetFov = 55 - t * 15; // Narrows FOV for a telescopic close-up
    } else {
      // Section 3: Registration & Pass
      // Shifting camera right, looking left to keep logo on the left column (behind the pass ticket)
      const t = (scrollPercent - 0.7) / 0.3;
      targetCamPos.set(
        1.2 + t * 0.8,      // Shifts from 1.2 to 2.0
        0.8 - t * 0.2,      // Drops height slightly from 0.8 to 0.6
        3.8 + t * 0.8       // Zooms out slightly from 3.8 to 4.6
      );
      targetLookAt.set(
        0.4 - t * 0.8,      // Focus shifts from 0.4 to -0.4 (logo remains left)
        -0.1 - t * 0.1,
        0
      );
      targetFov = 40;
    }

    // Smoothly lerp camera position
    camera.position.lerp(targetCamPos, 0.08);

    // Smoothly lerp focal point and update lookAt
    activeLookAt.current.lerp(targetLookAt, 0.08);
    camera.lookAt(activeLookAt.current);

    // Update FOV dynamically
    if (camera instanceof THREE.PerspectiveCamera) {
      if (Math.abs(camera.fov - targetFov) > 0.01) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.08);
        camera.updateProjectionMatrix();
      }
    }
  });

  return null;
}

export default function AntiGravityCanvas({
  gravityOn,
  coreSpeed = 1.0,
  coreHeat = "#FF007F",
  coreEntropy = 1.0,
}: AntiGravityCanvasProps) {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  // High-performance scroll tracking using refs to prevent React re-render cycles
  const scrollPercentRef = useRef(0);
  const scrollVelocityRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    
    // Check screen size
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // High performance scroll listener
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalScroll > 0 ? scrollY / totalScroll : 0;
      scrollPercentRef.current = progress;

      // Calculate instantaneous scroll velocity
      const now = performance.now();
      const dt = Math.max((now - lastTime) / 1000, 0.001); // in seconds
      const deltaScroll = Math.abs(scrollY - lastScrollY) / window.innerHeight; // normalized scroll distance
      const instantVelocity = deltaScroll / dt;

      // Smooth out velocity spikes using a low-pass filter
      scrollVelocityRef.current = scrollVelocityRef.current * 0.75 + instantVelocity * 0.25;

      lastScrollY = scrollY;
      lastTime = now;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Frame decay component inside R3F Canvas to decay scroll velocity back to zero when idle
  function VelocityDecayer() {
    useFrame((state, delta) => {
      scrollVelocityRef.current = THREE.MathUtils.lerp(scrollVelocityRef.current, 0, delta * 3.0);
    });
    return null;
  }

  // Return null on SSR or if it's a mobile device to prevent rendering heavy WebGL
  if (!mounted || !isDesktop) {
    return null;
  }

  return (
    <div className="fixed inset-0 w-screen h-screen pointer-events-none z-0">
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        <VelocityDecayer />
        
        {/* Lights configuration */}
        <ambientLight intensity={0.15} />
        
        {/* Key Directional Light for chrome reflections */}
        <directionalLight position={[5, 10, 3]} intensity={1.5} castShadow />
        
        {/* Brand Cyber Color Light Rig */}
        {/* Electric Cyan - Left Side */}
        <pointLight position={[-4, 3, 2]} intensity={5} distance={12} color="#00F0FF" />
        
        {/* Cyber Magenta - Right Side */}
        <pointLight position={[4, -3, 2]} intensity={5} distance={12} color={coreHeat} />
        
        {/* Accent green - Behind */}
        <pointLight position={[0, 4, -2]} intensity={3} distance={10} color="#00FF66" />
        <pointLight position={[0, -2, -3]} intensity={4} distance={8} color={coreHeat} />

        {/* Camera director animates camera positions along spline */}
        <CameraDirector scrollPercentRef={scrollPercentRef} />

        {/* 3D Scene Components */}
        <TechLogo 
          gravityOn={gravityOn} 
          scrollPercentRef={scrollPercentRef}
          scrollVelocityRef={scrollVelocityRef}
          coreSpeed={coreSpeed}
          coreHeat={coreHeat}
          coreEntropy={coreEntropy}
        />
        
        <DebrisField 
          gravityOn={gravityOn}
          scrollPercentRef={scrollPercentRef}
          scrollVelocityRef={scrollVelocityRef}
          coreSpeed={coreSpeed}
          coreEntropy={coreEntropy}
        />
      </Canvas>
    </div>
  );
}
