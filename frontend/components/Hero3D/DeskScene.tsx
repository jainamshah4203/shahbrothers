"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Cylinder, Box, Torus } from "@react-three/drei";
import * as THREE from "three";

interface DeskSceneProps {
  scrollProgress: number;
}

/**
 * Procedurally generated 3D desk scene using primitive geometries.
 * Recomposed using photography principles (foreground/middleground/background).
 */
export default function DeskScene({ scrollProgress }: DeskSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Materials using MeshPhysicalMaterial exclusively
  const materials = useMemo(() => {
    return {
      desk: new THREE.MeshPhysicalMaterial({ 
        color: "#18181a", roughness: 0.6, metalness: 0.1, clearcoat: 0.3, clearcoatRoughness: 0.4
      }),
      leather: new THREE.MeshPhysicalMaterial({ 
        color: "#2a1c15", roughness: 0.85, metalness: 0.05, clearcoat: 0.2, clearcoatRoughness: 0.6 
      }),
      metal: new THREE.MeshPhysicalMaterial({ 
        color: "#d0d0d0", roughness: 0.15, metalness: 1.0, clearcoat: 0.5 
      }),
      gold: new THREE.MeshPhysicalMaterial({
        color: "#d4af37", roughness: 0.2, metalness: 1.0, clearcoat: 0.8
      }),
      paper: new THREE.MeshPhysicalMaterial({ 
        color: "#fdfdfd", roughness: 0.9, metalness: 0.0, clearcoat: 0.05
      }),
      darkPlastic: new THREE.MeshPhysicalMaterial({ 
        color: "#1a1a1a", roughness: 0.5, metalness: 0.2, clearcoat: 0.5
      }),
      glass: new THREE.MeshPhysicalMaterial({ 
        color: "#111111", transmission: 0.95, opacity: 1, transparent: true, roughness: 0.1, ior: 1.5, thickness: 0.2
      })
    };
  }, []);

  // Animation refs
  const pencilRef = useRef<THREE.Group>(null);
  const cardGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Subtle float for the entire scene to give a dreamy vibe
      groupRef.current.position.y = Math.sin(time * 0.3) * 0.02;
    }

    // Parallax/rotation driven by scroll
    if (pencilRef.current) {
      // Pencil rolls slightly based on scroll
      pencilRef.current.rotation.x = -Math.PI / 2 + scrollProgress * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Background/Environment Setup */}
      {/* Desk Surface (Middleground / Background boundary) */}
      <RoundedBox args={[16, 0.4, 10]} position={[0, -0.2, -1]} radius={0.05} smoothness={4} material={materials.desk} castShadow receiveShadow />

      {/* 
        Middleground: Leather Folder and Calculator 
        Positioned slightly deeper to create depth of field feel
      */}
      <group position={[-1.5, 0, -1.2]} rotation={[0, 0.15, 0]}>
        {/* Leather Folder */}
        <RoundedBox args={[2.8, 0.1, 3.8]} position={[0, 0.05, 0]} radius={0.04} smoothness={4} material={materials.leather} castShadow receiveShadow />
        {/* Papers peeking out */}
        <Box args={[2.7, 0.02, 3.7]} position={[0.1, 0.11, 0.1]} rotation={[0, -0.05, 0]} material={materials.paper} castShadow />
        {/* Folder Flap */}
        <RoundedBox args={[2.8, 0.06, 3.8]} position={[0, 0.15, 0]} radius={0.02} smoothness={4} material={materials.leather} castShadow />
      </group>

      <group position={[1.8, 0, -1.5]} rotation={[0, -0.2, 0]}>
        {/* Calculator */}
        <RoundedBox args={[1.5, 0.15, 2]} position={[0, 0.075, 0]} radius={0.05} material={materials.darkPlastic} castShadow receiveShadow />
        {/* Display Glass */}
        <Box args={[1.3, 0.02, 0.5]} position={[0, 0.16, -0.6]} material={materials.glass} />
        {/* Solar Panel */}
        <Box args={[0.4, 0.01, 0.15]} position={[0.4, 0.16, -0.9]} material={materials.darkPlastic} />
        {/* Buttons */}
        {Array.from({ length: 4 }).map((_, i) =>
          Array.from({ length: 3 }).map((_, j) => (
            <RoundedBox 
              key={`btn-${i}-${j}`} 
              args={[0.25, 0.04, 0.2]} 
              position={[-0.45 + j * 0.45, 0.16, 0.1 + i * 0.28]} 
              radius={0.02} 
              material={i === 0 && j === 2 ? materials.gold : materials.darkPlastic} 
              castShadow 
            />
          ))
        )}
      </group>

      {/* 
        Middleground: Metal Ruler (Angled across) 
      */}
      <group position={[0.5, 0.02, -0.2]} rotation={[0, -0.6, 0]}>
        <Box args={[3.5, 0.02, 0.3]} material={materials.metal} castShadow />
        {/* Ruler grooves/marks representation */}
        <Box args={[3.4, 0.025, 0.02]} position={[0, 0, 0.12]} material={materials.darkPlastic} />
      </group>

      {/* 
        Foreground: Mechanical Pencil and Business Cards
        Positioned closer to the camera, highly detailed.
      */}
      <group ref={pencilRef} position={[-0.8, 0.06, 1.2]} rotation={[-Math.PI / 2, 0, 0.4]}>
        {/* Main Body */}
        <Cylinder args={[0.04, 0.04, 1.2]} material={materials.metal} castShadow />
        {/* Grip */}
        <Cylinder args={[0.042, 0.042, 0.4]} position={[0, -0.4, 0]} material={materials.darkPlastic} castShadow />
        {/* Tip */}
        <Cylinder args={[0.04, 0.01, 0.15]} position={[0, -0.675, 0]} material={materials.metal} castShadow />
        {/* Lead pipe */}
        <Cylinder args={[0.005, 0.005, 0.05]} position={[0, -0.775, 0]} material={materials.metal} castShadow />
        {/* Clicker mechanism */}
        <Cylinder args={[0.03, 0.03, 0.1]} position={[0, 0.65, 0]} material={materials.gold} castShadow />
        <Cylinder args={[0.02, 0.02, 0.08]} position={[0, 0.74, 0]} material={materials.metal} castShadow />
        {/* Clip */}
        <Box args={[0.01, 0.3, 0.04]} position={[0.04, 0.4, 0]} material={materials.gold} castShadow />
      </group>

      <group ref={cardGroupRef} position={[1.5, 0.01, 1.8]} rotation={[0, 0.3, 0]}>
        {/* Business Card Stack with imperfect placement */}
        <RoundedBox args={[0.9, 0.01, 0.5]} position={[0, 0, 0]} radius={0.01} material={materials.paper} castShadow />
        <RoundedBox args={[0.9, 0.01, 0.5]} position={[-0.02, 0.012, 0.05]} rotation={[0, -0.1, 0]} radius={0.01} material={materials.paper} castShadow />
        <RoundedBox args={[0.9, 0.01, 0.5]} position={[0.05, 0.024, -0.02]} rotation={[0, 0.05, 0]} radius={0.01} material={materials.paper} castShadow />
        {/* Gold foil accent on top card */}
        <Box args={[0.3, 0.012, 0.1]} position={[0.05, 0.024, -0.02]} rotation={[0, 0.05, 0]} material={materials.gold} castShadow />
      </group>

      {/* 
        Middleground: Coffee Mug 
        Aligned with the steam source in Particles.tsx 
      */}
      <group position={[1.2, 0, -0.8]}>
        {/* Mug Body */}
        <Cylinder args={[0.25, 0.25, 0.5]} position={[0, 0.25, 0]} material={materials.darkPlastic} castShadow receiveShadow />
        {/* Handle */}
        <Torus args={[0.15, 0.04, 8, 16]} position={[0.25, 0.25, 0]} rotation={[0, 0, -Math.PI / 2]} material={materials.darkPlastic} castShadow />
        {/* Coffee Liquid */}
        <Cylinder args={[0.23, 0.23, 0.48]} position={[0, 0.25, 0]} material={materials.leather} />
      </group>

    </group>
  );
}
