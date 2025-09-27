import { redirect } from "next/navigation";

export const metadata = {
  title: "New Arrivals | NIRAYA",
  description: "Just in — premium fashion drops, updated weekly. Shop the latest in INR.",
  openGraph: { title: "New Arrivals", type: "website" },
  twitter: { card: "summary_large_image", title: "New Arrivals | NIRAYA" },
};

export default function Page() {
  redirect('/');
}
