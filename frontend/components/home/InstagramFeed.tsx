import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram, ExternalLink } from "lucide-react";
import Image from "next/image";

const InstagramFeed = () => {
  // Mock Instagram posts data
  const instagramPosts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=400&q=80",
      caption: "Elevate your writing experience with our premium pens",
      likes: 1247,
      date: "2 days ago",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
      caption: "New arrivals in our notebook collection",
      likes: 892,
      date: "4 days ago",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80",
      caption: "Unleash your creativity with our watercolor sets",
      likes: 1856,
      date: "1 week ago",
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
      caption: "Brighten up your notes with these vibrant highlighters",
      likes: 2103,
      date: "1 week ago",
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=400&q=80",
      caption: "Keep your desk organized and stylish",
      likes: 1432,
      date: "2 weeks ago",
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=400&q=80",
      caption: "The perfect setup for a productive day",
      likes: 3241,
      date: "2 weeks ago",
    },
  ];

  return (
    <section className="bg-warm-off-white py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 flex items-center justify-center">
            <Instagram className="mr-3 h-8 w-8 text-charcoal-ink" />
            <h2 className="font-serif text-4xl text-charcoal-ink md:text-5xl">
              @shahbrothers
            </h2>
          </div>
          <p className="font-sans text-lg text-muted-sepia">
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
            Follow @shahbrothers
            <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;