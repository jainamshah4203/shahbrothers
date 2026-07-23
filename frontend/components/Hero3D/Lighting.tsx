"use client";

import { ContactShadows, Environment } from "@react-three/drei";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";

/**
 * Cinematic morning atelier lighting — warm key, soft fill, rim, contact shadows.
 */
export default function Lighting() {
  const { tier } = useDeviceCapability();
  const isLowEnd = tier === "low";
  const isHigh = tier === "high";

  return (
    <>
      {/* Soft ambient bounce — warm off-white atmosphere */}
      <ambientLight intensity={0.35} color="#FFFDF9" />

      {/* 8:30 AM warm key */}
      <directionalLight
        position={[7.5, 8, 4]}
        intensity={2.4}
        color="#FFE8C8"
        castShadow={!isLowEnd}
        shadow-mapSize-width={isHigh ? 2048 : 1024}
        shadow-mapSize-height={isHigh ? 2048 : 1024}
        shadow-camera-near={0.5}
        shadow-camera-far={28}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.00015}
      />

      {/* Soft cool fill */}
      <directionalLight
        position={[-5, 3.5, 3]}
        intensity={0.55}
        color="#D8E4F0"
        castShadow={false}
      />

      {/* Rim — separates objects from warm background */}
      <spotLight
        position={[-3.5, 5, -6]}
        intensity={2.2}
        angle={0.55}
        penumbra={0.85}
        color="#FFF8F0"
        castShadow={false}
        distance={18}
        decay={2}
      />

      {/* Subtle desk bounce */}
      <hemisphereLight
        color="#FFFDF9"
        groundColor="#694121"
        intensity={0.28}
      />

      {!isLowEnd && (
        <ContactShadows
          position={[0, -0.01, -0.4]}
          opacity={0.38}
          scale={14}
          blur={2.4}
          far={6}
          color="#1A1A1A"
          frames={1}
        />
      )}

      {!isLowEnd && <Environment preset="apartment" environmentIntensity={0.45} />}
    </>
  );
}
