"use client";

import { lazy, Suspense, type ComponentProps, type ReactNode } from "react";
import StationeryPreviewSkeleton from "./StationeryPreviewSkeleton";

const StationeryCanvas = lazy(() => import("./StationeryCanvas"));
const Interactive3DPen = lazy(() => import("./Interactive3DPen"));
const Customizable3DJournal = lazy(() => import("./Customizable3DJournal"));

type CanvasProps = ComponentProps<typeof import("./StationeryCanvas").default>;

/**
 * Lazy-loaded StationeryCanvas with a 2D cream skeleton fallback.
 * Prefer this export from product pages — never eagerly import the Canvas.
 */
export function LazyStationeryCanvas(props: CanvasProps) {
  return (
    <Suspense fallback={<StationeryPreviewSkeleton label="Loading studio…" />}>
      <StationeryCanvas {...props} />
    </Suspense>
  );
}

export function LazyInteractive3DPen(
  props: ComponentProps<typeof import("./Interactive3DPen").default>
) {
  return (
    <Suspense fallback={null}>
      <Interactive3DPen {...props} />
    </Suspense>
  );
}

export function LazyCustomizable3DJournal(
  props: ComponentProps<typeof import("./Customizable3DJournal").default>
) {
  return (
    <Suspense fallback={null}>
      <Customizable3DJournal {...props} />
    </Suspense>
  );
}

/** Compose a full pen + journal product preview with lazy Canvas. */
export function StationeryProductPreview({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <LazyStationeryCanvas className={className}>
      {children ?? (
        <>
          <LazyCustomizable3DJournal position={[-0.55, 0.04, -0.1]} />
          <LazyInteractive3DPen position={[0.75, 0, 0.35]} useProcedural />
        </>
      )}
    </LazyStationeryCanvas>
  );
}

export { default as StationeryCanvas } from "./StationeryCanvas";
export { default as Interactive3DPen } from "./Interactive3DPen";
export { default as Customizable3DJournal } from "./Customizable3DJournal";
export { default as StationeryPreviewSkeleton } from "./StationeryPreviewSkeleton";
export type { Interactive3DPenProps } from "./Interactive3DPen";
export type {
  Customizable3DJournalProps,
  MonogramFinish,
} from "./Customizable3DJournal";
