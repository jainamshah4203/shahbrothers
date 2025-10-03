import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import OrdersPage from "@/components/orders/OrdersPage";
import Protected from "@/components/auth/Protected";

export default function Page() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Protected>
          <OrdersPage />
        </Protected>
      </main>
      <Footer />
    </div>
  );
}
