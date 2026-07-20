import Protected from "@/components/auth/Protected";
import ProfilePage from "@/components/profile/ProfilePage";

export default function Page() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <Protected>
          <ProfilePage />
        </Protected>
      </main>
    </div>
  );
}
