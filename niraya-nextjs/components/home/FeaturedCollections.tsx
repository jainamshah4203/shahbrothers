import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const FeaturedCollections = () => {
  const collections = [
    {
      id: 1,
      title: "New Arrivals",
      description: "Timeless pieces for everyday elegance",
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
      itemCount: 24,
    },
    {
      id: 2,
      title: "Limited Editions",
      description: "Fresh styles for the season",
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80",
      itemCount: 18,
      isNew: true,
    },
    {
      id: 3,
      title: "Best Sellers",
      description: "Light fabrics and breezy silhouettes",
      image: "https://plus.unsplash.com/premium_photo-1668319915382-4b87088b8a94?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      itemCount: 32,
    },
  ];
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-serif mb-4">
            Shop by Style
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Curated edits to help you find the perfect look.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {collections.map((collection, index) => (
            <Card 
              key={collection.id}
              className="product-card group cursor-pointer border-none shadow-none bg-card overflow-hidden"
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {collection.isNew && (
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-full">
                    NEW
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-serif mb-2">{collection.title}</h3>
                <p className="text-muted-foreground mb-4">{collection.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {collection.itemCount} items
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="group/btn"
                  >
                    Explore
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" variant="outline" className="group">
            View All Collections
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;