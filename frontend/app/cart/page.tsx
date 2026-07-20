import CartPage from "@/components/cart/CartPage";

export default function Page() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold">Your Cart</h1>
        <p className="text-muted-foreground mt-2 mb-6">Review items and proceed to checkout.</p>
        <CartPage />
      </main>
    </div>
  );
}
