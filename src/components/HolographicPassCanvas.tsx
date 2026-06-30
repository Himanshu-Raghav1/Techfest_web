"use client";

import { Canvas } from "@react-three/fiber";
import HolographicCard from "./HolographicCard";

export default function HolographicPassCanvas() {
  return (
    <div className="w-full h-[400px] flex items-center justify-center relative cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.4} />
        
        {/* Spot light to add a brilliant specular highlight on the holographic surface */}
        <spotLight
          position={[0, 5, 5]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          castShadow
        />
        
        {/* Soft colored fill lights */}
        <pointLight position={[-3, 2, 1]} intensity={1.5} color="#FF003C" />
        <pointLight position={[3, -2, 1]} intensity={1.5} color="#00A2FF" />

        <HolographicCard />
      </Canvas>
    </div>
  );
}
