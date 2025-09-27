import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WishlistPage from "@/components/wishlist/WishlistPage";

export default function Page() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold">Wishlist</h1>
        <p className="text-muted-foreground mt-2 mb-6">Your saved items will appear here.</p>
        <WishlistPage />
      </main>
      <Footer />
    </div>
  );
}
