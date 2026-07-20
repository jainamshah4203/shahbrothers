import OrdersPage from "@/components/orders/OrdersPage";
import Protected from "@/components/auth/Protected";

export default function Page() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <Protected>
          <OrdersPage />
        </Protected>
      </main>
    </div>
  );
}
