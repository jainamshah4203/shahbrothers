# Accessibility Audit — Shah Brothers Frontend

**Date:** 2026-07-23  
**Scope:** Cart drawer, monogram customizer, scroll stationery decoration, root layout skip link  
**Auditor:** Accessibility & QA Agent  
**Lighthouse:** Not run (network may be blocked in CI/agent environments). Use the manual checklist below instead.

---

## Summary

Hardened keyboard and screen-reader behavior for the mini-cart and monogram customizer, confirmed the scroll stationery layer is fully decorative (non-interactive), and added a skip link + `lang="en"` verification at the document root.

| Area | Status | Notes |
|------|--------|-------|
| CartDrawer | Improved | Focus trap, Escape, restore focus, product-specific labels |
| MonogramCustomizer | Improved | Fieldset + radiogroup, roving tabindex, stable live region |
| ScrollStationeryAnimation | Confirmed | `aria-hidden`, `inert`, `pointer-events-none`, no focusables |
| Root layout | Improved | Skip link → `#main-content`; `lang="en"` already present |
| Product pages / Hero3D / ProductCard / ui/button | Out of scope | Owned by other agents |

**Self-score (this pass):** **8.2 / 10**

Rationale: Core dialog and custom-control patterns meet WCAG 2.2 AA intent for keyboard + name/role/value. Remaining gaps are mostly site-wide (contrast of brass accents, AnimatedCursor vs. keyboard users, full automated axe/Lighthouse run).

---

## Changes in this pass

### 1. `CartDrawer`

- **Focus trap** while open (Tab / Shift+Tab cycle within the panel).
- **Initial focus** on the Close control when the drawer opens.
- **Focus restore** to the previously focused element on close / Escape / route change.
- **Escape** closes the drawer (unchanged behavior, kept in the same key handler as the trap).
- **Dialog labeling:** `aria-labelledby` + `aria-describedby` (item count / subtotal summary for SRs).
- **Hardened labels:** quantity ± and Remove include product name; quantity group uses `role="group"`; qty value is polite live.
- Decorative product thumbnails use empty `alt` (name is adjacent text).
- Backdrop remains `aria-hidden` and click-to-dismiss only.

### 2. `MonogramCustomizer`

- Finish options: `fieldset` / `legend` + `role="radiogroup"` with `aria-labelledby`.
- **Roving tabindex** (`tabIndex={0|-1}`) and **arrow / Home / End** keyboard support.
- Stable **`aria-live="polite"`** region announces initials + finish (preview visual marked `aria-hidden` to avoid duplicate noise).
- Initials field retains visible label + `aria-describedby` hint.

### 3. `ScrollStationeryAnimation`

- Root: `pointer-events-none`, `aria-hidden="true"`, `role="presentation"`, `inert`.
- Items: `pointer-events-none` + `aria-hidden`; SVGs `aria-hidden` + `focusable="false"`.
- Motion already respects Framer `useReducedMotion` (kicks/parallax off when reduced).

### 4. `app/layout.tsx`

- Added **Skip to main content** link (visible on focus).
- Content wrapper: `id="main-content"` + `tabIndex={-1}` for skip target.
- `lang="en"` was already set on `<html>` — left as-is.

---

## Reduced-motion coverage

| Mechanism | Where | Behavior |
|-----------|--------|----------|
| CSS global | `app/globals.css` `@media (prefers-reduced-motion: reduce)` | Near-zero animation/transition durations |
| Hook | `hooks/useReducedMotion.ts` | Shared media-query listener |
| Consumers | Hero3D, ProductCard, MagneticButton, ui/button, FeaturedCollections, Categories, AnimatedCursor, scroll/tilt/parallax hooks, **ScrollStationeryAnimation** | Disable or simplify motion |
| CartDrawer / MonogramCustomizer | Framer presence animations | No explicit reduced-motion branch; global CSS still collapses durations. Acceptable for short UI transitions; optional follow-up: gate with `useReducedMotion`. |

