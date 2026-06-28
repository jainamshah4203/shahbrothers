"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, Menu, X, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useCartStore, type CartState } from "@/store/cart";
import { useWishlistStore, type WishlistState } from "@/store/wishlist";
import { useUIStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";

interface HeaderProps {
  cartItemsCount?: number;
}

const Header = ({ cartItemsCount = 0 }: HeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const openMiniCart = useUIStore((s) => s.openMiniCart);
  const authUser = useAuthStore((s) => s.user);
  const isAuthed = useAuthStore((s) => s.isAuthenticated());
  const clearAuth = useAuthStore((s) => s.clear);
  // Ensure client-only values (Zustand persisted stores) render after mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Live counts from stores
  const cartCount = useCartStore((s: CartState) => s.count());
  const wishlistCount = useWishlistStore((s: WishlistState) => s.ids.length);

  const navigationItems = [
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "Collections", href: "/collections" },
    { label: "About", href: "/about" },
    { label: "Journal", href: "/journal" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => pathname === path;

  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        {/* Top announcement bar */}
        <div className="text-center py-2 text-sm text-muted-foreground border-b border-border/50">
          Free shipping on orders over ₹1500 • 7-day replacement policy • Secure checkout
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Mobile menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="flex flex-col space-y-6 mt-8">
                  <Link href="/" className="flex items-center text-2xl font-serif font-semibold">
                    <Image src="/logo.png" alt="SB Logo" width={32} height={32} className="h-8 w-8 mr-2 rounded-md object-cover" />
                    Shah Brothers
                  </Link>
                  <nav className="flex flex-col space-y-4">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`text-lg transition-colors ${
                          isActive(item.href)
                            ? "text-primary font-medium"
                            : "text-foreground hover:text-primary"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center text-2xl lg:text-3xl font-serif font-semibold">
            <Image src="/logo.png" alt="SB Logo" width={40} height={40} className="h-10 w-10 mr-3 rounded-md object-cover" />
            Shah Brothers
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition-colors relative ${
                  isActive(item.href)
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hidden sm:flex"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* User account (gate on mount to avoid SSR/CSR mismatch) */}
            {!mounted ? (
              <Button variant="ghost" size="icon" className="hidden sm:flex" asChild>
                <Link href="/auth/login" aria-label="Account">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            ) : !isAuthed ? (
              <Button variant="ghost" size="icon" className="hidden sm:flex" asChild>
                <Link href="/auth/login" aria-label="Account">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <div className="relative hidden sm:flex items-center gap-2">
                <button
                  className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium"
                  title={authUser?.name || authUser?.email}
                  onClick={() => setProfileOpen((v) => !v)}
                >
                  {(authUser?.name || authUser?.email || "U").slice(0, 2).toUpperCase()}
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-10 z-50 w-48 rounded-md border bg-popover text-popover-foreground shadow">
                    <div className="py-1 text-sm">
                      <Link href="/profile" className="block px-3 py-2 hover:bg-accent hover:text-accent-foreground" onClick={() => setProfileOpen(false)}>Profile</Link>
                      <Link href="/orders" className="block px-3 py-2 hover:bg-accent hover:text-accent-foreground" onClick={() => setProfileOpen(false)}>Your Orders</Link>
                      <Link href="/orders/track" className="block px-3 py-2 hover:bg-accent hover:text-accent-foreground" onClick={() => setProfileOpen(false)}>Track Order</Link>
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                        onClick={() => {
                          try {
                            localStorage.removeItem("niraya_token");
                            localStorage.removeItem("niraya_user");
                          } catch {}
                          clearAuth();
                          setProfileOpen(false);
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="hidden sm:flex relative" asChild>
              <Link href="/wishlist" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
                {mounted && wishlistCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" onClick={openMiniCart} aria-label="Cart">
              <ShoppingBag className="h-5 w-5" />
              {mounted && (cartItemsCount || cartCount) > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
                >
                  {cartCount || cartItemsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Search bar */}
        {isSearchOpen && (
          <div className="pb-4 animate-fade-in-up">
            <form
              className="relative max-w-md mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
                const q = query.trim();
                if (q.length > 0) {
                  router.push(`/collections?q=${encodeURIComponent(q)}`);
                  setIsSearchOpen(false);
                }
              }}
            >
              <Input
                placeholder="Search for products..."
                className="elegant-input pr-10"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-12 top-1/2 -translate-y-1/2"
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;