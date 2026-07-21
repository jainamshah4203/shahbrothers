import Link from "next/link";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-off-white">
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold mb-4 text-charcoal-ink">404</h1>
        <p className="text-xl text-warm-sepia mb-4 leading-body tracking-tight">
          Oops! Page not found
        </p>
        <Link
          href="/"
          className="text-charcoal-ink underline underline-offset-4 hover:text-warm-sepia transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
