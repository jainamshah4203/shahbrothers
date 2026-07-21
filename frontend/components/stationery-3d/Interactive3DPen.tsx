"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import ProceduralFountainPen from "./ProceduralFountainPen";

const MODEL_PATH = "/models/fountain-pen.glb";

export interface Interactive3DPenProps {
  /** Override GLTF path — defaults to /models/fountain-pen.glb */
  modelUrl?: string;
  /** Force procedural geometry (useful before the asset ships) */
  useProcedural?: boolean;
  /** World position of the pen group */
  position?: [number, number, number];
  /** Focus point for nib / clip detail on click */
  focusPoint?: [number, number, number];
  onFocusChange?: (focused: boolean) => void;
}

type OrbitLike = {
  target: THREE.Vector3;
  update: () => void;
  enabled: boolean;
};

function applyStationeryMaterials(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const name = child.name.toLowerCase();

    if (!child.material || Array.isArray(child.material)) {
      child.material = new THREE.MeshStandardMaterial({ color: "#1A1A1A" });
    }

    const current = child.material;
    const std =
      current instanceof THREE.MeshStandardMaterial
        ? current
        : new THREE.MeshStandardMaterial({ color: "#1A1A1A" });

    if (!(current instanceof THREE.MeshStandardMaterial)) {
      child.material = std;
    }

    if (name.includes("clip") || name.includes("gold") || name.includes("ring")) {
      std.metalness = 0.9;
      std.roughness = 0.1;
      std.color.set("#D4AF37");
    } else if (name.includes("nib") || name.includes("tip")) {
      std.metalness = 0.85;
      std.roughness = 0.18;
      std.color.set("#C9A84C");
    } else if (
      name.includes("body") ||
      name.includes("barrel") ||
      name.includes("cap")
    ) {
      std.metalness = 0.05;
      std.roughness = 0.4;
    }

    std.needsUpdate = true;
    child.castShadow = true;
    child.receiveShadow = true;
  });
}

function GltfFountainPen({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => {
    const next = scene.clone(true);
    applyStationeryMaterials(next);
    return next;
  }, [scene]);

  return <primitive object={clone} />;
}

/**
 * Interactive fountain pen — hover elevates + tilts toward the pointer;
 * click lerps the orbit target onto the nib / gold clip.
 */
export default function Interactive3DPen({
  modelUrl = MODEL_PATH,
  useProcedural = false,
  position = [0, 0, 0],
  focusPoint = [0.05, 0.12, 0.55],
  onFocusChange,
}: Interactive3DPenProps) {
  const groupRef = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitLike | null;

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [modelFailed, setModelFailed] = useState(useProcedural);

  const pointer = useRef({ x: 0, y: 0 });
  const elevY = useRef(0);
  const tilt = useRef({ x: 0, z: 0 });

  const defaultTarget = useMemo(() => new THREE.Vector3(0, 0.15, 0), []);
  const focusTarget = useMemo(
    () => new THREE.Vector3(...focusPoint),
    [focusPoint]
  );
  const currentTarget = useRef(defaultTarget.clone());
  const cameraGoal = useRef(new THREE.Vector3());

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  useEffect(() => {
    if (useProcedural) {
      setModelFailed(true);
      return;
    }
    let cancelled = false;
    fetch(modelUrl, { method: "HEAD" })
      .then((res) => {
        if (!cancelled && !res.ok) setModelFailed(true);
      })
      .catch(() => {
        if (!cancelled) setModelFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [modelUrl, useProcedural]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    const targetElev = hovered || focused ? 0.2 : 0;
    elevY.current = THREE.MathUtils.lerp(elevY.current, targetElev, 0.08);
    group.position.y = position[1] + elevY.current;

    const targetTiltX = hovered ? pointer.current.y * 0.18 : 0;
    const targetTiltZ = hovered ? -pointer.current.x * 0.22 : 0;
    tilt.current.x = THREE.MathUtils.lerp(tilt.current.x, targetTiltX, 0.1);
    tilt.current.z = THREE.MathUtils.lerp(tilt.current.z, targetTiltZ, 0.1);
    group.rotation.x = tilt.current.x;
    group.rotation.z = tilt.current.z;

    const goal = focused ? focusTarget : defaultTarget;
    currentTarget.current.lerp(goal, 0.06);

    if (controls?.target) {
      controls.target.lerp(currentTarget.current, 0.08);
      controls.update?.();
    }

    if (focused) {
      cameraGoal.current.set(
        focusPoint[0] + 0.55,
        focusPoint[1] + 0.45,
        focusPoint[2] + 0.85
      );
      camera.position.lerp(cameraGoal.current, 0.05);
      camera.lookAt(currentTarget.current);
    }
  });

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!groupRef.current) return;
    const local = groupRef.current.worldToLocal(e.point.clone());
    pointer.current.x = THREE.MathUtils.clamp(local.x * 2.5, -1, 1);
    pointer.current.y = THREE.MathUtils.clamp(local.z * 2.5, -1, 1);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setFocused((prev) => {
      const next = !prev;
      onFocusChange?.(next);
      return next;
    });
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
    >
      {modelFailed ? (
        <ProceduralFountainPen />
      ) : (
        <Suspense fallback={<ProceduralFountainPen />}>
          <GltfFountainPen url={modelUrl} />
        </Suspense>
      )}
    </group>
  );
}

// Preload Draco-compressed fountain pen when the asset is present
if (typeof window !== "undefined") {
  useGLTF.preload(MODEL_PATH);
}
