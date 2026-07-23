"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";

/**
 * Restrained atmosphere — sparse dust motes + soft mug steam.
 * Intentionally not a particle zoo.
 */
export default function Particles() {
  const dustRef = useRef<THREE.Points>(null);
  const steamRef = useRef<THREE.Points>(null);
  const { tier } = useDeviceCapability();

  const dustCount = tier === "high" ? 80 : tier === "medium" ? 40 : 0;
  const steamCount = tier === "high" ? 24 : tier === "medium" ? 12 : 0;

  const [dustPos, dustVel] = useMemo(() => {
    const pos = new Float32Array(Math.max(dustCount, 1) * 3);
    const vel = new Float32Array(Math.max(dustCount, 1) * 3);
    for (let i = 0; i < dustCount; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 12;
      pos[i3 + 1] = Math.random() * 5 + 0.5;
      pos[i3 + 2] = (Math.random() - 0.5) * 8;
      vel[i3] = (Math.random() - 0.5) * 0.008;
      vel[i3 + 1] = Math.random() * 0.006 + 0.002;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.008;
    }
    return [pos, vel];
  }, [dustCount]);

  const [steamPos, steamVel, steamAges] = useMemo(() => {
    const pos = new Float32Array(Math.max(steamCount, 1) * 3);
    const vel = new Float32Array(Math.max(steamCount, 1) * 3);
    const ages = new Float32Array(Math.max(steamCount, 1));
    for (let i = 0; i < steamCount; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 0.22 + 1.15;
      pos[i3 + 1] = Math.random() * 0.8 + 0.45;
      pos[i3 + 2] = (Math.random() - 0.5) * 0.22 + 0.35;
      vel[i3] = (Math.random() - 0.5) * 0.012;
      vel[i3 + 1] = Math.random() * 0.02 + 0.012;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.012;
      ages[i] = Math.random() * 2.5;
    }
    return [pos, vel, ages];
  }, [steamCount]);

  useEffect(() => {
    return () => {
      dustRef.current?.geometry.dispose();
      steamRef.current?.geometry.dispose();
      const dustMat = dustRef.current?.material;
      const steamMat = steamRef.current?.material;
      if (dustMat && !Array.isArray(dustMat)) dustMat.dispose();
      if (steamMat && !Array.isArray(steamMat)) steamMat.dispose();
    };
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    if (dustRef.current && dustCount > 0) {
      const positions = dustRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < dustCount; i++) {
        const i3 = i * 3;
        positions[i3] += dustVel[i3] * delta * 60;
        positions[i3 + 1] += dustVel[i3 + 1] * delta * 60;
        positions[i3 + 2] += dustVel[i3 + 2] * delta * 60;
        positions[i3] += Math.sin(time * 0.4 + i) * 0.0006;
        if (positions[i3 + 1] > 6) {
          positions[i3 + 1] = 0.3;
          positions[i3] = (Math.random() - 0.5) * 12;
          positions[i3 + 2] = (Math.random() - 0.5) * 8;
        }
      }
      dustRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (steamRef.current && steamCount > 0) {
      const positions = steamRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < steamCount; i++) {
        const i3 = i * 3;
        positions[i3] += steamVel[i3] * delta * 60;
        positions[i3 + 1] += steamVel[i3 + 1] * delta * 60;
        positions[i3 + 2] += steamVel[i3 + 2] * delta * 60;
        positions[i3] += Math.sin(time * 1.6 + i) * 0.002;
        steamAges[i] += delta;
        if (steamAges[i] > 2.5) {
          steamAges[i] = 0;
          positions[i3] = (Math.random() - 0.5) * 0.22 + 1.15;
          positions[i3 + 1] = 0.45;
          positions[i3 + 2] = (Math.random() - 0.5) * 0.22 + 0.35;
        }
      }
      steamRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (dustCount === 0 && steamCount === 0) return null;

  return (
    <>
      {dustCount > 0 && (
        <points ref={dustRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[dustPos, 3]}
              count={dustCount}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.025}
            color="#D4AF37"
            transparent
            opacity={0.18}
            sizeAttenuation
            depthWrite={false}
          />
        </points>
      )}
      {steamCount > 0 && (
        <points ref={steamRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[steamPos, 3]}
              count={steamCount}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.28}
            color="#FAF9F5"
            transparent
            opacity={0.1}
            sizeAttenuation
            depthWrite={false}
          />
        </points>
      )}
    </>
  );
}
