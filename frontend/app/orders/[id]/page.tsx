import Protected from "@/components/auth/Protected";
import OrderDetailsPage from "@/components/orders/OrderDetailsPage";

export default function Page() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <Protected>
          <OrderDetailsPage />
        </Protected>
      </main>
    </div>
  );
}
