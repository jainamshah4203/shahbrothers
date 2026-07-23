"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Cylinder, Box, Torus } from "@react-three/drei";
import * as THREE from "three";
import {
  notebookLeather,
  brassFoil,
  paper,
  ceramicMug,
  lampMetal,
  woodDesk,
  type MaterialPreset,
} from "@/lib/materials";

interface DeskSceneProps {
  scrollProgress: number;
}

function fromPreset(
  preset: MaterialPreset,
  overrides?: Partial<ConstructorParameters<typeof THREE.MeshPhysicalMaterial>[0]>
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: preset.color,
    metalness: preset.metalness,
    roughness: preset.roughness,
    envMapIntensity: preset.envMapIntensity,
    clearcoat: preset.clearcoat ?? 0,
    clearcoatRoughness: preset.clearcoatRoughness ?? 0,
    ...overrides,
  });
}

/**
 * Procedural atelier desk — notebook, pen, laptop, lamp, mug on walnut.
 * Materials from lib/materials presets only.
 */
export default function DeskScene({ scrollProgress }: DeskSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const notebookRef = useRef<THREE.Group>(null);
  const penRef = useRef<THREE.Group>(null);

  const materials = useMemo(() => {
    const desk = fromPreset(woodDesk);
    const leather = fromPreset(notebookLeather);
    const foil = fromPreset(brassFoil);
    const creamPaper = fromPreset(paper);
    const mug = fromPreset(ceramicMug);
    const metal = fromPreset(lampMetal);
    const navyBody = fromPreset(lampMetal, {
      color: "#1C2D42",
      metalness: 0.35,
      roughness: 0.45,
      envMapIntensity: 0.55,
    });
    const screen = new THREE.MeshPhysicalMaterial({
      color: "#0a1018",
      metalness: 0.6,
      roughness: 0.35,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      envMapIntensity: 0.4,
    });
    const coffee = fromPreset(notebookLeather, {
      color: "#3D2314",
      roughness: 0.55,
      clearcoat: 0.4,
    });
    return { desk, leather, foil, creamPaper, mug, metal, navyBody, screen, coffee };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(materials).forEach((mat) => mat.dispose());
    };
  }, [materials]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const eased = THREE.MathUtils.smoothstep(scrollProgress, 0, 1);

    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 0.28) * 0.018;
    }

    if (notebookRef.current) {
      notebookRef.current.rotation.y = 0.12 + Math.sin(time * 0.2) * 0.008;
      notebookRef.current.position.y = THREE.MathUtils.lerp(0, 0.04, eased * 0.35);
    }

    if (penRef.current) {
      penRef.current.rotation.z = 0.35 + scrollProgress * 0.12;
      penRef.current.rotation.x = -Math.PI / 2 + Math.sin(time * 0.35) * 0.015;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Walnut desk */}
      <RoundedBox
        args={[14, 0.35, 9]}
        position={[0, -0.18, -0.6]}
        radius={0.04}
        smoothness={4}
        material={materials.desk}
        castShadow
        receiveShadow
      />

      {/* Leather notebook — focal subject */}
      <group ref={notebookRef} position={[-0.85, 0, -0.15]} rotation={[0, 0.12, 0]}>
        <RoundedBox
          args={[2.4, 0.12, 3.2]}
          position={[0, 0.06, 0]}
          radius={0.03}
          smoothness={4}
          material={materials.leather}
          castShadow
          receiveShadow
        />
        {/* Pages */}
        <Box
          args={[2.28, 0.08, 3.05]}
          position={[0.04, 0.1, 0]}
          material={materials.creamPaper}
          castShadow
        />
        {/* Cover flap edge */}
        <RoundedBox
          args={[2.4, 0.04, 3.2]}
          position={[0, 0.16, 0]}
          radius={0.02}
          smoothness={4}
          material={materials.leather}
          castShadow
        />
        {/* Brass foil monogram */}
        <Box
          args={[0.55, 0.01, 0.55]}
          position={[0, 0.185, -0.7]}
          material={materials.foil}
          castShadow
        />
        {/* Spine foil line */}
        <Box
          args={[0.04, 0.14, 3.1]}
          position={[-1.15, 0.08, 0]}
          material={materials.foil}
        />
      </group>

      {/* Fountain pen */}
      <group
        ref={penRef}
        position={[0.55, 0.07, 0.85]}
        rotation={[-Math.PI / 2, 0, 0.35]}
      >
        <Cylinder args={[0.035, 0.035, 1.35]} material={materials.navyBody} castShadow />
        <Cylinder
          args={[0.038, 0.038, 0.28]}
          position={[0, -0.35, 0]}
          material={materials.metal}
          castShadow
        />
        <Cylinder
          args={[0.032, 0.008, 0.18]}
          position={[0, -0.78, 0]}
          material={materials.foil}
          castShadow
        />
        <Cylinder
          args={[0.028, 0.028, 0.12]}
          position={[0, 0.72, 0]}
          material={materials.foil}
          castShadow
        />
        <Box
          args={[0.012, 0.32, 0.04]}
          position={[0.04, 0.45, 0]}
          material={materials.foil}
          castShadow
        />
      </group>

      {/* Simplified laptop */}
      <group position={[2.2, 0, -1.4]} rotation={[0, -0.35, 0]}>
        {/* Base */}
        <RoundedBox
          args={[2.6, 0.06, 1.7]}
          position={[0, 0.03, 0]}
          radius={0.02}
          smoothness={4}
          material={materials.navyBody}
          castShadow
          receiveShadow
        />
        {/* Keyboard deck hint */}
        <Box
          args={[2.2, 0.01, 1.1]}
          position={[0, 0.065, 0.1]}
          material={materials.metal}
        />
        {/* Screen hinged */}
        <group position={[0, 0.06, -0.82]} rotation={[1.15, 0, 0]}>
          <RoundedBox
            args={[2.55, 1.6, 0.05]}
            position={[0, 0.8, 0]}
            radius={0.02}
            smoothness={4}
            material={materials.navyBody}
            castShadow
          />
          <Box
            args={[2.35, 1.4, 0.02]}
            position={[0, 0.8, 0.03]}
            material={materials.screen}
          />
        </group>
      </group>

      {/* Desk lamp */}
      <group position={[-2.6, 0, -1.8]} rotation={[0, 0.4, 0]}>
        {/* Base */}
        <Cylinder
          args={[0.28, 0.32, 0.06]}
          position={[0, 0.03, 0]}
          material={materials.metal}
          castShadow
          receiveShadow
        />
        {/* Arm */}
        <Cylinder
          args={[0.035, 0.035, 1.4]}
          position={[0.15, 0.75, 0]}
          rotation={[0, 0, -0.35]}
          material={materials.metal}
          castShadow
        />
        {/* Shade */}
        <Cylinder
          args={[0.08, 0.32, 0.35]}
          position={[0.55, 1.35, 0]}
          rotation={[0.5, 0, -0.6]}
          material={materials.foil}
          castShadow
        />
        {/* Warm bulb glow (emissive proxy via bright fill handled in Lighting) */}
        <pointLight
          position={[0.7, 1.2, 0.1]}
          intensity={0.55}
          color="#FFE8C8"
          distance={4}
          decay={2}
        />
      </group>

      {/* Ceramic coffee mug */}
      <group position={[1.15, 0, 0.35]}>
        <Cylinder
          args={[0.22, 0.2, 0.48]}
          position={[0, 0.24, 0]}
          material={materials.mug}
          castShadow
          receiveShadow
        />
        <Torus
          args={[0.14, 0.035, 8, 20]}
          position={[0.24, 0.24, 0]}
          rotation={[0, 0, -Math.PI / 2]}
          material={materials.mug}
          castShadow
        />
        <Cylinder
          args={[0.19, 0.19, 0.02]}
          position={[0, 0.42, 0]}
          material={materials.coffee}
        />
      </group>
    </group>
  );
}
