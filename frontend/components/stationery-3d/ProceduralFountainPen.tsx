"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Procedural fountain pen used when `/models/fountain-pen.glb` is unavailable,
 * or as a named-mesh stand-in during development. Mesh names match the GLTF
 * material targeting conventions (`body`, `clip`, `nib`).
 */
export default function ProceduralFountainPen() {
  const materials = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({
        color: "#1A1A1A",
        roughness: 0.4,
        metalness: 0.05,
      }),
      clip: new THREE.MeshStandardMaterial({
        color: "#D4AF37",
        metalness: 0.9,
        roughness: 0.1,
      }),
      nib: new THREE.MeshStandardMaterial({
        color: "#C9A84C",
        metalness: 0.85,
        roughness: 0.18,
      }),
      grip: new THREE.MeshStandardMaterial({
        color: "#2A2420",
        roughness: 0.55,
        metalness: 0.08,
      }),
    }),
    []
  );

  return (
    <group name="fountain-pen" rotation={[0, 0, -Math.PI / 2.4]} position={[0, 0.06, 0]}>
      {/* Barrel */}
      <mesh name="body" castShadow receiveShadow material={materials.body}>
        <cylinderGeometry args={[0.045, 0.048, 1.05, 32]} />
      </mesh>

      {/* Cap section */}
      <mesh
        name="body-cap"
        castShadow
        position={[0, 0.58, 0]}
        material={materials.body}
      >
        <cylinderGeometry args={[0.05, 0.05, 0.28, 32]} />
      </mesh>

      {/* Grip */}
      <mesh name="grip" castShadow position={[0, -0.42, 0]} material={materials.grip}>
        <cylinderGeometry args={[0.044, 0.04, 0.28, 24]} />
      </mesh>

      {/* Section / feed */}
      <mesh name="section" castShadow position={[0, -0.62, 0]} material={materials.body}>
        <cylinderGeometry args={[0.032, 0.028, 0.12, 20]} />
      </mesh>

      {/* Nib */}
      <mesh
        name="nib"
        castShadow
        position={[0, -0.72, 0]}
        rotation={[0, 0, 0]}
        material={materials.nib}
      >
        <coneGeometry args={[0.028, 0.14, 16]} />
      </mesh>

      {/* Gold clip */}
      <mesh
        name="clip"
        castShadow
        position={[0.055, 0.52, 0]}
        material={materials.clip}
      >
        <boxGeometry args={[0.012, 0.32, 0.04]} />
      </mesh>

      {/* Clip ball tip */}
      <mesh
        name="clip-tip"
        castShadow
        position={[0.055, 0.34, 0]}
        material={materials.clip}
      >
        <sphereGeometry args={[0.016, 16, 16]} />
      </mesh>
    </group>
  );
}
