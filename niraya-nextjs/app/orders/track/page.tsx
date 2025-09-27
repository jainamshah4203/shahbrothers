import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TrackOrderPage from "@/components/orders/TrackOrderPage";

export default function Page() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <TrackOrderPage />
      </main>
      <Footer />
    </div>
  );
}
