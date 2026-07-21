# Shah Brothers — Master AI Brain 🧠

> **Purpose**: This file acts as a persistent memory bank for the AI. It records all architectural decisions, code changes, regressions fixed, and performance optimizations made throughout the project. **Do not delete this file.**

---

## 📅 Chronological Change Log

### Phase A: Design System & Tokens
- **Objective**: Establish a luxury, premium, Awwwards-winning visual aesthetic without rewriting the app from scratch.
- **Files Modified**: 
  - `frontend/tailwind.config.ts`: Injected a strict typography scale (`ds-hero`, `ds-section`, `ds-subtitle`, `ds-body`, `ds-product`, `ds-price`, `ds-caption`), elevation shadow system (`floating`, `premium`, `glass`), and customized token systems (warm whites, soft blacks, wood, brushed aluminum, leather, warm gray).
  - `frontend/app/globals.css`: Implemented `.glass` and `.glass-dark` utility pipelines. Fixed a PostCSS `CssSyntaxError` by correctly mapping typography tags (`h1` through `h6`) to the new `@apply text-ds-` prefixes instead of the old, undefined `text-hero`.

### Phase B & C: UI Library & Experience Engineering (GSAP)
- **Objective**: Implement buttery smooth, 60fps animations utilizing the GSAP engine and React Three Fiber.
- **GSAP Motion Engine**:
  - `frontend/hooks/useMousePosition.ts`: Upgraded from React `useState` to a zero-render `MutableRefObject` (`useRef`). This decoupled mouse-tracking from the DOM tree, instantly boosting FPS and solving re-render lag.
  - **Responsive Contexts**: All animation hooks (`useRevealAnimation.ts`, `useTiltEffect.ts`, `useParallax.ts`) were refactored to use `gsap.matchMedia()` bindings instead of `gsap.context()`, ensuring complex animations only run on desktop and gracefully degrade on mobile viewports.
  - `frontend/hooks/useDeviceCapability.ts`: Added a reactive `window.addEventListener("resize")` listener so the site instantly adapts its physics when a user resizes their browser.
- **3D Environment (Hero3D)**:
  - Upgraded to `MeshPhysicalMaterial` for realistic clearcoat plastic, frosted glass, and metallic lighting.
  - `frontend/components/Hero3D/CameraController.tsx`: Added cinematic camera breathing (micro drift). 
  - **Type Fix**: Fixed a strict TypeScript error by accessing `mousePos.current.normalizedX` rather than `mousePos.normalizedX` (due to our earlier `useMousePosition` performance refactor).

### Phase D & E: Next.js Layout Architecture & SEO Recovery
- **Objective**: Clean up regressions left behind by UI refactoring, restore Next.js static generation (SSG) for SEO, and pass production Vercel builds.
- **Restoring SSR & SEO**:
  - `frontend/app/page.tsx`: Stripped out `next/dynamic` with `ssr: false`. We want Googlebot to index the homepage.
  - `frontend/app/layout.tsx`: Removed `export const dynamic = 'force-dynamic'` to restore static prerendering.
  - **Layout Refactoring**: Previously, `<Header />` and `<Footer />` were manually imported and rendered inside 20+ individual route pages (`app/cart/page.tsx`, `app/checkout/page.tsx`, etc.). We wrote a Node.js script to delete all of these redundant wrappers across the app and hoisted them back up into the root `app/layout.tsx`.
- **Image Optimization**:
  - `frontend/components/product/ProductQuickView.tsx`: Swapped out heavy, unoptimized raw HTML `<img>` tags for Next.js `<Image fill sizes="..." />` tags, hooking into the Vercel WebP pipeline.
- **Missing Imports**:
  - `frontend/components/home/NewArrivals.tsx`: Fixed a TypeScript Vercel build crash (`Cannot find name 'ProductCard'`) by explicitly adding `import ProductCard from "@/components/product/ProductCard"`.

### Vercel Deployment & Build Cures
- **The ERESOLVE Peer Dependency Crash**:
  - **Problem**: Vercel failed to run `npm install` because the bleading-edge Next.js 16/React 19 RC conflicted with the `@react-three/drei` ecosystem's peer requirements.
  - **Solution**: Created `frontend/.npmrc` with `legacy-peer-deps=true` to force Vercel to bypass strict peer dependency checks.
- **The Missing Suspense Boundary Bailout**:
  - **Problem**: Next.js crashed during static site generation (SSG) with `Missing Suspense Boundary with CSR Bailout`.
  - **Solution**: In `frontend/app/auth/login/page.tsx` and `frontend/app/auth/register/page.tsx`, the forms use the `useSearchParams()` hook (to read URL queries like `?redirect=...`). In Next.js App Router, using this hook dynamically bails out of static rendering and crashes the build if unhandled. We wrapped both `<LoginForm />` and `<RegisterForm />` inside a React `<Suspense>` boundary with a skeleton loading fallback. The build immediately passed and successfully marked the homepage as a `Static` prerendered route.

---

## 🛠️ Current Project Rules
1. **Never use `ssr: false` on critical pages** unless absolutely necessary for a purely client-side Three.js canvas isolation (and even then, only wrap the canvas component, never the parent page).
2. **GSAP Animations must use `matchMedia`**: Always wrap animations in `gsap.matchMedia()` and target `(min-width: 768px)` to protect mobile battery life and performance.
3. **Always use `<Suspense>`**: When using Next.js client hooks like `useSearchParams()` inside a route, always wrap the immediate component in `<Suspense>`.
4. **Always update this `Brain.md`**: Whenever a new significant feature is added or a nasty bug is fixed, append it to this document.
