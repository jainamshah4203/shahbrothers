import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Protected from "@/components/auth/Protected";
import OrderDetailsPage from "@/components/orders/OrderDetailsPage";

export default function Page() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Protected>
          <OrderDetailsPage />
        </Protected>
      </main>
      <Footer />
    </div>
  );
}
