"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Custom Holographic Shader definition
const HolographicShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#00A2FF") },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uTextTexture: { value: null as THREE.Texture | null },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform sampler2D uTextTexture;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Fresnel reflection strength based on looking angle
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
      
      // Dynamic iridescent colors shifting across time and space
      float r = abs(sin(vUv.x * 3.5 + uTime * 0.8 + uMouse.x * 2.0));
      float g = abs(sin(vUv.y * 2.5 + uTime * 1.1 + uMouse.y * 2.0));
      float b = abs(cos((vUv.x + vUv.y) * 2.0 + uTime * 0.6));
      vec3 holoColor = vec3(r, g, b);
      
      // Deep cyber base dark obsidian glass color
      vec3 baseColor = vec3(0.03, 0.04, 0.09);
      
      // Mix glass background with holographic iridescence
      vec3 color = mix(baseColor, holoColor, fresnel * 0.7 + 0.12);
      
      // Add glowing neon borders (Red, Blue, Yellow, Green shifting)
      float borderRed = step(0.98, vUv.x) + step(vUv.x, 0.02);
      float borderBlue = step(0.97, vUv.y) + step(vUv.y, 0.03);
      if (borderRed > 0.1 || borderBlue > 0.1) {
        vec3 borderColor = mix(vec3(0.0, 0.6, 1.0), vec3(1.0, 0.0, 0.4), sin(uTime) * 0.5 + 0.5);
        color += borderColor * 0.8;
      }
      
      // Golden Cyber Chip
      if (vUv.x > 0.12 && vUv.x < 0.26 && vUv.y > 0.38 && vUv.y < 0.62) {
        float gridX = step(0.05, abs(sin(vUv.x * 120.0)));
        float gridY = step(0.05, abs(sin(vUv.y * 120.0)));
        vec3 chipColor = mix(vec3(0.9, 0.6, 0.1), vec3(1.0, 0.85, 0.2), sin(uTime * 2.0) * 0.2 + 0.8);
        color = mix(color, chipColor, gridX * gridY * 0.8);
      }
      
      // Futuristic Neon green Barcode
      if (vUv.x > 0.78 && vUv.x < 0.88 && vUv.y > 0.25 && vUv.y < 0.75) {
        float stripes = step(0.5, sin(vUv.y * 70.0 + cos(vUv.y * 20.0)));
        color = mix(color, vec3(0.0, 1.0, 0.4), stripes * 0.7);
      }
      
      // Subtly print VIP text using coordinate check (simplified block shape)
      if (vUv.x > 0.45 && vUv.x < 0.6 && vUv.y > 0.4 && vUv.y < 0.6) {
        // Overlay a glowing cyber yellow text area
        color += vec3(1.0, 0.9, 0.0) * 0.15;
      }

      // Add a subtle diagonal light sweep across the card
      float sweep = step(0.98, 1.0 - abs(sin(vUv.x - vUv.y + uTime * 0.7)));
      color += vec3(1.0) * sweep * 0.25;

      // Sample and blend the dynamic text canvas overlay
      vec4 textSample = texture2D(uTextTexture, vUv);
      if (textSample.a > 0.05) {
        color = mix(color, textSample.rgb, textSample.a);
      }

      gl_FragColor = vec4(color, 0.92);
    }
  `,
};

interface HolographicCardProps {
  name?: string;
  email?: string;
  role?: string;
  registered?: boolean;
}

export default function HolographicCard({ name = "", email = "", role = "Developer", registered = false }: HolographicCardProps) {
  const cardRef = useRef<THREE.Mesh>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  // Track target rotation based on cursor
  const [targetRot, setTargetRot] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);



  // Instantiates a dynamic 2D canvas context for real-time ticket detail rendering
  const canvasTexture = useMemo(() => {
    if (typeof window === "undefined") return null;

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext("2d");
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    return { canvas, ctx, texture };
  }, []);

  // Live-draw details on canvas texture when registration values update
  useEffect(() => {
    if (!canvasTexture) return;
    const { canvas, ctx, texture } = canvasTexture;
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Neon grid borders
    ctx.strokeStyle = "rgba(0, 240, 255, 0.35)";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    ctx.strokeStyle = "rgba(255, 0, 127, 0.15)";
    ctx.lineWidth = 1;
    for (let i = 25; i < canvas.height; i += 25) {
      ctx.beginPath();
      ctx.moveTo(10, i);
      ctx.lineTo(canvas.width - 10, i);
      ctx.stroke();
    }

    // Pass header
    ctx.fillStyle = "#00F0FF";
    ctx.font = "bold 20px monospace";
    ctx.fillText("NEXUS TECHFEST 2026", 35, 48);

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "bold 9px monospace";
    ctx.fillText("SECURITY MODULE // ACCESS: GEN_TICKET_IRID", 35, 68);

    // Thin accent separating line
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(35, 85, canvas.width - 70, 2);

    if (registered && name) {
      // Operator Name
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 16px monospace";
      ctx.fillText(`OPERATOR: ${name.toUpperCase()}`, 35, 125);

      // Specialized division
      ctx.fillStyle = "#FF007F";
      ctx.font = "bold 12px monospace";
      ctx.fillText(`DIVISION: ${role.toUpperCase()}`, 35, 160);

      // Email ref
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "11px monospace";
      ctx.fillText(`COMMS REF: ${email}`, 35, 195);

      // Unique token key
      const sumCode = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const code = `NEX-${((sumCode * 4127) % 900000) + 100000}`;
      ctx.fillStyle = "#00FF66";
      ctx.font = "bold 13px monospace";
      ctx.fillText(`TOKEN KEY: ${code}`, 35, 235);

      // Holographic Verification badge
      ctx.fillStyle = "rgba(0, 255, 102, 0.12)";
      ctx.strokeStyle = "rgba(0, 255, 102, 0.4)";
      ctx.lineWidth = 1;
      ctx.fillRect(canvas.width - 125, 30, 85, 24);
      ctx.strokeRect(canvas.width - 125, 30, 85, 24);

      ctx.fillStyle = "#00FF66";
      ctx.font = "bold 9px monospace";
      ctx.fillText("VERIFIED", canvas.width - 110, 45);
    } else {
      // Placeholder data
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.font = "bold 15px monospace";
      ctx.fillText("WAITING FOR DATA INPUT...", 35, 135);

      ctx.font = "11px monospace";
      ctx.fillText("COMPLETE REGISTRATION FORM TO INITIALIZE HOLO-CHIP", 35, 165);
    }

    texture.needsUpdate = true;
  }, [name, email, role, registered, canvasTexture]);

  // Update uniform values & handle rotation lerp on every frame
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = t;
      shaderRef.current.uniforms.uMouse.value.lerp(
        new THREE.Vector2(targetRot.y * 2, targetRot.x * 2),
        0.05
      );
      if (canvasTexture) {
        shaderRef.current.uniforms.uTextTexture.value = canvasTexture.texture;
      }
    }

    if (cardRef.current) {
      // Lerp rotation coordinates for smooth cinematic responsiveness
      cardRef.current.rotation.x = THREE.MathUtils.lerp(
        cardRef.current.rotation.x,
        targetRot.x,
        0.1
      );
      cardRef.current.rotation.y = THREE.MathUtils.lerp(
        cardRef.current.rotation.y,
        targetRot.y,
        0.1
      );
      
      // Default breathing animation when not hovered
      if (!isHovered) {
        cardRef.current.position.y = Math.sin(t * 1.5) * 0.1;
        cardRef.current.rotation.y = Math.sin(t * 0.8) * 0.15;
        cardRef.current.rotation.x = Math.cos(t * 0.5) * 0.08;
      } else {
        cardRef.current.position.y = THREE.MathUtils.lerp(
          cardRef.current.position.y,
          0,
          0.1
        );
      }
    }
  });

  const handlePointerMove = (e: any) => {
    e.stopPropagation();
    setIsHovered(true);
    
    // Normalized cursor position relative to the element (from -1 to 1)
    const x = e.pointer.x; // -1 (left) to 1 (right)
    const y = e.pointer.y; // -1 (bottom) to 1 (top)

    // Calculate rotation: max 30 degrees (approx 0.5 rad)
    // Tilt X-axis is controlled by Y cursor position, Y-axis is controlled by X cursor position
    setTargetRot({
      x: -y * 0.5,
      y: x * 0.5,
    });
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setTargetRot({ x: 0, y: 0 });
  };

  return (
    <mesh
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      castShadow
      receiveShadow
    >
      {/* 3D Rectangular Pass Geometry: thin credit card dimensions */}
      <boxGeometry args={[3.2, 2.0, 0.08]} />
      
      <shaderMaterial
        ref={shaderRef}
        args={[HolographicShader]}
        transparent={true}
        depthWrite={true}
      />
    </mesh>
  );
}
