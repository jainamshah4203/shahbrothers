# Code Quality Report — Shah Brothers Frontend

**Date:** 2026-07-23  
**Scope:** Dead-path cleanup after Wave 1–3 orchestration  

## Removals

| Path | Reason |
|------|--------|
| `components/home/HeroSection.tsx` | Orphaned editorial flatlay hero. Homepage uses `Hero.tsx` → `Hero3D`. Zero imports after Wave 2. |
| `components/home/FeaturedCollections.tsx` | Duplicate of Categories masonry pattern; not composed in `HomePage.tsx`; zero imports. |

## Kept (documented)

| Path | Reason |
|------|--------|
| `components/home/Hero3DCanvas.tsx` | Thin re-export of `Hero3D` for backward-compatible imports — keep. |
| `components/stationery-3d/*` | Used by PDP `Product3DPreview` — keep. |
| `components/layout/Header.tsx` | Re-exports `Navbar` — keep for compatibility. |

## Files >250 lines (note only — owned by other agents)

- `components/home/ScrollStationeryAnimation.tsx`
- `components/cart/CartDrawer.tsx`
- `components/Hero3D/DeskScene.tsx` (likely)
- `components/product/ProductCard.tsx`

Recommend future splits when those owners next touch the files.

## TypeScript / lint

- Prefer `tsc --noEmit` + `next build` as merge gates.
- Motion API: use `motionTokens.*.gsap` / `.framer` — do not spread raw tokens into GSAP.

## Token enforcement

- Design tokens live in `lib/tokens` + Tailwind; materials in `lib/materials.ts`.
- Ban new `slate-*` / `zinc-*` / `gray-*` utilities in UI work.
