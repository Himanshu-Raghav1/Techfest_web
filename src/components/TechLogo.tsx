"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TechLogoProps {
  gravityOn: boolean;
}

export default function TechLogo({ gravityOn }: TechLogoProps) {
  const logoGroupRef = useRef<THREE.Group>(null);
  
  // Refs for orbiting rings to rotate them independently
  const redRingRef = useRef<THREE.Mesh>(null);
  const blueRingRef = useRef<THREE.Mesh>(null);
  const yellowRingRef = useRef<THREE.Mesh>(null);
  const greenRingRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  // Memoize positions for points to prevent creation on every frame
  const positions = useMemo(() => {
    return new Float32Array(
      Array.from({ length: 90 }, () => (Math.random() - 0.5) * 1.5)
    );
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 1. Gentle floating animation (sine wave) for the entire group (only when gravity is ON)
    if (logoGroupRef.current) {
      if (gravityOn) {
        // Slow float and slow overall rotation
        logoGroupRef.current.position.y = Math.sin(t * 1.5) * 0.2;
        logoGroupRef.current.rotation.y = t * 0.15;
        logoGroupRef.current.rotation.z = Math.sin(t * 0.5) * 0.05;
      } else {
        // In zero-gravity, drift very slightly more erratically
        logoGroupRef.current.position.y = Math.sin(t * 0.8) * 0.3 + 0.1;
        logoGroupRef.current.rotation.y = t * 0.25;
        logoGroupRef.current.rotation.x = Math.cos(t * 0.4) * 0.1;
      }
    }

    // 2. Orbiting ring animations (always rotating to feel alive)
    if (redRingRef.current) {
      redRingRef.current.rotation.x = t * 0.8;
      redRingRef.current.rotation.y = t * 0.3;
    }
    if (blueRingRef.current) {
      blueRingRef.current.rotation.y = -t * 0.6;
      blueRingRef.current.rotation.z = t * 0.4;
    }
    if (yellowRingRef.current) {
      yellowRingRef.current.rotation.x = -t * 0.5;
      yellowRingRef.current.rotation.z = -t * 0.7;
    }
    if (greenRingRef.current) {
      greenRingRef.current.rotation.y = t * 0.5;
      greenRingRef.current.rotation.x = t * 0.5;
    }

    // Pulsate the central GDG energy core
    if (coreRef.current) {
      const scale = 1 + Math.sin(t * 4) * 0.08;
      coreRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={logoGroupRef}>
      {/* Central Core Sphere */}
      <mesh ref={coreRef} castShadow receiveShadow>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Main Stylized Chrome Frame (Outer Sphere/Cage) */}
      <mesh castShadow receiveShadow>
        <octahedronGeometry args={[1.2, 2]} />
        <meshPhysicalMaterial
          color="#0f0f15"
          metalness={1.0}
          roughness={0.08}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
          reflectivity={1.0}
          wireframe={true}
        />
      </mesh>

      {/* Second Chrome Structure (Interlocking Torus) */}
      <mesh castShadow receiveShadow rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[0.9, 0.08, 16, 100]} />
        <meshPhysicalMaterial
          color="#1b1b22"
          metalness={1.0}
          roughness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          reflectivity={1.0}
        />
      </mesh>

      {/* Orbiting Neon Ring 1: GDG Red */}
      <mesh ref={redRingRef} castShadow>
        <torusGeometry args={[1.4, 0.02, 8, 64]} />
        <meshStandardMaterial
          color="#FF003C"
          emissive="#FF003C"
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>

      {/* Orbiting Neon Ring 2: GDG Blue */}
      <mesh ref={blueRingRef} castShadow rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.6, 0.02, 8, 64]} />
        <meshStandardMaterial
          color="#00A2FF"
          emissive="#00A2FF"
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>

      {/* Orbiting Neon Ring 3: GDG Yellow */}
      <mesh ref={yellowRingRef} castShadow rotation={[0, Math.PI / 3, 0]}>
        <torusGeometry args={[1.8, 0.02, 8, 64]} />
        <meshStandardMaterial
          color="#FFE600"
          emissive="#FFE600"
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>

      {/* Orbiting Neon Ring 4: GDG Green */}
      <mesh ref={greenRingRef} castShadow rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[2.0, 0.02, 8, 64]} />
        <meshStandardMaterial
          color="#00FF66"
          emissive="#00FF66"
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>

      {/* Inner glowing particle cloud for premium cyber feel */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#00A2FF"
          size={0.06}
          sizeAttenuation={true}
          transparent={true}
          opacity={0.8}
        />
      </points>
    </group>
  );
}
