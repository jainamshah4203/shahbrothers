import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Page() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold">About NIRAYA</h1>
        <p className="text-muted-foreground mt-2">Premium Indian fashion brand with a focus on quality and design.</p>
      </main>
      <Footer />
    </div>
  );
}
