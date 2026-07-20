import CheckoutPage from "@/components/checkout/CheckoutPage";
import Protected from "@/components/auth/Protected";

export default function Page() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <Protected>
          <CheckoutPage />
        </Protected>
      </main>
    </div>
  );
}
