"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";

/**
 * Procedural ambient particles floating around the scene.
 * Dust fibers and coffee steam.
 */
export default function Particles() {
  const dustRef = useRef<THREE.Points>(null);
  const steamRef = useRef<THREE.Points>(null);
  const { tier } = useDeviceCapability();

  const dustCount = tier === "low" ? 50 : tier === "medium" ? 150 : 300;
  const steamCount = tier === "low" ? 15 : 40;

  // Dust fibers
  const [dustPos, dustVel] = useMemo(() => {
    const pos = new Float32Array(dustCount * 3);
    const vel = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 15;
      pos[i3 + 1] = (Math.random() - 0.5) * 8 + 2;
      pos[i3 + 2] = (Math.random() - 0.5) * 10;

      vel[i3] = (Math.random() - 0.5) * 0.015;
      vel[i3 + 1] = Math.random() * 0.01 + 0.005;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.015;
    }

    return [pos, vel];
  }, [dustCount]);

  // Coffee Steam
  const [steamPos, steamVel, steamAges] = useMemo(() => {
    const pos = new Float32Array(steamCount * 3);
    const vel = new Float32Array(steamCount * 3);
    const ages = new Float32Array(steamCount);

    for (let i = 0; i < steamCount; i++) {
      const i3 = i * 3;
      // Positioned near the middleground coffee mug
      pos[i3] = (Math.random() - 0.5) * 0.3 + 1.2; // X
      pos[i3 + 1] = Math.random() * 1.5 + 0.2; // Y
      pos[i3 + 2] = (Math.random() - 0.5) * 0.3 - 0.8; // Z

      vel[i3] = (Math.random() - 0.5) * 0.02;
      vel[i3 + 1] = Math.random() * 0.03 + 0.02;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.02;
      
      ages[i] = Math.random() * 3;
    }

    return [pos, vel, ages];
  }, [steamCount]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    if (dustRef.current) {
      const positions = dustRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < dustCount; i++) {
        const i3 = i * 3;
        positions[i3] += dustVel[i3] * delta * 60;
        positions[i3 + 1] += dustVel[i3 + 1] * delta * 60;
        positions[i3 + 2] += dustVel[i3 + 2] * delta * 60;

        // Subtle wobble
        positions[i3] += Math.sin(time + i) * 0.001;

        if (positions[i3 + 1] > 8) {
          positions[i3 + 1] = -2;
          positions[i3] = (Math.random() - 0.5) * 15;
          positions[i3 + 2] = (Math.random() - 0.5) * 10;
        }
      }
      dustRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (steamRef.current) {
      const positions = steamRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < steamCount; i++) {
        const i3 = i * 3;
        positions[i3] += steamVel[i3] * delta * 60;
        positions[i3 + 1] += steamVel[i3 + 1] * delta * 60;
        positions[i3 + 2] += steamVel[i3 + 2] * delta * 60;

        positions[i3] += Math.sin(time * 2 + i) * 0.003;
        
        steamAges[i] += delta;
        if (steamAges[i] > 3) {
          steamAges[i] = 0;
          positions[i3] = (Math.random() - 0.5) * 0.3 + 1.2;
          positions[i3 + 1] = 0.2;
          positions[i3 + 2] = (Math.random() - 0.5) * 0.3 - 0.8;
        }
      }
      steamRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustPos, 3]} count={dustCount} />
        </bufferGeometry>
        <pointsMaterial size={0.03} color="#ffffff" transparent opacity={0.3} sizeAttenuation depthWrite={false} />
      </points>
      <points ref={steamRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[steamPos, 3]} count={steamCount} />
        </bufferGeometry>
        <pointsMaterial size={0.4} color="#f0f0f0" transparent opacity={0.12} sizeAttenuation depthWrite={false} />
      </points>
    </>
  );
}