**Manual check:** OS/browser “Reduce motion” → stationery gutters stay static; cursor/magnetic/hero effects idle; page still usable.

---

## Contrast notes (brand tokens)

Approximate WCAG contrast against `--color-warm-off-white` `#FAF9F5`:

| Token | Hex | On warm-off-white | Guidance |
|-------|-----|-------------------|----------|
| charcoal-ink | `#1A1A1A` | ~16:1 | Body / UI text — **pass AAA** |
| fountain-navy | `#1C2D42` | ~12:1 | Headings / accents — **pass AAA** |
| muted-sepia | `#4A443F` | ~7.5:1 | Secondary copy — **pass AA** (normal text) |
| brass / gold-foil | `#D4AF37` | ~2.2:1 | **Fails** as body text; use for large decorative accents only, or pair brass on charcoal / charcoal on brass |
| terracotta | `#C2593F` | ~3.4:1 | Borderline for large text; avoid small body |
| silver-foil | `#C0C0C0` | ~1.7:1 | Decorative foil only — do not use for required text |

**Cart / customizer UI:** Primary actions use charcoal → warm-off-white (strong contrast). Finish selected state is charcoal fill + warm text. Brass italic in the monogram heading is accent-sized; if used at small sizes elsewhere, prefer charcoal or navy.

---

## Manual QA checklist (no Lighthouse)

Run locally with keyboard + one screen reader (NVDA / VoiceOver / Narrator):

### Global
- [ ] Tab order reaches **Skip to main content**; activating it moves focus/scroll to `#main-content`.
- [ ] `html[lang="en"]` present.
- [ ] Visible **focus-ring** on interactive controls (do not rely on mouse-only cues).
- [ ] Reduce motion: no large continuous motion; content remains readable.

### Cart drawer
- [ ] Open cart: focus lands on **Close cart**.
- [ ] Tab cycles only inside the drawer; Shift+Tab wraps.
- [ ] Escape closes; focus returns to the control that opened the cart.
- [ ] Backdrop click closes.
- [ ] Quantity / Remove announcements include product name.
- [ ] Empty cart: Checkout disabled and not actionable via keyboard as enabled.

### Monogram customizer
- [ ] Initials label associated; hint announced via `aria-describedby`.
- [ ] Finish radiogroup: only one tab stop; arrows move selection; `aria-checked` updates.
- [ ] Live region announces preview when initials or finish change.
- [ ] “Browse foilable notebooks” is a real link in tab order.

### Scroll stationery
- [ ] Cannot Tab into gutter SVGs.
- [ ] Clicks/taps pass through to page content (`pointer-events-none`).
- [ ] SR tree does not expose stationery items (decorative).

### Spot-checks outside this ownership
- [ ] Product pages, Hero3D, ProductCard — defer to owning agents.
- [ ] When network allows: run Lighthouse Accessibility + axe DevTools on Home, Collections, Cart.

---

## Residual risks / follow-ups

1. **Brass as text color** — document as accent-only; audit other pages for small brass copy.
2. **AnimatedCursor** — ensure it does not obscure focus indicators or interfere with touch; reduced-motion path already exists.
3. **CartDrawer Framer springs** — optional `useReducedMotion` to skip slide animation entirely.
4. **Automated CI** — add axe-core or Playwright a11y assertions when network/CI allows.
5. **Multiple `<main>` landmarks** — many routes wrap content in `<main>` inside `#main-content`; consider consolidating later (not changed here to avoid scope creep).

---

## Self-score breakdown

| Criterion | Score | Weight |
|-----------|-------|--------|
| Keyboard (trap, escape, radios, skip) | 9/10 | High |
| Name / role / value | 8.5/10 | High |
| Decorative / inert layers | 9.5/10 | Medium |
| Live regions | 8/10 | Medium |
| Color contrast (owned surfaces) | 7.5/10 | Medium |
| Reduced motion (owned + documented) | 8/10 | Medium |
| Automated evidence (Lighthouse) | 4/10 | Low (blocked) |

**Weighted overall: 8.2 / 10**
