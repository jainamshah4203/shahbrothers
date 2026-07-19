import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Page() {
  const articles = [
    {
      id: 1,
      title: "The Art of Handwriting: Why We Still Need Pens",
      excerpt: "In a digital age, putting pen to paper offers a unique cognitive benefit and a touch of personal elegance.",
      image: "https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=800&q=80",
      date: "July 12, 2026",
      category: "Writing Tools",
    },
    {
      id: 2,
      title: "Organizing Your Desk for Maximum Productivity",
      excerpt: "A cluttered desk leads to a cluttered mind. Discover minimal accessories that transform your workspace.",
      image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80",
      date: "July 05, 2026",
      category: "Workspace",
    },
    {
      id: 3,
      title: "Choosing the Right Notebook for Bullet Journaling",
      excerpt: "From GSM to binding types, here is everything you need to consider before starting your next journal.",
      image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=80",
      date: "June 28, 2026",
      category: "Paper & Notebooks",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">The Journal</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stories, tips, and inspiration for stationery lovers and modern professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <article key={article.id} className="group cursor-pointer">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-6">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center text-sm text-muted-foreground mb-3 space-x-4">
                <span className="uppercase tracking-wider font-medium text-primary">{article.category}</span>
                <span>•</span>
                <span>{article.date}</span>
              </div>
              <h2 className="text-2xl font-serif mb-3 group-hover:text-primary transition-colors">
                {article.title}
              </h2>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {article.excerpt}
              </p>
              <Link href="#" className="inline-flex items-center text-sm font-medium hover:text-primary transition-colors">
                Read Article
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
