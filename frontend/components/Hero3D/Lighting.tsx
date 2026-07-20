"use client";

import { Environment } from "@react-three/drei";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";

/**
 * Lighting setup for the 3D hero scene.
 * 8:30 AM morning sunlight. Warm key, cool fill, subtle rim, ambient bounce, volumetric feel.
 */
export default function Lighting() {
  const { tier } = useDeviceCapability();
  const isLowEnd = tier === "low";

  return (
    <>
      {/* Ambient Bounce */}
      <ambientLight intensity={0.4} color="#ffffff" />
      
      {/* 8:30 AM Warm Key Light */}
      <directionalLight
        position={[8, 5, 4]}
        intensity={3}
        color="#ffe8c4"
        castShadow={!isLowEnd}
        shadow-mapSize-width={isLowEnd ? 512 : 2048}
        shadow-mapSize-height={isLowEnd ? 512 : 2048}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />

      {/* Cool Fill Light */}
      <directionalLight
        position={[-5, 3, 5]}
        intensity={1.2}
        color="#a0c8e0"
        castShadow={false}
      />

      {/* Subtle Rim Light */}
      <spotLight
        position={[-4, 4, -8]}
        intensity={4}
        angle={0.6}
        penumbra={1}
        color="#ffffff"
        castShadow={!isLowEnd}
      />

      {!isLowEnd && (
        <Environment preset="city" blur={0.6} />
      )}
    </>
  );
}
