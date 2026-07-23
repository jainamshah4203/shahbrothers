"use client";

import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Lighting from "./Lighting";
import DeskScene from "./DeskScene";
import Particles from "./Particles";
import CameraController from "./CameraController";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";

interface SceneProps {
  scrollProgress: number;
}

function SceneDisposer() {
  const { gl, scene } = useThree();

  useEffect(() => {
    return () => {
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose();
        }
      });
      gl.dispose();
    };
  }, [gl, scene]);

  return null;
}

/**
 * R3F canvas for the Hero desk scene.
 * Adaptive DPR / shadows by device tier; warm off-white clear color.
 */
export default function Scene({ scrollProgress }: SceneProps) {
  const { tier, isMobile, hasWebGL2 } = useDeviceCapability();

  if (isMobile || !hasWebGL2 || tier === "low") return null;

  const dpr: [number, number] = tier === "high" ? [1, 2] : [1, 1.5];
  const useShadows = tier === "high" || tier === "medium";

  return (
    <Canvas
      className="h-full w-full"
      shadows={useShadows}
      dpr={dpr}
      gl={{
        antialias: tier === "high",
        powerPreference: "high-performance",
        alpha: false,
        toneMappingExposure: 1.05,
      }}
      camera={{ position: [3.2, 5.4, 10.2], fov: 46, near: 0.1, far: 60 }}
    >
      <color attach="background" args={["#FAF9F5"]} />
      <Suspense fallback={null}>
        <Lighting />
        <DeskScene scrollProgress={scrollProgress} />
        <Particles />
        <CameraController scrollProgress={scrollProgress} />
        <SceneDisposer />
      </Suspense>
    </Canvas>
  );
}
