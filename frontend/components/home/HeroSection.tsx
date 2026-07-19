import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center fashion-hero overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=2000&q=80"
          alt="Shah Brothers Stationery Collection"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-2xl">
          <div className="animate-fade-in-up">
            <p className="text-sm uppercase tracking-wider text-white/90 mb-4">
              Premium Stationery & Office Supplies
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-tight mb-6">
              Create
              <br />
              <span className="italic">Inspire</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-lg">
              Discover our curated collection of premium writing instruments, notebooks, 
              and desk accessories for the modern professional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="luxury-button group" asChild>
                <Link href="/collections">
                  Shop Stationery
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                asChild
              >
                <Link href="/collections?q=brands">
                  Explore Brands
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;