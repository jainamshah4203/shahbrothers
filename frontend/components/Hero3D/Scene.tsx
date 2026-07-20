"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Lighting from "./Lighting";
import DeskScene from "./DeskScene";
import Particles from "./Particles";
import CameraController from "./CameraController";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";

interface SceneProps {
  scrollProgress: number;
}

/**
 * 3D Canvas wrapper for the Hero section.
 * Sets up adaptive performance settings and manages the scene graph.
 */
export default function Scene({ scrollProgress }: SceneProps) {
  const { tier, isMobile } = useDeviceCapability();
  
  // Adaptive quality settings
  const dpr: [number, number] = tier === "high" ? [1, 2] : [1, 1.5];
  const useShadows = tier !== "low";

  // If mobile, we don't render the 3D canvas (fallback is used in parent)
  if (isMobile) return null;

  return (
    <Canvas
      shadows={useShadows}
      dpr={dpr}
      gl={{ 
        antialias: tier !== "low",
        powerPreference: "high-performance",
        alpha: true 
      }}
      camera={{ position: [0, 4, 10], fov: 45 }}
    >
      <Suspense fallback={null}>
        <Lighting />
        <DeskScene scrollProgress={scrollProgress} />
        <Particles />
        <CameraController scrollProgress={scrollProgress} />
      </Suspense>
    </Canvas>
  );
}
