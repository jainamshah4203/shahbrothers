"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";

export type MonogramFinish = "gold-foil" | "blind-deboss";

export interface Customizable3DJournalProps {
  /** 1–3 character monogram */
  monogram?: string;
  finish?: MonogramFinish;
  coverColor?: string;
  position?: [number, number, number];
  /** Idle float / presentation spin */
  autoPresent?: boolean;
}

/** Procedural grain used as roughness + bump when no external maps ship. */
function createLeatherMaps(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < size * size * 0.35; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const v = 90 + Math.random() * 70;
    ctx.fillStyle = `rgb(${v},${v - 4},${v - 8})`;
    ctx.fillRect(x, y, 1.2, 1.2);
  }

  const roughness = new THREE.CanvasTexture(canvas);
  roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping;
  roughness.repeat.set(2.4, 2.4);
  roughness.colorSpace = THREE.NoColorSpace;
  roughness.needsUpdate = true;

  const bump = roughness.clone();
  bump.needsUpdate = true;

  return { roughness, bump };
}

/**
 * Customizable hardbound journal with gold-foil or blind-deboss monogram.
 */
export default function Customizable3DJournal({
  monogram = "SB",
  finish = "gold-foil",
  coverColor = "#2A1C15",
  position = [0, 0.04, 0],
  autoPresent = true,
}: Customizable3DJournalProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [maps, setMaps] = useState<{
    roughness: THREE.CanvasTexture;
    bump: THREE.CanvasTexture;
  } | null>(null);

  useEffect(() => {
    const next = createLeatherMaps();
    setMaps(next);
    return () => {
      next.roughness.dispose();
      next.bump.dispose();
    };
  }, []);

  const isGold = finish === "gold-foil";

  const monogramMaterial = useMemo(() => {
    if (isGold) {
      return {
        color: "#D4AF37",
        metalness: 0.95,
        roughness: 0.15,
        bumpScale: 0.004,
      };
    }
    // Blind deboss: match cover, invert bump for pressed-in impression
    return {
      color: coverColor,
      metalness: 0.02,
      roughness: 0.88,
      bumpScale: -0.035,
    };
  }, [isGold, coverColor]);

  useFrame((state) => {
    if (!autoPresent || !groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      Math.sin(t * 0.25) * 0.12,
      0.04
    );
    groupRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.008;
  });

  const label = monogram.slice(0, 3).toUpperCase();

  return (
    <group ref={groupRef} position={position} rotation={[0, -0.35, 0]}>
      {/* Cover board — leather / textured paper grain */}
      <RoundedBox
        args={[1.35, 0.08, 1.85]}
        radius={0.02}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={coverColor}
          roughness={0.82}
          metalness={0.04}
          roughnessMap={maps?.roughness}
          bumpMap={maps?.bump}
          bumpScale={isGold ? 0.018 : 0.022}
        />
      </RoundedBox>

      {/* Page block */}
      <mesh position={[0.02, 0.055, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.22, 0.055, 1.72]} />
        <meshStandardMaterial color="#FAF9F5" roughness={0.92} metalness={0} />
      </mesh>

      {/* Spine accent */}
      <mesh position={[-0.64, 0.02, 0]} castShadow>
        <boxGeometry args={[0.06, 0.1, 1.85]} />
        <meshStandardMaterial
          color={coverColor}
          roughness={0.75}
          metalness={0.06}
          bumpMap={maps?.bump}
          bumpScale={isGold ? 0.012 : 0.02}
        />
      </mesh>

      {/* Monogram decal layer — slightly proud of the cover */}
      <group position={[0, 0.046, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <Text
          fontSize={0.22}
          letterSpacing={0.08}
          anchorX="center"
          anchorY="middle"
          depthOffset={-1}
        >
          {label}
          <meshStandardMaterial
            color={monogramMaterial.color}
            metalness={monogramMaterial.metalness}
            roughness={monogramMaterial.roughness}
            bumpMap={maps?.bump}
            bumpScale={monogramMaterial.bumpScale}
            toneMapped
          />
        </Text>

        {/* Thin plate under type for foil / deboss silhouette */}
        <mesh position={[0, 0, -0.001]} renderOrder={-1}>
          <planeGeometry args={[0.55, 0.32]} />
          <meshStandardMaterial
            color={monogramMaterial.color}
            metalness={monogramMaterial.metalness}
            roughness={isGold ? 0.2 : 0.9}
            transparent
            opacity={isGold ? 0.18 : 0.35}
            bumpMap={maps?.bump}
            bumpScale={isGold ? 0.002 : -0.04}
          />
        </mesh>
      </group>
    </group>
  );
}
