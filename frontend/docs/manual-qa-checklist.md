# Manual QA Checklist — Homepage & PDP Interactions

**Scope:** Shah Brothers frontend homepage interactions and high-tier PDP media  
**App entry:** `/` via `app/HomePage.tsx`; PDP via `app/products/[slug]/page.tsx` / `app/products/id/[id]/page.tsx`  
**Test runner:** None configured (no Vitest / Jest / Playwright in `package.json`)  
**Related:** [a11y-audit.md](./a11y-audit.md) for keyboard/SR focus on cart + monogram  

Use this checklist before merging motion, hero, cart, product-card, or PDP gallery changes.

---

## Matrix legend

Mark each cell: **Pass** / **Fail** / **N/A**

| Viewport | Width guide |
|----------|-------------|
| Desktop | ≥ 1280px |
| Tablet | 768–1024px |
| Mobile | ≤ 430px |

Browsers: **Chrome**, **Firefox**, **Safari** (macOS / iOS Safari). On Windows, Safari may be N/A — note OS.

Complete the matrix for every section below across **Desktop / Tablet / Mobile** × **Chrome / Firefox / Safari**.

---

## Pre-flight

- [ ] `npm run dev` starts without console errors on `/`
- [ ] Hard refresh once after pulling (clear stale HMR / Three.js cache)
- [ ] Note GPU tier: capable desktop vs low-tier / mobile (Hero3D / Product3D fall back when WebGL off, mobile, low tier, or reduced motion)

---

## 1. Hero scroll storytelling (Hero3D)

**Active path:** `components/home/Hero.tsx` → `components/Hero3D/Hero3D.tsx`  
**Resolved path:** Dual hero routes consolidated to **Hero3D** only on homepage.  
**Legacy / alternate:** `HeroSection.tsx` (editorial flatlay) — must not be imported by homepage if Wave 2 3D hero is intended.

| Check | Chrome D/T/M | Firefox D/T/M | Safari D/T/M |
|-------|--------------|---------------|--------------|
| First viewport shows brand + headline + CTA; hero fills viewport (`hero-3d-container`) | | | |
| Scroll storytelling: overlay opacity/position updates smoothly through hero scrub (no jump/flicker) | | | |
| Capable desktop + WebGL: 3D desk scene loads; no WebGL crash | | | |
| Mobile / low-tier: static atelier fallback (gradient + image), still readable | | | |
| CTAs remain clickable (`pointer-events` on overlay children) | | | |
| Side gutter stationery (`ScrollStationeryAnimation`) does not steal clicks | | | |

---

## 2. Product card tilt / hover

**Path:** `components/product/ProductCard.tsx` + `hooks/useTiltEffect.ts`  
Surfaces: New Arrivals, Best Sellers, On Sale, collections grids.

| Check | Chrome D/T/M | Firefox D/T/M | Safari D/T/M |
|-------|--------------|---------------|--------------|
| Desktop hover: subtle 3D tilt + slight scale (~1.02), returns to rest on leave | | | |
| Hover swaps secondary image when product has ≥2 images | | | |
| Touch devices: no stuck tilt after tap; card remains tappable | | | |
| Wishlist / quick-view controls still receive clicks (not blocked by tilt layer) | | | |
| Rapid mouse-out does not leave card rotated | | | |

---

## 3. Magnetic buttons

**Paths:** `components/ui/button.tsx` (`useMagneticEffect` on default/outline/secondary/glass); optional wrapper `components/MagneticButton/MagneticButton.tsx`

| Check | Chrome D/T/M | Firefox D/T/M | Safari D/T/M |
|-------|--------------|---------------|--------------|
| Hero / primary Buttons: cursor near button pulls slightly toward pointer | | | |
| Leave radius: button springs back smoothly (elastic hover token) | | | |
| Click / keyboard activate still works; focus ring visible | | | |
| `asChild` / link / ghost variants: no broken layout from magnetic transform | | | |
| Touch: magnetic pull disabled or harmless (no jitter) | | | |

---

## 4. Cart drawer a11y

**Paths:** `components/cart/CartDrawer.tsx` (also re-exported as MiniCart); mounted in `app/layout.tsx`

| Check | Chrome D/T/M | Firefox D/T/M | Safari D/T/M |
|-------|--------------|---------------|--------------|
| Open from header cart control; panel slides in; body scroll locked | | | |
| `role="dialog"` + `aria-modal="true"`; labelled by title / described by desc ids | | | |
| Focus moves to Close on open; Tab cycles within drawer (focus trap) | | | |
| Escape closes; backdrop click closes | | | |
| Focus returns to opener control after close | | | |
| Qty ± and Remove have clear `aria-label`s; qty updates announced (`aria-live`) | | | |
| Free-shipping progress has progressbar semantics toward ₹1500 | | | |
| Gift note toggle expands; textarea labelled; usable by keyboard | | | |
| Add item from product card / PDP → drawer reflects qty & INR totals | | | |
| View Cart → `/cart`; Checkout → `/checkout`; drawer closes on route change | | | |
| Empty cart state is clear and closable | | | |

---

## 5. Monogram foil customizer

**Path:** `components/customizer/MonogramCustomizer.tsx` on homepage (below-fold dynamic import)

| Check | Chrome D/T/M | Firefox D/T/M | Safari D/T/M |
|-------|--------------|---------------|--------------|
| Section visible below New Arrivals; cover preview renders | | | |
| Initials input: letters only, max 3, live preview updates | | | |
| Finish radios: Gold Foil / Silver Foil / Blind Deboss change preview style | | | |
| Foil finishes show metallic / foil treatment (not flat solid only) | | | |
| Keyboard: can change initials and finish without mouse | | | |
| CTA / link in section navigates as labeled | | | |
| Narrow mobile: controls stack; preview not clipped horizontally | | | |

