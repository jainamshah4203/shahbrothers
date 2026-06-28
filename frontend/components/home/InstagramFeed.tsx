import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram, ExternalLink } from "lucide-react";
import Image from "next/image";

const InstagramFeed = () => {
  // Mock Instagram posts data
  const instagramPosts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=400&q=80",
      caption: "Effortless summer styling with our linen collection",
      likes: 1247,
      date: "2 days ago",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=400&q=80",
      caption: "Behind the scenes at our latest photoshoot",
      likes: 892,
      date: "4 days ago",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1580651214613-f4692d6d138f?q=80&w=686&auto=format&fit=crop&w=400&q=80",
      caption: "The perfect weekend look featuring our bestseller",
      likes: 1856,
      date: "1 week ago",
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=400&q=80",
      caption: "Sustainable fashion that doesn't compromise on style",
      likes: 2103,
      date: "1 week ago",
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1485518882345-15568b007407?auto=format&fit=crop&w=400&q=80",
      caption: "From desk to dinner in our versatile pieces",
      likes: 1432,
      date: "2 weeks ago",
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=687&auto=format&fit=crop&w=400&q=80",
      caption: "New arrivals are here! Which is your favorite?",
      likes: 3241,
      date: "2 weeks ago",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Instagram className="h-8 w-8 mr-3" />
            <h2 className="text-4xl md:text-5xl font-serif">
              @ecom.store
            </h2>
          </div>
          <p className="text-lg text-muted-foreground">
            Follow our journey and get styled with Shah Brothers
          </p>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {instagramPosts.map((post, index) => (
            <Card 
              key={post.id}
              className="group cursor-pointer border-none shadow-none bg-transparent overflow-hidden"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={post.image}
                  alt={`Instagram post ${post.id}`}
                  fill
                  sizes="(max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-white text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Instagram className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium">{post.likes.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Follow CTA */}
        <div className="text-center">
          <Button size="lg" className="group">
            <Instagram className="mr-2 h-5 w-5" />
            Follow @ecom.store
            <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;