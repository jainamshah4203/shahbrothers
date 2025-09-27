import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Page() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold">My Account</h1>
        <p className="text-muted-foreground mt-2">Orders, saved items and profile.</p>
      </main>
      <Footer />
    </div>
  );
}