---

## 6. Reduced motion

**Paths:** `hooks/useReducedMotion.ts`, `app/globals.css` `@media (prefers-reduced-motion: reduce)`, hooks consuming `motionTokens.*.gsap`

Enable OS / browser “Reduce motion” (or DevTools → Rendering → Emulate CSS `prefers-reduced-motion: reduce`).

| Check | Chrome D/T/M | Firefox D/T/M | Safari D/T/M |
|-------|--------------|---------------|--------------|
| Hero uses static fallback (no WebGL scroll scrub) | | | |
| Card tilt does not run; cards stay flat | | | |
| Magnetic pull disabled; buttons do not chase cursor | | | |
| Smooth scroll / Lenis does not fight native scroll | | | |
| CSS transitions effectively near-instant (globals reduce rule) | | | |
| Cart drawer still opens/closes and remains usable | | | |
| Monogram still interactive (preview may animate less / instantly) | | | |
| PDP 3D preview disabled or static when reduced motion | | | |
| Toggle reduce motion off mid-session: effects re-enable without refresh (hook listens to `change`) | | | |

---

## 7. Below-fold lazy sections

**Paths:** `app/HomePage.tsx` + `lib/performance.ts` (`belowFoldDynamicOptions`)  
Dynamic: `ScrollStationeryAnimation`, `MonogramCustomizer`, `OnSaleStrip`, `BestSellersStrip`, `InstagramFeed`

| Check | Chrome D/T/M | Firefox D/T/M | Safari D/T/M |
|-------|--------------|---------------|--------------|
| First paint / LCP not blocked by below-fold chunks | | | |
| Scroll into On Sale / Best Sellers: strips hydrate and render cards | | | |
| Monogram + Instagram appear after scroll without permanent blank gaps | | | |
| Soft navigation back to `/` does not double-mount or flash broken sections | | | |
| SSR content remains present (no empty shells for crawlers / no-JS degrade where applicable) | | | |
| Categories / strips do not cause large CLS when images load | | | |
| Instagram feed does not overlap gutter stationery | | | |

---

## 8. PDP gallery / lightbox / 3D (high-tier)

**Paths:** `components/product/Gallery.tsx`, `components/product/Product3DPreview.tsx`  
**Pages:** `app/products/[slug]/page.tsx`, `app/products/id/[id]/page.tsx`

| Check | Chrome D/T/M | Firefox D/T/M | Safari D/T/M |
|-------|--------------|---------------|--------------|
| Gallery main image + thumbnails render; thumb click swaps main | | | |
| Open lightbox (`aria-label="Open lightbox"`); Dialog focuses correctly | | | |
| Lightbox prev/next (buttons + keyboard) cycle images; Escape closes | | | |
| High-tier desktop + WebGL: Product3DPreview mounts without crash | | | |
| Mobile / low-tier / no WebGL: 3D gated off; 2D gallery remains usable | | | |
| 3D canvas does not steal scroll or trap pointer unintentionally | | | |
| Reduced motion: no forced 3D animation; gallery still works | | | |
| Image alt text / lightbox title remain accessible to SR | | | |

---

## Regression risks (must re-check after related PRs)

### Dual Hero paths → Hero3D

| Risk | Detail | Mitigation |
|------|--------|------------|
| Wrong hero on `/` | `HomePage` must import `@/components/home/Hero` (Hero3D), not legacy `HeroSection` | Grep imports of `HeroSection` / `Hero3DCanvas` before release |
| Stale re-export | `components/home/Hero3DCanvas.tsx` re-exports Hero3D — accidental dual mounts if both used | Only one hero mount on homepage |
| Deleted vs revived | Restoring `HeroSection` without swapping `HomePage` import causes brand/layout mismatch | Confirm single composition in first viewport |

### Motion token `.gsap` shape

| Risk | Detail | Mitigation |
|------|--------|------------|
| Spreading whole token into GSAP | `motionTokens.fast` includes `duration`, `gsap`, `framer` — spreading the root object into `gsap.to` / `quickTo` is invalid | Always use `motionTokens.<name>.gsap` or `gsapVars("fast")` |
| Renaming / removing `.gsap` | Hooks (`useTiltEffect`, `useMagneticEffect`, `useRevealAnimation`, `useSmoothScroll`, `useScrollAnim`, `useParallax`) and `lib/animations.ts` helpers depend on `.gsap` shape `{ duration, ease }` (scroll token uses `{ scrub }`) | After token edits, smoke-test tilt, magnetic, reveal, Lenis |
| Ease string vs cubic | GSAP needs string easings; Framer needs cubic arrays — swapping breaks one engine silently | Keep `easings.*.gsap` and `easings.*.cubic` paired |

---

## Sign-off

| Role | Name | Date | Result |
|------|------|------|--------|
| QA | | | Pass / Fail |
| Notes | | | |

---

## Automated testing status

**Current:** No Vitest, Jest, or Playwright in `frontend/package.json`. Automated tests were **not** added in this pass (docs-only ownership; runner does not exist).

**Future work — Vitest (recommended):**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

1. Add `"test": "vitest run"` and `"test:watch": "vitest"` to `package.json` scripts.
2. Add `vitest.config.ts` with React plugin + `environment: "jsdom"` and path alias `@` → project root (match `tsconfig` paths).
3. First unit targets (pure, no Three.js):
   - `hooks/useReducedMotion.ts` (matchMedia mock)
   - `lib/animations.ts` (`gsapVars`, token `.gsap` shape)
   - Cart store qty/subtotal helpers if extracted
4. Keep Playwright as a later smoke for hero WebGL (flaky in CI without GPU).

Until then, treat this checklist as the release gate for homepage and PDP interaction work.
