"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TechLogoProps {
  gravityOn: boolean;
  scrollPercentRef: React.RefObject<number>;
  scrollVelocityRef: React.RefObject<number>;
  coreSpeed?: number;
  coreHeat?: string;
  coreEntropy?: number;
}

export default function TechLogo({
  gravityOn,
  scrollPercentRef,
  scrollVelocityRef,
  coreSpeed = 1.0,
  coreHeat = "#FF007F",
  coreEntropy = 1.0,
}: TechLogoProps) {
  const logoGroupRef = useRef<THREE.Group>(null);
  
  // Refs for rotating parts of the Nexus Core
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const ringCyanRef = useRef<THREE.Mesh>(null);
  const ringMagentaRef = useRef<THREE.Mesh>(null);
  const ringGreenRef = useRef<THREE.Mesh>(null);
  const cageRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Memoize positions for the core particle cloud
  const positions = useMemo(() => {
    return new Float32Array(
      Array.from({ length: 150 }, () => (Math.random() - 0.5) * 1.6)
    );
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.1);

    const scrollPercent = scrollPercentRef.current;
    const scrollVelocity = scrollVelocityRef.current;

    // Direct multiplier based on scroll velocity + control speed scaling
    const speedFactor = coreSpeed;
    const spinBoost = scrollVelocity * 15.0 * speedFactor;
    const brightnessBoost = Math.min(scrollVelocity * 4.0, 2.5);

    // 1. Core group rotation and position
    if (logoGroupRef.current) {
      if (gravityOn) {
        // Slow breathing float + scroll-linked tilt
        logoGroupRef.current.position.y = Math.sin(t * 1.5 * speedFactor) * 0.15;
        // Direct scroll position maps to rotation
        logoGroupRef.current.rotation.y = t * 0.1 * speedFactor + scrollPercent * Math.PI * 1.5;
        logoGroupRef.current.rotation.z = Math.sin(t * 0.5 * speedFactor) * 0.05 + scrollPercent * 0.2;
      } else {
        // Zero-gravity drifting
        logoGroupRef.current.position.y = Math.sin(t * 0.8 * speedFactor) * 0.25 + 0.1;
        logoGroupRef.current.rotation.y = t * 0.2 * speedFactor + scrollPercent * Math.PI * 1.5;
        logoGroupRef.current.rotation.x = Math.cos(t * 0.4 * speedFactor) * 0.1 + spinBoost * 0.1;
      }
    }

    // 2. Animate inner energy core pulsation and color morphing
    if (innerCoreRef.current) {
      const pulseRate = (4.0 + scrollVelocity * 20.0) * speedFactor;
      const pulseScale = 1.0 + Math.sin(t * pulseRate) * (0.06 + scrollVelocity * 0.1);
      innerCoreRef.current.scale.set(pulseScale, pulseScale, pulseScale);
      
      const mat = innerCoreRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 2.0 + brightnessBoost;
        // Lerp color waves smoothly
        mat.color.lerp(new THREE.Color(coreHeat), 0.08);
        mat.emissive.lerp(new THREE.Color(coreHeat), 0.08);
      }
    }

    // 3. Spinning outer structural cage
    if (cageRef.current) {
      cageRef.current.rotation.y = -t * 0.15 * speedFactor - spinBoost * 0.3;
      cageRef.current.rotation.x = t * 0.05 * speedFactor + spinBoost * 0.1;
    }

    // 4. Orbiting energy rings (Cyan, Magenta, Green)
    if (ringCyanRef.current) {
      ringCyanRef.current.rotation.x = t * 0.8 * speedFactor + spinBoost * 1.2;
      ringCyanRef.current.rotation.y = t * 0.3 * speedFactor + scrollPercent * 2;
      const mat = ringCyanRef.current.material as THREE.MeshStandardMaterial;
      if (mat) mat.emissiveIntensity = 2.5 + brightnessBoost;
    }
    if (ringMagentaRef.current) {
      ringMagentaRef.current.rotation.y = -t * 0.6 * speedFactor - spinBoost * 1.0;
      ringMagentaRef.current.rotation.z = t * 0.4 * speedFactor + scrollPercent * 1.5;
      const mat = ringMagentaRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 2.5 + brightnessBoost;
        // Lerp the customizable temperature color band
        mat.color.lerp(new THREE.Color(coreHeat), 0.08);
        mat.emissive.lerp(new THREE.Color(coreHeat), 0.08);
      }
    }
    if (ringGreenRef.current) {
      ringGreenRef.current.rotation.z = t * 0.5 * speedFactor + spinBoost * 0.8;
      ringGreenRef.current.rotation.x = -t * 0.4 * speedFactor + scrollPercent * 2.5;
      const mat = ringGreenRef.current.material as THREE.MeshStandardMaterial;
      if (mat) mat.emissiveIntensity = 2.0 + brightnessBoost * 0.5;
    }

    // 5. Dynamic particle size scaling based on entropy prop
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      if (mat) {
        mat.size = THREE.MathUtils.lerp(mat.size, 0.045 * coreEntropy, 0.08);
      }
    }
  });

  return (
    <group ref={logoGroupRef}>
      {/* Central Pulsating Energy Sphere */}
      <mesh ref={innerCoreRef} castShadow receiveShadow>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial
          color="#FF007F"
          emissive="#FF007F"
          emissiveIntensity={2.0}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
 
      {/* Futuristic Structural Cage: Chrome wireframe sphere */}
      <mesh ref={cageRef} castShadow receiveShadow>
        <sphereGeometry args={[1.1, 12, 12]} />
        <meshPhysicalMaterial
          color="#0d0d12"
          metalness={1.0}
          roughness={0.05}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          reflectivity={1.0}
          wireframe={true}
        />
      </mesh>
 
      {/* Interlocking Solid Metallic Torus */}
      <mesh castShadow receiveShadow rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[0.85, 0.06, 16, 80]} />
        <meshPhysicalMaterial
          color="#161622"
          metalness={1.0}
          roughness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          reflectivity={1.0}
        />
      </mesh>
 
      {/* Orbiting Energy Ring 1: Electric Cyan */}
      <mesh ref={ringCyanRef} castShadow>
        <torusGeometry args={[1.35, 0.018, 8, 64]} />
        <meshStandardMaterial
          color="#00F0FF"
          emissive="#00F0FF"
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>
 
      {/* Orbiting Energy Ring 2: Cyber Magenta */}
      <mesh ref={ringMagentaRef} castShadow rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.55, 0.018, 8, 64]} />
        <meshStandardMaterial
          color="#FF007F"
          emissive="#FF007F"
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>
 
      {/* Orbiting Energy Ring 3: Bio Green */}
      <mesh ref={ringGreenRef} castShadow rotation={[0, Math.PI / 3, 0]}>
        <torusGeometry args={[1.75, 0.018, 8, 64]} />
        <meshStandardMaterial
          color="#00FF66"
          emissive="#00FF66"
          emissiveIntensity={2.0}
          toneMapped={false}
        />
      </mesh>
 
      {/* Core Plasma Particle Cloud */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#00F0FF"
          size={0.045}
          sizeAttenuation={true}
          transparent={true}
          opacity={0.8}
        />
      </points>
    </group>
  );
}
