"use client";

import { Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
} from "@react-three/drei";
import { cn } from "@/lib/utils";

export interface StationeryCanvasProps {
  children: ReactNode;
  className?: string;
  /** Camera position — architectural ¾ view by default */
  cameraPosition?: [number, number, number];
  /** Disable orbit when embedding a locked product shot */
  enableOrbit?: boolean;
  /** Show contact shadows under the product */
  showContactShadows?: boolean;
}

/**
 * Shared R3F canvas for luxury stationery product previews.
 * fov 35 · soft shadows · warm studio lighting · dpr capped.
 */
export default function StationeryCanvas({
  children,
  className,
  cameraPosition = [2.4, 1.6, 3.2],
  enableOrbit = true,
  showContactShadows = true,
}: StationeryCanvasProps) {
  return (
    <div className={cn("relative h-full w-full min-h-[320px] bg-cream", className)}>
      <Canvas
        shadows="soft"
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
          toneMappingExposure: 1.05,
        }}
        camera={{
          position: cameraPosition,
          fov: 35,
          near: 0.1,
          far: 100,
        }}
      >
        {/* Warm ambient — paper-white bounce */}
        <ambientLight color="#FFFDF9" intensity={0.6} />

        {/* Key — afternoon window light, soft shadows */}
        <directionalLight
          position={[4.5, 6.5, 3.2]}
          intensity={1.35}
          color="#FFE8C8"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={28}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-bias={-0.00015}
          shadow-radius={8}
        />

        {/* Fill — softens underside without killing form */}
        <directionalLight
          position={[-3.5, 2.5, -1.5]}
          intensity={0.35}
          color="#F5EDE3"
          castShadow={false}
        />

        {/* Subtle rim for metal clips / foil */}
        <directionalLight
          position={[-2, 3, -4]}
          intensity={0.25}
          color="#FFF8F0"
          castShadow={false}
        />

        <Suspense fallback={null}>
          <Environment preset="city" />
          {children}
        </Suspense>

        {showContactShadows && (
          <ContactShadows
            position={[0, -0.001, 0]}
            opacity={0.35}
            scale={12}
            blur={2.4}
            far={4}
            color="#1A1A1A"
          />
        )}

        {enableOrbit && (
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.06}
            enablePan={false}
            minDistance={1.4}
            maxDistance={7}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2.2}
            target={[0, 0.15, 0]}
          />
        )}
      </Canvas>
    </div>
  );
}
