"use client";

import React, { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type FoilFinish = "gold" | "silver" | "deboss";

interface MonogramCustomizerProps {
  className?: string;
  coverImage?: string;
  onChange?: (value: { initials: string; finish: FoilFinish }) => void;
}

const FINISHES: { id: FoilFinish; label: string }[] = [
  { id: "gold", label: "Gold Foil" },
  { id: "silver", label: "Silver Foil" },
  { id: "deboss", label: "Blind Deboss" },
];

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80";

/**
 * Live monogram / foil preview — up to 3 initials over a notebook cover.
 */
export const MonogramCustomizer: React.FC<MonogramCustomizerProps> = ({
  className,
  coverImage = DEFAULT_COVER,
  onChange,
}) => {
  const [initials, setInitials] = useState("SB");
  const [finish, setFinish] = useState<FoilFinish>("gold");

  const display = useMemo(
    () => initials.toUpperCase().slice(0, 3) || "·",
    [initials]
  );

  const handleInitialsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value
        .replace(/[^a-zA-Z]/g, "")
        .slice(0, 3)
        .toUpperCase();
      setInitials(next);
      onChange?.({ initials: next, finish });
    },
    [finish, onChange]
  );

  const handleFinishChange = useCallback(
    (next: FoilFinish) => {
      setFinish(next);
      onChange?.({ initials, finish: next });
    },
    [initials, onChange]
  );

  const foilClass =
    finish === "gold"
      ? "foil-gold"
      : finish === "silver"
        ? "foil-silver"
        : "text-charcoal-ink/35";

  return (
    <section
      className={cn("section-spacing bg-warm-off-white", className)}
      aria-labelledby="monogram-heading"
    >
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <p className="mb-3 font-sans text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-sepia">
              Make it yours
            </p>
            <h2
              id="monogram-heading"
              className="font-serif text-ds-section text-charcoal-ink"
            >
              Personalized{" "}
              <em className="italic-accent text-brass">Foil</em>
            </h2>
            <p className="mt-4 max-w-md font-sans text-base leading-[1.7] text-muted-sepia">
              Stamp up to three initials in metallic gold, silver, or a quiet
              blind deboss — preview live on the cover.
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <label
                  htmlFor="monogram-initials"
                  className="mb-2 block font-sans text-xs font-medium uppercase tracking-[0.16em] text-muted-sepia"
                >
                  Initials
                </label>
                <input
                  id="monogram-initials"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  maxLength={3}
                  value={initials}
                  onChange={handleInitialsChange}
                  aria-describedby="monogram-hint"
                  className="w-full max-w-[200px] rounded-md border border-charcoal-ink/15 bg-warm-off-white px-4 py-3 font-serif text-2xl tracking-[0.2em] text-charcoal-ink focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
                />
                <p id="monogram-hint" className="mt-2 font-sans text-xs text-muted-sepia">
                  Up to 3 letters
                </p>
              </div>

              <fieldset>
                <legend className="mb-3 font-sans text-xs font-medium uppercase tracking-[0.16em] text-muted-sepia">
                  Finish
                </legend>
                <div className="flex flex-wrap gap-2" role="radiogroup">
                  {FINISHES.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      role="radio"
                      aria-checked={finish === f.id}
                      onClick={() => handleFinishChange(f.id)}
                      className={cn(
                        "rounded-full border px-4 py-2 font-sans text-sm tracking-tight transition-colors focus-ring",
                        finish === f.id
                          ? "border-charcoal-ink bg-charcoal-ink text-warm-off-white"
                          : "border-charcoal-ink/25 bg-transparent text-charcoal-ink hover:border-charcoal-ink"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <Link href="/collections?q=foil" className="btn-outline-pill inline-flex">
                Browse foilable notebooks
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <motion.div
              className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2px] bg-linen shadow-paper debossed"
              layout
            >
              <Image
                src={coverImage}
                alt="Notebook cover preview"
                fill
                className="object-cover"
                sizes="(min-width:1024px) 40vw, 90vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-ink/25 via-transparent to-transparent" />

              <motion.div
                key={`${display}-${finish}`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center justify-center"
                aria-live="polite"
              >
                <span
                  className={cn(
                    "select-none font-serif text-[clamp(2.5rem,8vw,4.5rem)] font-medium tracking-[0.28em]",
                    foilClass,
                    finish === "deboss" &&
                      "drop-shadow-[0_1px_0_rgba(255,255,255,0.25)]"
                  )}
                  style={
                    finish === "deboss"
                      ? {
                          textShadow:
                            "0 1px 0 rgba(255,255,255,0.2), 0 -1px 1px rgba(26,26,26,0.35)",
                        }
                      : undefined
                  }
                >
                  {display}
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MonogramCustomizer;
