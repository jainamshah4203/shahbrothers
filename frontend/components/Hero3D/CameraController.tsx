"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMousePosition } from "@/hooks/useMousePosition";
import { easings } from "@/lib/animations";

interface CameraControllerProps {
  scrollProgress: number;
}

/** Distant establishing shot */
const START_POS = new THREE.Vector3(3.2, 5.4, 10.2);
const START_LOOK = new THREE.Vector3(0.1, 0.15, -0.4);
const START_FOV = 46;

/** Mid — notebook focus */
const MID_POS = new THREE.Vector3(-0.2, 2.15, 4.4);
const MID_LOOK = new THREE.Vector3(-0.75, 0.12, -0.1);
const MID_FOV = 34;

/** End — settled frame for CTA legibility */
const END_POS = new THREE.Vector3(0.6, 2.9, 6.2);
const END_LOOK = new THREE.Vector3(0, 0.25, 0);
const END_FOV = 40;

/** Approximate cubic-bezier sample for hero easing (power3.inOut feel). */
function easeHero(t: number): number {
  const clamped = THREE.MathUtils.clamp(t, 0, 1);
  // Match easings.hero intent: smooth in-out, no linear snaps
  return clamped < 0.5
    ? 4 * clamped * clamped * clamped
    : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

function samplePath(
  progress: number,
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3,
  out: THREE.Vector3
): THREE.Vector3 {
  if (progress < 0.5) {
    const t = easeHero(progress / 0.5);
    return out.lerpVectors(a, b, t);
  }
  const t = easeHero((progress - 0.5) / 0.5);
  return out.lerpVectors(b, c, t);
}

function sampleScalar(progress: number, a: number, b: number, c: number): number {
  if (progress < 0.5) {
    return THREE.MathUtils.lerp(a, b, easeHero(progress / 0.5));
  }
  return THREE.MathUtils.lerp(b, c, easeHero((progress - 0.5) / 0.5));
}

/**
 * Scroll-driven camera story with luxury damping and idle breathing.
 * 0 → distant desk · mid → notebook zoom · 1 → CTA-readable settle.
 */
export default function CameraController({ scrollProgress }: CameraControllerProps) {
  const { camera } = useThree();
  const mousePos = useMousePosition(0.04);

  const smoothedProgress = useRef(0);
  const lastProgress = useRef(0);
  const idleTimer = useRef(0);
  const currentPos = useRef(new THREE.Vector3().copy(START_POS));
  const currentLook = useRef(new THREE.Vector3().copy(START_LOOK));
  const tmpPos = useRef(new THREE.Vector3());
  const tmpLook = useRef(new THREE.Vector3());

  // Damping derived from medium motion token (~0.6s → gentle follow)
  const damp = 1 - Math.exp(-1 / (easings.medium.cubic[0] * 18 + 8));

  useEffect(() => {
    camera.position.copy(START_POS);
    camera.lookAt(START_LOOK);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = START_FOV;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Soft scrub damping — no linear snaps
    smoothedProgress.current = THREE.MathUtils.damp(
      smoothedProgress.current,
      scrollProgress,
      3.2,
      delta
    );
    const p = smoothedProgress.current;

    const scrolling = Math.abs(scrollProgress - lastProgress.current) > 0.0008;
    lastProgress.current = scrollProgress;
    idleTimer.current = scrolling ? 0 : idleTimer.current + delta;
    const idleStrength = THREE.MathUtils.smoothstep(idleTimer.current, 0.35, 1.4);

    samplePath(p, START_POS, MID_POS, END_POS, tmpPos.current);
    samplePath(p, START_LOOK, MID_LOOK, END_LOOK, tmpLook.current);
    const targetFov = sampleScalar(p, START_FOV, MID_FOV, END_FOV);

    // Idle breath when not scrolling
    const breathY = Math.sin(time * 0.38) * 0.055 * (0.35 + idleStrength * 0.65);
    const driftX = Math.cos(time * 0.22) * 0.04 * (0.3 + idleStrength * 0.7);

    const parallaxX = mousePos.current.normalizedX * 0.55 * (1 - p * 0.4);
    const parallaxY = mousePos.current.normalizedY * 0.4 * (1 - p * 0.35);

    tmpPos.current.x += parallaxX + driftX;
    tmpPos.current.y += parallaxY + breathY;

    currentPos.current.lerp(tmpPos.current, Math.min(1, damp + 0.02));
    currentLook.current.lerp(tmpLook.current, Math.min(1, damp));

    camera.position.copy(currentPos.current);
    camera.lookAt(
      currentLook.current.x + driftX * 0.15,
      currentLook.current.y + breathY * 0.2,
      currentLook.current.z
    );

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 2.8, delta);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
