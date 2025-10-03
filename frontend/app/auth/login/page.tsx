import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoginForm from "@/components/auth/LoginForm";

export default function Page() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-muted-foreground mt-2 mb-6">Access your account to manage orders and wishlist.</p>
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
}
