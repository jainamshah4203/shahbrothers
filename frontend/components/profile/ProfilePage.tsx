"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clear);

  if (!user) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-2 text-muted-foreground">You are not logged in.</p>
        <div className="mt-4">
          <Link className="underline" href="/auth/login">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">My Profile</h1>
      <div className="mt-6 rounded border p-4">
        <div className="text-sm">
          <div><span className="text-muted-foreground">Name:</span> {user.name || '-'}</div>
          <div><span className="text-muted-foreground">Email:</span> {user.email || '-'}</div>
          {user.role && <div><span className="text-muted-foreground">Role:</span> {user.role}</div>}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/orders" className="rounded border p-4 hover:bg-accent">
          <div className="font-medium">Your Orders</div>
          <div className="text-sm text-muted-foreground">View and manage orders</div>
        </Link>
        <Link href="/orders/track" className="rounded border p-4 hover:bg-accent">
          <div className="font-medium">Track Order</div>
          <div className="text-sm text-muted-foreground">Track by ID and email</div>
        </Link>
        <button
          className="rounded border p-4 text-left hover:bg-accent"
          onClick={() => {
            try {
              localStorage.removeItem("niraya_token");
              localStorage.removeItem("niraya_user");
            } catch {}
            clearAuth();
          }}
        >
          <div className="font-medium">Logout</div>
          <div className="text-sm text-muted-foreground">Sign out of your account</div>
        </button>
      </div>
    </div>
  );
}
