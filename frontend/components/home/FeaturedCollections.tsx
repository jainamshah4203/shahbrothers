import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRevealAnimation } from "@/hooks/useRevealAnimation";
import { useTiltEffect } from "@/hooks/useTiltEffect";

const CollectionCard = ({ collection, index }: { collection: any; index: number }) => {
  const revealRef = useRevealAnimation<HTMLDivElement>({ preset: "fadeUp", delay: index * 0.1 });
  const tiltRef = useTiltEffect<HTMLDivElement>({ scale: 1.02 });

  return (
    <div ref={revealRef}>
      <Card 
        ref={tiltRef}
        className="product-card group cursor-pointer border-none shadow-none bg-warm-white-50 overflow-hidden rounded-token-lg h-full flex flex-col"
      >
        <div className="relative overflow-hidden h-80">
          <Image
            src={collection.image}
            alt={collection.title}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover transition-transform duration-700"
            priority={index < 2}
          />
          {collection.isNew && (
            <div className="absolute top-4 left-4 bg-soft-black-900 text-warm-white-50 px-3 py-1 text-xs font-semibold rounded-full shadow-elevation-1">
              NEW
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
        </div>
        
        <div className="p-6 bg-warm-white-50 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-ds-subtitle font-serif text-soft-black-900 mb-2">{collection.title}</h3>
            <p className="text-ds-body text-warm-gray-500 mb-4">{collection.description}</p>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-ds-caption text-warm-gray-500">
              {collection.itemCount} items
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="group/btn text-wood-700 hover:text-wood-900 hover:bg-wood-100/50"
            >
              Explore
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const FeaturedCollections = () => {
  const headerRevealRef = useRevealAnimation<HTMLDivElement>({ preset: "fadeUp" });

  const collections = [
    {
      id: 1,
      title: "Writing Instruments",
      description: "Premium pens and pencils for every style",
      image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=800&q=80",
      itemCount: 45,
    },
    {
      id: 2,
      title: "Desk Accessories",
      description: "Staplers, punches, and organizers",
      image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=1200&q=80",
      itemCount: 30,
      isNew: true,
    },
    {
      id: 3,
      title: "Art Supplies",
      description: "Colors, markers, and sketchbooks",
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2080&auto=format&fit=crop",
      itemCount: 32,
    },
  ];
  return (
    <section className="py-20 bg-warm-white-100">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div ref={headerRevealRef} className="text-center mb-16">
          <h2 className="text-ds-section font-serif text-soft-black-900 mb-4">
            Shop by Style
          </h2>
          <p className="text-ds-subtitle text-warm-gray-500 max-w-2xl mx-auto">
            Curated edits to help you find the perfect look.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {collections.map((collection, index) => (
            <CollectionCard key={collection.id} collection={collection} index={index} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" variant="outline" className="group border-warm-gray-300 text-soft-black-900 hover:bg-warm-gray-100 rounded-full px-8 py-6 text-ds-product shadow-elevation-1">
            View All Collections
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;