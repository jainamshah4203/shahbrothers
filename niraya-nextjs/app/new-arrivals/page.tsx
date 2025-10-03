import { redirect } from "next/navigation";

export const metadata = {
  title: "New Arrivals | ecom-store",
  description: "Just in — premium fashion drops, updated weekly. Shop the latest in INR.",
  openGraph: { title: "New Arrivals", type: "website" },
  twitter: { card: "summary_large_image", title: "New Arrivals | ecom-store" },
};

export default function Page() {
  redirect('/');
}
