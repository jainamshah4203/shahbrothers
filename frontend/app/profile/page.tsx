import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Protected from "@/components/auth/Protected";
import ProfilePage from "@/components/profile/ProfilePage";

export default function Page() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Protected>
          <ProfilePage />
        </Protected>
      </main>
      <Footer />
    </div>
  );
}
