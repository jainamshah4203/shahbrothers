import { Suspense } from "react";
import RegisterForm from "@/components/auth/RegisterForm";

export default function Page() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="text-muted-foreground mt-2 mb-6">Join to track orders and manage your wishlist.</p>
        <Suspense fallback={<div className="h-40 animate-pulse bg-muted rounded-md" />}>
          <RegisterForm />
        </Suspense>
      </main>
    </div>
  );
}
