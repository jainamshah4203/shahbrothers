"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/auth";
import {
  LayoutDashboard,
  Package,
  Layers3,
  ShoppingCart,
  Users,
  FolderTree,
  TicketPercent,
  Image as ImageIcon,
  MessageSquareMore,
  LogOut,
} from "lucide-react";

const navItems = [
  // Products group handled separately below
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/coupons", label: "Coupons", icon: TicketPercent },
  { href: "/media", label: "Media", icon: ImageIcon },
  { href: "/reviews", label: "Reviews", icon: MessageSquareMore },
];

function SidebarLink({ href, label, icon: Icon, active }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
        active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const brand = (process.env.NEXT_PUBLIC_COMPANY_NAME as string) || 'Shah Brothers';
  const pathname = usePathname();
  const router = useRouter();
  const [openProducts, setOpenProducts] = React.useState<boolean>(pathname?.startsWith("/products") ?? false);
  const [openCategories, setOpenCategories] = useState(true);

  async function onLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white">
        <div className="h-14 border-b px-4 flex items-center font-semibold">{brand} Admin</div>
        <nav className="flex-1 p-2 space-y-1">
          {/* Dashboard */}
          <SidebarLink href="/dashboard" label="Dashboard" icon={LayoutDashboard} active={pathname === "/dashboard"} />

          {/* Category group */}
          <button
            className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-sm ${
              pathname?.startsWith("/categories") ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setOpenCategories((v) => !v)}
          >
            <span className="flex items-center gap-2"><FolderTree className="h-4 w-4" /> Category</span>
            <span className="text-xs">{openCategories ? "▾" : "▸"}</span>
          </button>
          {openCategories && (
            <div className="ml-6 space-y-1">
              <SidebarLink href="/categories/new" label="Add Category" icon={FolderTree} active={pathname === "/categories/new"} />
              <SidebarLink href="/categories" label="All Category" icon={FolderTree} active={pathname === "/categories"} />
            </div>
          )}

          {/* Products group */}
          <button
            className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-sm ${
              pathname?.startsWith("/products") ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setOpenProducts((v) => !v)}
          >
            <span className="flex items-center gap-2"><Package className="h-4 w-4" /> Products</span>
            <span className="text-xs">{openProducts ? "▾" : "▸"}</span>
          </button>
          {openProducts && (
            <div className="ml-2 pl-3 border-l space-y-1">
              <SidebarLink href="/products/new" label="Add Product" icon={Package} active={pathname === "/products/new"} />
              <SidebarLink href="/products/variants/new" label="Add Variant" icon={Layers3} active={pathname === "/products/variants/new"} />
              <SidebarLink href="/products" label="All Products" icon={Package} active={pathname === "/products"} />
              <SidebarLink href="/products/variants" label="Product Variants" icon={Layers3} active={pathname === "/products/variants"} />
            </div>
          )}

          {/* Rest */}
          {navItems.map((n) => (
            <SidebarLink key={n.href} href={n.href} label={n.label} icon={n.icon} active={pathname?.startsWith(n.href)} />
          ))}
        </nav>
        <div className="p-3 border-t">
          <Button variant="outline" className="w-full flex items-center gap-2" onClick={onLogout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar (mobile) */}
        <header className="md:hidden border-b px-4 h-12 flex items-center justify-between">
          <div className="font-semibold">{brand} Admin</div>
          <Button size="sm" variant="outline" onClick={onLogout}>Logout</Button>
        </header>
        <main className="p-3 md:p-4">{children}</main>
      </div>
    </div>
  );
}
