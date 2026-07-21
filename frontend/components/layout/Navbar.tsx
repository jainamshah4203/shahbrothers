"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Heart, User, Menu, X, Package } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCartStore, type CartState } from "@/store/cart";
import { useWishlistStore, type WishlistState } from "@/store/wishlist";
import { useUIStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
] as const;

/**
 * Floating translucent luxury navigation — glass on warm off-white.
 */
export const Navbar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const openMiniCart = useUIStore((s) => s.openMiniCart);
  const authUser = useAuthStore((s) => s.user);
  const isAuthed = useAuthStore((s) => s.isAuthenticated());
  const clearAuth = useAuthStore((s) => s.clear);
  const cartCount = useCartStore((s: CartState) => s.count());
  const wishlistCount = useWishlistStore((s: WishlistState) => s.ids.length);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = query.trim();
      if (!q) return;
      router.push(`/collections?q=${encodeURIComponent(q)}`);
      setSearchOpen(false);
      setQuery("");
    },
    [query, router]
  );

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem("niraya_token");
      localStorage.removeItem("niraya_user");
    } catch {
      /* ignore */
    }
    clearAuth();
    setProfileOpen(false);
  }, [clearAuth]);

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background,box-shadow,backdrop-filter] duration-500",
        scrolled ? "glass-nav" : "bg-warm-off-white/40 backdrop-blur-md"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3.5 lg:py-4">
          {/* Mobile menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal-ink transition-colors hover:bg-linen focus-ring"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 border-none bg-warm-off-white paper-grain"
              >
                <div className="mt-10 flex flex-col gap-8">
                  <Link
                    href="/"
                    className="font-serif text-2xl font-medium tracking-tight text-charcoal-ink"
                  >
                    Shah Brothers
                  </Link>
                  <nav className="flex flex-col gap-1" aria-label="Mobile">
                    {NAV_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "rounded-md px-3 py-3 font-sans text-base tracking-tight transition-colors",
                          isActive(item.href)
                            ? "bg-cream text-charcoal-ink"
                            : "text-muted-sepia hover:bg-linen hover:text-charcoal-ink"
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Brand */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 focus-ring rounded-sm"
            aria-label="Shah Brothers home"
          >
            <Image
              src="/logo.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-sm object-cover"
            />
            <span className="font-serif text-xl font-medium tracking-tight text-charcoal-ink sm:text-2xl">
              Shah{" "}
              <em className="italic-accent font-normal text-fountain-navy">
                Brothers
              </em>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden items-center gap-8 lg:flex"
            aria-label="Primary"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative font-sans text-[0.8rem] font-medium uppercase tracking-[0.14em] transition-colors",
                  isActive(item.href)
                    ? "text-charcoal-ink"
                    : "text-muted-sepia hover:text-charcoal-ink"
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-brass"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="hidden h-10 w-10 items-center justify-center rounded-full text-charcoal-ink transition-colors hover:bg-linen focus-ring sm:flex"
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
            >
              {searchOpen ? (
                <X className="h-[18px] w-[18px]" />
              ) : (
                <Search className="h-[18px] w-[18px]" />
              )}
            </button>

            {!mounted || !isAuthed ? (
              <Link
                href="/auth/login"
                className="hidden h-10 w-10 items-center justify-center rounded-full text-charcoal-ink transition-colors hover:bg-linen focus-ring sm:flex"
                aria-label="Account"
              >
                <User className="h-[18px] w-[18px]" />
              </Link>
            ) : (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-fountain-navy font-sans text-[0.65rem] font-medium tracking-wide text-warm-off-white focus-ring"
                  title={authUser?.name || authUser?.email}
                  aria-expanded={profileOpen}
                  onClick={() => setProfileOpen((v) => !v)}
                >
                  {(authUser?.name || authUser?.email || "U")
                    .slice(0, 2)
                    .toUpperCase()}
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-md bg-warm-off-white shadow-paper"
                    >
                      <div className="py-1 font-sans text-sm text-charcoal-ink">
                        <Link
                          href="/profile"
                          className="block px-3 py-2 hover:bg-cream"
                          onClick={() => setProfileOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          href="/orders"
                          className="block px-3 py-2 hover:bg-cream"
                          onClick={() => setProfileOpen(false)}
                        >
                          Your Orders
                        </Link>
                        <Link
                          href="/orders/track"
                          className="block px-3 py-2 hover:bg-cream"
                          onClick={() => setProfileOpen(false)}
                        >
                          Track Order
                        </Link>
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-cream"
                          onClick={handleLogout}
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <Link
              href="/wishlist"
              className="relative hidden h-10 w-10 items-center justify-center rounded-full text-charcoal-ink transition-colors hover:bg-linen focus-ring sm:flex"
              aria-label={`Wishlist${mounted && wishlistCount > 0 ? `, ${wishlistCount} items` : ""}`}
            >
              <Heart className="h-[18px] w-[18px]" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracotta px-1 font-sans text-[0.6rem] font-semibold text-warm-off-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={openMiniCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-charcoal-ink transition-colors hover:bg-linen focus-ring"
              aria-label={`Cart${mounted && cartCount > 0 ? `, ${cartCount} items` : ""}`}
            >
              <Package className="h-[18px] w-[18px]" strokeWidth={1.6} />
              {mounted && cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-fountain-navy px-1 font-sans text-[0.6rem] font-semibold text-warm-off-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleSearchSubmit}
                className="mx-auto flex max-w-lg items-center gap-2 pb-4"
                role="search"
              >
                <label htmlFor="nav-search" className="sr-only">
                  Search products
                </label>
                <input
                  id="nav-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pens, notebooks, foil…"
                  autoFocus
                  className="w-full rounded-full border border-charcoal-ink/15 bg-cream/80 px-5 py-2.5 font-sans text-sm tracking-tight text-charcoal-ink placeholder:text-muted-sepia/70 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-charcoal-ink px-5 py-2.5 font-sans text-sm text-warm-off-white transition-colors hover:bg-fountain-navy focus-ring"
                >
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;
