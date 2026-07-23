# Code Quality Report — Frontend Dead Code Pass

**Date:** 2026-07-23  
**Agent:** Code Quality  
**Workspace:** `frontend/`

## Summary

Homepage already mounts a single hero via `@/components/home/Hero` → `Hero3D`. Legacy alternate paths were verified unused and removed (or documented when ownership forbids deletion).

## Grep results

| Symbol / path | Code imports (`.ts`/`.tsx`/`.js`/`.mjs`) | Status |
|---|---|---|
| `HeroSection` / `components/home/HeroSection.tsx` | None (smoke-check + QA docs only warn against it) | **Removed** — file deleted; was unimported |
| `FeaturedCollections` / `components/home/FeaturedCollections.tsx` | None (stale mention in `docs/a11y-audit.md` only) | **Removed** — file deleted; was unimported |
| `Hero3DCanvas` / `components/home/Hero3DCanvas.tsx` | None | **Kept** — thin re-export of `@/components/Hero3D/Hero3D`; ownership allows edit only if broken. Re-export is valid; not deleted |

### Homepage hero path (current)

`app/HomePage.tsx` imports `@/components/home/Hero` only. No dual-hero risk from `HeroSection`.

## Actions taken

1. Confirmed `HeroSection.tsx` and `FeaturedCollections.tsx` had no runtime consumers.
2. Staged deletion of both files (already deleted in the working tree).
3. Left `Hero3DCanvas.tsx` unchanged (working re-export; unused but intentional compatibility shim).
4. Did not touch out-of-ownership modules (`lib/animations.ts`, tokens, ProductCard, Categories, Hero3D Scene/DeskScene, ui/button, product Gallery/BuyBox).

## Files >250 lines (note only — outside ownership)

| Lines | Path |
|------:|------|
| 708 | `components/ui/sidebar.tsx` |
| 629 | `components/home/ScrollStationeryAnimation.tsx` |
| 386 | `components/orders/OrderDetailsPage.tsx` |
| 369 | `components/collections/CollectionsClient.tsx` |
| 358 | `components/cart/CartDrawer.tsx` |
| 328 | `components/ui/chart.tsx` |
| 325 | `components/layout/Navbar.tsx` |
| 283 | `lib/animations.ts` *(do not touch)* |
| 267 | `components/Hero3D/DeskScene.tsx` *(do not touch)* |
| 260 | `components/product/Reviews.tsx` |

## TypeScript check

`npx tsc --noEmit -p tsconfig.json` reported errors **outside** this agent’s ownership (not fixed here):

- `components/product/BuyBox.tsx` — missing `description` on `Product`
- `components/product/ProductQuickView.tsx` — incomplete/`null` product typing

No new TS errors introduced by this pass. No `any` fixes required in owned edits (report-only + deletions).

## Follow-ups (optional)

- Remove or update stale doc references to `FeaturedCollections` / `HeroSection` in `docs/a11y-audit.md` and `docs/manual-qa-checklist.md` once those docs are owned.
- Consider deleting `Hero3DCanvas.tsx` in a later cleanup if the team no longer wants the compatibility shim (currently unused).
- Split files >250 lines listed above under their respective owners.
