"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DebrisFieldProps {
  gravityOn: boolean;
}

interface Particle {
  id: number;
  basePos: THREE.Vector3;
  scatterPos: THREE.Vector3;
  velocity: THREE.Vector3;
  rotVelocity: THREE.Vector3;
  scale: number;
  geometryType: "box" | "cone" | "torus" | "sphere";
  color: string;
  seed: number;
}

const PARTICLE_COUNT = 45;
const GDG_COLORS = ["#FF003C", "#00A2FF", "#FFE600", "#00FF66"];

export default function DebrisField({ gravityOn }: DebrisFieldProps) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Initialize particles once
  const particles = useMemo(() => {
    const list: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const seed = Math.random();
      
      // Orderly baseline position: arranged in a flat ring beneath the logo
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
      const radius = 1.3 + Math.random() * 0.8;
      const bx = Math.cos(angle) * radius;
      const by = -1.8 + (Math.random() - 0.5) * 0.2; // orderly baseline Y
      const bz = Math.sin(angle) * radius;
      const basePos = new THREE.Vector3(bx, by, bz);

      // Scattered position: random position spread out in space
      const sx = (Math.random() - 0.5) * 6;
      const sy = 0.5 + Math.random() * 3.5; // scatter upwards
      const sz = (Math.random() - 0.5) * 6;
      const scatterPos = new THREE.Vector3(sx, sy, sz);

      // Drift velocity in zero gravity
      const vx = (Math.random() - 0.5) * 0.15;
      const vy = 0.1 + Math.random() * 0.25; // drift upwards
      const vz = (Math.random() - 0.5) * 0.15;
      const velocity = new THREE.Vector3(vx, vy, vz);

      // Drift rotation velocity
      const rx = (Math.random() - 0.5) * 1.5;
      const ry = (Math.random() - 0.5) * 1.5;
      const rz = (Math.random() - 0.5) * 1.5;
      const rotVelocity = new THREE.Vector3(rx, ry, rz);

      // Random geometry and scale
      const rGeom = Math.random();
      let geometryType: "box" | "cone" | "torus" | "sphere" = "box";
      if (rGeom < 0.25) geometryType = "cone";
      else if (rGeom < 0.5) geometryType = "torus";
      else if (rGeom < 0.75) geometryType = "sphere";

      const scale = 0.08 + Math.random() * 0.12;
      const color = GDG_COLORS[Math.floor(Math.random() * GDG_COLORS.length)];

      list.push({
        id: i,
        basePos,
        scatterPos,
        velocity,
        rotVelocity,
        scale,
        geometryType,
        color,
        seed,
      });
    }
    return list;
  }, []);

  useFrame((state, delta) => {
    // Clamp delta to prevent massive jumps on tab refocus
    const dt = Math.min(delta, 0.1);
    const t = state.clock.getElapsedTime();

    particles.forEach((p, idx) => {
      const mesh = meshRefs.current[idx];
      if (!mesh) return;

      if (gravityOn) {
        // Gravity ON: Lerp particles back to their orderly baseline positions
        // Add a gentle floating wave to each particle so it doesn't look completely frozen
        const floatOffset = Math.sin(t * 1.5 + p.seed * 10) * 0.04;
        const targetPos = p.basePos.clone();
        targetPos.y += floatOffset;

        mesh.position.lerp(targetPos, 0.08); // smooth return
        
        // Reset rotation back to a relaxed base state
        const targetRot = new THREE.Euler(0, t * 0.2 + p.seed * 5, 0);
        const currentQuaternion = mesh.quaternion;
        const targetQuaternion = new THREE.Quaternion().setFromEuler(targetRot);
        currentQuaternion.slerp(targetQuaternion, 0.08);
      } else {
        // Gravity OFF: Drift particles upwards and outwards
        // Update the scatter target position slowly based on its drift velocity
        p.scatterPos.addScaledVector(p.velocity, dt);

        // If particle drifts too high, wrap it back down
        if (p.scatterPos.y > 4.5) {
          p.scatterPos.y = -1.2;
          p.scatterPos.x = (Math.random() - 0.5) * 5;
          p.scatterPos.z = (Math.random() - 0.5) * 5;
        }

        // Lerp mesh position to the active drifting scatterPos
        mesh.position.lerp(p.scatterPos, 0.05);

        // Apply constant spin
        mesh.rotation.x += p.rotVelocity.x * dt * 0.5;
        mesh.rotation.y += p.rotVelocity.y * dt * 0.5;
        mesh.rotation.z += p.rotVelocity.z * dt * 0.5;
      }
    });
  });

  return (
    <group>
      {particles.map((p, idx) => {
        return (
          <mesh
            key={p.id}
            ref={(el) => {
              meshRefs.current[idx] = el;
            }}
            scale={[p.scale, p.scale, p.scale]}
            castShadow
            receiveShadow
          >
            {p.geometryType === "box" && <boxGeometry args={[1, 1, 1]} />}
            {p.geometryType === "cone" && <coneGeometry args={[0.7, 1.2, 4]} />}
            {p.geometryType === "torus" && <torusGeometry args={[0.6, 0.2, 8, 24]} />}
            {p.geometryType === "sphere" && <sphereGeometry args={[0.6, 16, 16]} />}

            <meshPhysicalMaterial
              color={p.color}
              metalness={0.9}
              roughness={0.15}
              clearcoat={1.0}
              clearcoatRoughness={0.1}
              emissive={p.color}
              emissiveIntensity={0.6}
            />
          </mesh>
        );
      })}
    </group>
  );
}
