"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DebrisFieldProps {
  gravityOn: boolean;
  scrollPercentRef: React.RefObject<number>;
  scrollVelocityRef: React.RefObject<number>;
  coreSpeed?: number;
  coreEntropy?: number;
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
  phaseOffset: number; // for helical alignment
}

const PARTICLE_COUNT = 45;
const BRAND_COLORS = ["#00F0FF", "#FF007F", "#00FF66"];

export default function DebrisField({
  gravityOn,
  scrollPercentRef,
  scrollVelocityRef,
  coreSpeed = 1.0,
  coreEntropy = 1.0,
}: DebrisFieldProps) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Initialize particles once
  const particles = useMemo(() => {
    const list: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const seed = Math.random();
      const phaseOffset = seed * Math.PI * 2;
      
      // Orderly baseline position: arranged in a vertical cylindrical helix shell around the core
      const angle = (i / PARTICLE_COUNT) * Math.PI * 6 + phaseOffset; // Multi-turn helix
      const radius = 1.4 + Math.random() * 0.7;
      const bx = Math.cos(angle) * radius;
      // Helix height spans from -2.2 to +2.2
      const by = -2.2 + (i / PARTICLE_COUNT) * 4.4 + (Math.random() - 0.5) * 0.3;
      const bz = Math.sin(angle) * radius;
      const basePos = new THREE.Vector3(bx, by, bz);

      // Scattered position: wider random space
      const sx = (Math.random() - 0.5) * 6;
      const sy = 0.5 + Math.random() * 4.5;
      const sz = (Math.random() - 0.5) * 6;
      const scatterPos = new THREE.Vector3(sx, sy, sz);

      // Drift velocity in zero gravity
      const vx = (Math.random() - 0.5) * 0.15;
      const vy = 0.15 + Math.random() * 0.3; // upward drift
      const vz = (Math.random() - 0.5) * 0.15;
      const velocity = new THREE.Vector3(vx, vy, vz);

      // Drift rotation velocity
      const rx = (Math.random() - 0.5) * 2;
      const ry = (Math.random() - 0.5) * 2;
      const rz = (Math.random() - 0.5) * 2;
      const rotVelocity = new THREE.Vector3(rx, ry, rz);

      // Random geometry and scale
      const rGeom = Math.random();
      let geometryType: "box" | "cone" | "torus" | "sphere" = "box";
      if (rGeom < 0.25) geometryType = "cone";
      else if (rGeom < 0.5) geometryType = "torus";
      else if (rGeom < 0.75) geometryType = "sphere";

      const scale = 0.05 + Math.random() * 0.09;
      const color = BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)];

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
        phaseOffset,
      });
    }
    return list;
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const t = state.clock.getElapsedTime();

    const scrollPercent = scrollPercentRef.current;
    const scrollVelocity = scrollVelocityRef.current;

    // Scroll speed velocity increases the flow/drift rate (scaled by coreSpeed)
    const scrollFlowMultiplier = (1.0 + scrollVelocity * 10.0) * coreSpeed;

    particles.forEach((p, idx) => {
      const mesh = meshRefs.current[idx];
      if (!mesh) return;

      if (gravityOn) {
        // Gravity ON: Helical alignment
        // The cylinder baseline translates and rotates slightly based on page scroll progression!
        const scrollAngleOffset = scrollPercent * Math.PI * 1.5;
        const currentAngle = (idx / PARTICLE_COUNT) * Math.PI * 6 + p.phaseOffset + scrollAngleOffset;
        
        // Recompute position to wrap around scroll movement
        const radius = 1.4 + Math.sin(t * 0.5 + p.seed * 5) * 0.1;
        const targetX = Math.cos(currentAngle) * radius;
        // Height shifts upward as we scroll, creating a camera travel flow
        const targetY = p.basePos.y + scrollPercent * 2.0 + Math.sin(t * 1.2 + p.seed * 10) * 0.05;
        const targetZ = Math.sin(currentAngle) * radius;
        const targetPos = new THREE.Vector3(targetX, targetY, targetZ);

        mesh.position.lerp(targetPos, 0.08); // smooth transition

        // Rotate in sync with cylindrical shell rotation
        const targetRot = new THREE.Euler(0, t * 0.3 + p.seed * 5, 0);
        const currentQuaternion = mesh.quaternion;
        const targetQuaternion = new THREE.Quaternion().setFromEuler(targetRot);
        currentQuaternion.slerp(targetQuaternion, 0.08);
      } else {
        // Gravity OFF: Drift upwards rapidly if scrolling
        const activeDriftVelocity = p.velocity.clone().multiplyScalar(scrollFlowMultiplier);
        p.scatterPos.addScaledVector(activeDriftVelocity, dt);

        // Particle height boundary wraps around
        if (p.scatterPos.y > 5.0) {
          p.scatterPos.y = -2.0;
          p.scatterPos.x = (Math.random() - 0.5) * 5;
          p.scatterPos.z = (Math.random() - 0.5) * 5;
        }

        mesh.position.lerp(p.scatterPos, 0.06);

        // Rotation spin matches scroll velocity
        mesh.rotation.x += p.rotVelocity.x * dt * 0.5 * scrollFlowMultiplier;
        mesh.rotation.y += p.rotVelocity.y * dt * 0.5 * scrollFlowMultiplier;
        mesh.rotation.z += p.rotVelocity.z * dt * 0.5 * scrollFlowMultiplier;
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
            scale={[p.scale * coreEntropy, p.scale * coreEntropy, p.scale * coreEntropy]}
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
              emissiveIntensity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}
