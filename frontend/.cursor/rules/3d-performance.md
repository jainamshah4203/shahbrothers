# 3D Performance Rules

Luxury stationery previews must stay smooth on mid-range and mobile GPUs. Follow these rules whenever adding or editing R3F scenes.

## Lazy Loading

Always wrap 3D `Canvas` trees in `React.lazy` and suspend with a **2D HTML/CSS skeleton** (cream flatlay — never a blank white box or spinner-only state).

```tsx
// ❌ BAD — eagerly pulls WebGL + three into the route chunk
import StationeryCanvas from "@/components/stationery-3d/StationeryCanvas";

// ✅ GOOD — deferred chunk + clean fallback
import { LazyStationeryCanvas } from "@/components/stationery-3d";

<LazyStationeryCanvas>
  <Interactive3DPen />
</LazyStationeryCanvas>
```

Use `StationeryPreviewSkeleton` (or equivalent) as the Suspense fallback.

## DPR Capping

Cap device pixel ratio so retina phones do not render 3× pixel counts:

```tsx
<Canvas dpr={[1, 2]} shadows /* ... */>
```

Never omit `dpr` on product-preview canvases. Prefer `[1, 1.5]` on known low-end tiers.

## Draco Compression

Ship GLBs through Draco and preload them so first interaction is instant:

```tsx
import { useGLTF } from "@react-three/drei";

useGLTF.preload("/models/fountain-pen.glb"); // Draco-compressed asset

function Pen() {
  const { scene } = useGLTF("/models/fountain-pen.glb");
  return <primitive object={scene} />;
}
```

Place assets under `public/models/`. Prefer `gltf-pipeline -d` (or equivalent) before commit. Keep a procedural fallback mesh for missing assets so the studio still renders in development.
