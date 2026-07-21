"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";
import Interactive3DPen from "@/components/stationery-3d/Interactive3DPen";

/**
 * Mouse-lerped isometric studio — background matches homepage #FAF9F5.
 */
function MouseParallaxGroup({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!group.current) return;
    target.current.x = state.pointer.x * 0.35;
    target.current.y = state.pointer.y * 0.2;
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      target.current.x,
      0.06
    );
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      -0.15 + target.current.y * 0.15,
      0.06
    );
  });

  return <group ref={group}>{children}</group>;
}

export default function Hero3DCanvas() {
  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, 2]}
      shadows="soft"
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMappingExposure: 1.05,
      }}
      camera={{ position: [2.1, 1.45, 2.8], fov: 32, near: 0.1, far: 50 }}
    >
      {/* Match homepage Warm Off-White */}
      <color attach="background" args={["#FAF9F5"]} />
      <ambientLight color="#FFFDF9" intensity={0.7} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.2}
        color="#FFE8C8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
      />
      <directionalLight
        position={[-3, 2, -2]}
        intensity={0.32}
        color="#F5EDE3"
      />

      <MouseParallaxGroup>
        <Interactive3DPen position={[0, 0.05, 0]} useProcedural />
      </MouseParallaxGroup>

      <ContactShadows
        position={[0, -0.35, 0]}
        opacity={0.28}
        scale={8}
        blur={2.6}
        far={4}
        color="#1A1A1A"
      />
      <Environment preset="apartment" />
    </Canvas>
  );
}
