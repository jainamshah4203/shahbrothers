import Link from "next/link";
import { Instagram, Facebook, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center text-3xl font-serif font-semibold mb-4">
              <img src="/logo.png" alt="SB Logo" className="h-10 w-10 mr-3 rounded-md object-cover" />
              Shah Brothers
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md">
              Timeless pieces for the modern woman. Discover our curated collection
              of essentials that blend comfort, style, and sustainability.
            </p>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Stay in the know</h4>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter your email"
                  className="elegant-input flex-1"
                />
                <Button className="luxury-button">Subscribe</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get the latest updates on new collections and exclusive offers.
              </p>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              {[
                "New Arrivals",
                "Essentials",
                "Dresses",
                "Tops & Blouses",
                "Bottoms",
                "Outerwear",
                "Accessories",
                "Sale",
              ].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-semibold mb-4">Customer Care</h4>
            <ul className="space-y-2">
              {[
                "Contact Us",
                "Size Guide",
                "Shipping & Replacement",
                "FAQ",
                "Care Instructions",
                "Privacy Policy",
                "Terms of Service",
                "Accessibility",
              ].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-6">
            <p className="text-sm text-muted-foreground">
              © 2024 Shah Brothers. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">We accept:</span>
            <div className="flex items-center space-x-2">
              {["Visa", "Mastercard", "PayPal", "Apple Pay"].map((payment) => (
                <div
                  key={payment}
                  className="h-6 w-10 bg-muted rounded border border-border flex items-center justify-center text-xs font-medium"
                >
                  {payment.slice(0, 4)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;