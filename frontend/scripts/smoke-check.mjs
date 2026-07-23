#!/usr/bin/env node
/**
 * Lightweight Wave 1–2 smoke check — no app/framework imports.
 * Usage: node scripts/smoke-check.mjs
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");

const requiredFiles = [
  "components/home/Hero.tsx",
  "components/Hero3D/Hero3D.tsx",
  "components/product/ProductCard.tsx",
  "components/MagneticButton/MagneticButton.tsx",
  "components/ui/button.tsx",
  "components/cart/CartDrawer.tsx",
  "components/customizer/MonogramCustomizer.tsx",
  "hooks/useReducedMotion.ts",
  "hooks/useTiltEffect.ts",
  "hooks/useMagneticEffect.ts",
  "lib/animations.ts",
  "docs/manual-qa-checklist.md",
];

const gsapConsumers = [
  "hooks/useTiltEffect.ts",
  "hooks/useMagneticEffect.ts",
  "hooks/useRevealAnimation.ts",
  "hooks/useSmoothScroll.ts",
  "hooks/useScrollAnim.ts",
  "hooks/useParallax.ts",
  "lib/animations.ts",
];

/** @type {string[]} */
const failures = [];

for (const rel of requiredFiles) {
  const abs = join(root, rel);
  if (!existsSync(abs)) {
    failures.push(`missing required file: ${rel}`);
  }
}

const homePage = join(root, "app/HomePage.tsx");
if (existsSync(homePage)) {
  const src = readFileSync(homePage, "utf8");
  if (!src.includes('from "@/components/home/Hero"') && !src.includes("from '@/components/home/Hero'")) {
    failures.push("app/HomePage.tsx does not import @/components/home/Hero (dual-hero risk)");
  }
  if (src.includes("HeroSection")) {
    failures.push("app/HomePage.tsx still references HeroSection (dual-hero risk)");
  }
}

for (const rel of gsapConsumers) {
  const abs = join(root, rel);
  if (!existsSync(abs)) {
    failures.push(`missing gsap consumer: ${rel}`);
    continue;
  }
  const src = readFileSync(abs, "utf8");
  if (!src.includes(".gsap")) {
    failures.push(`${rel} no longer references .gsap (motion token break risk)`);
  }
}

const animations = join(root, "lib/animations.ts");
if (existsSync(animations)) {
  const src = readFileSync(animations, "utf8");
  if (!/export const motionTokens/.test(src)) {
    failures.push("lib/animations.ts missing export const motionTokens");
  }
  if (!/\bgsap:\s*\{/.test(src)) {
    failures.push("lib/animations.ts missing gsap: { ... } token shape");
  }
}

function walkTsFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const st = statSync(abs);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      walkTsFiles(abs, out);
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(abs);
    }
  }
  return out;
}

// Soft warning: spreading motionTokens.* without .gsap into gsap calls is hard to detect;
 // flag suspicious "motionTokens.<token>," spreads that are not ".gsap"
const suspicious = [];
for (const abs of walkTsFiles(join(root, "hooks"))) {
  const src = readFileSync(abs, "utf8");
  const rel = relative(root, abs).replace(/\\/g, "/");
  const bad = src.match(/motionTokens\.\w+(?!\.gsap)(?!\.framer)(?!\])/g);
  // Allow motionTokens[token] and motionTokens.x.gsap — only flag bare token used as 2nd arg-ish
  if (/gsap\.(to|from|fromTo|quickTo)\([^)]*motionTokens\.\w+\s*[,}]/.test(src)) {
    suspicious.push(`${rel}: possible gsap call spreading root motion token`);
  }
  void bad;
}

if (failures.length) {
  console.error("smoke-check FAILED\n");
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}

console.log("smoke-check OK");
console.log(`  checked ${requiredFiles.length} required files`);
console.log(`  verified .gsap references in ${gsapConsumers.length} consumers`);
if (suspicious.length) {
  console.log("  warnings:");
  for (const s of suspicious) console.log(`    ! ${s}`);
}
process.exit(0);
