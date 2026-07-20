"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useMousePosition } from "@/hooks/useMousePosition";

interface CameraControllerProps {
  scrollProgress: number;
}

const INITIAL_POS = new THREE.Vector3(0, 3.5, 9);
const TARGET_POS = new THREE.Vector3(0, 1.8, 5);
const INITIAL_FOV = 45;
const TARGET_FOV = 35;
const LOOK_AT = new THREE.Vector3(0, 0, 0);

/**
 * Controls the camera in the Hero 3D scene.
 * Handles slow cinematic breathing, micro drift, natural inertia, and narrative scroll.
 */
export default function CameraController({ scrollProgress }: CameraControllerProps) {
  const { camera } = useThree();
  const mousePos = useMousePosition(0.05);
  
  const basePosition = useRef(new THREE.Vector3().copy(INITIAL_POS));
  const currentPos = useRef(new THREE.Vector3().copy(INITIAL_POS));

  useEffect(() => {
    camera.position.copy(INITIAL_POS);
    camera.lookAt(LOOK_AT);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = INITIAL_FOV;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Narrative Scroll (Camera approaches)
    const zoomProgress = Math.min(scrollProgress / 0.5, 1);
    
    basePosition.current.lerpVectors(
      INITIAL_POS,
      TARGET_POS,
      zoomProgress
    );

    // Depth Narrows (FOV)
    if (camera instanceof THREE.PerspectiveCamera) {
      const targetFov = THREE.MathUtils.lerp(INITIAL_FOV, TARGET_FOV, zoomProgress);
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.05);
      camera.updateProjectionMatrix();
    }

    // Cinematic breathing & micro drift
    const breathY = Math.sin(time * 0.4) * 0.06;
    const driftX = Math.cos(time * 0.25) * 0.04;

    // Mouse parallax
    const parallaxX = mousePos.current.normalizedX * 0.8;
    const parallaxY = mousePos.current.normalizedY * 0.8;

    const targetX = basePosition.current.x + parallaxX + driftX;
    const targetY = basePosition.current.y + parallaxY + breathY;
    const targetZ = basePosition.current.z;

    // Natural inertia
    currentPos.current.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.03);
    camera.position.copy(currentPos.current);

    // Look at with micro drift
    const lookTarget = LOOK_AT.clone().add(new THREE.Vector3(driftX * 0.3, breathY * 0.3, 0));
    camera.lookAt(lookTarget);
  });

  return null;
}
