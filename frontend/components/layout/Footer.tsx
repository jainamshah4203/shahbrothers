"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Twitter, Mail } from "lucide-react";

const SHOP_LINKS = [
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Writing Instruments", href: "/collections?category=Writing%20Instruments" },
  { label: "Notebooks & Paper", href: "/collections?category=Notebooks" },
  { label: "Desk Accessories", href: "/collections?category=Desk%20Accessories" },
  { label: "Sale", href: "/collections?sale=1" },
] as const;

const CARE_LINKS = [
  { label: "Contact Us", href: "/contact" },
  { label: "Return Policy", href: "/return-policy" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/journal" },
] as const;

/**
 * Editorial footer — brand manifesto + envelope-style newsletter.
 */
export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;
      setSubmitted(true);
    },
    [email]
  );

  return (
    <footer className="border-t border-charcoal-ink/8 bg-cream paper-grain">
      <div className="container relative z-[1] mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Manifesto + newsletter */}
          <div className="lg:col-span-6">
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-3 font-serif text-3xl font-medium tracking-tight text-charcoal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              <Image
                src="/logo.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-sm object-cover"
              />
              Shah{" "}
              <em className="italic-accent text-fountain-navy">Brothers</em>
            </Link>

            <p className="max-w-md font-serif text-lg leading-relaxed text-muted-sepia md:text-xl">
              We believe a desk should feel like a quiet atelier — ink, paper,
              and objects chosen with care for the work that matters.
            </p>

            {/* Envelope newsletter */}
            <form
              onSubmit={handleSubscribe}
              className="mt-8 max-w-md overflow-hidden rounded-[2px] border border-charcoal-ink/12 bg-warm-off-white shadow-paper"
              aria-label="Newsletter signup"
            >
              <div className="border-b border-dashed border-charcoal-ink/15 px-4 py-2">
                <span className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-sepia">
                  To: Shah Brothers Journal
                </span>
              </div>
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <label htmlFor="footer-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="footer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSubmitted(false);
                  }}
                  placeholder="your@email.com"
                  className="flex-1 rounded-md bg-cream/60 px-2 py-1.5 font-sans text-sm tracking-tight text-charcoal-ink placeholder:text-muted-sepia/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-charcoal-ink px-5 py-2.5 font-sans text-sm text-warm-off-white transition-colors hover:bg-fountain-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-warm-off-white"
                >
                  {submitted ? "Sealed" : "Send"}
                </button>
              </div>
            </form>
            <p className="mt-3 font-sans text-xs text-muted-sepia">
              New collections, foil drops, and atelier notes — no clutter.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:col-span-6 lg:grid-cols-2">
            <div>
              <h4 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-charcoal-ink">
                Shop
              </h4>
              <ul className="space-y-2.5">
                {SHOP_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-sans text-sm text-muted-sepia transition-colors hover:text-charcoal-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-charcoal-ink">
                House
              </h4>
              <ul className="space-y-2.5">
                {CARE_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-sans text-sm text-muted-sepia transition-colors hover:text-charcoal-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-charcoal-ink/8 pt-8 md:flex-row md:items-center">
          <p className="font-sans text-sm text-muted-sepia">
            © {new Date().getFullYear()} Shah Brothers. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {[
              { Icon: Instagram, label: "Instagram", href: "#" },
              { Icon: Facebook, label: "Facebook", href: "#" },
              { Icon: Twitter, label: "Twitter", href: "#" },
              { Icon: Mail, label: "Email", href: "/contact" },
            ].map(({ Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-sepia transition-colors hover:bg-linen hover:text-charcoal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
