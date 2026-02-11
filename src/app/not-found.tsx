import Link from "next/link";
import { MapPin, ArrowRight, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-blueprint flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-brand-50 flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-10 h-10 text-brand-400" />
        </div>

        <h1 className="text-6xl font-extrabold text-text-primary tracking-tight mb-2">404</h1>
        <h2 className="text-xl font-bold text-text-primary mb-2">Desk not found</h2>
        <p className="text-text-secondary mb-8 leading-relaxed">
          Looks like this workspace moved or doesn&apos;t exist. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/search"
            className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-[14px] transition-colors"
            style={{ boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05)" }}
          >
            <Search className="w-4 h-4" />
            Find a desk
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 border border-[#e2e8f0] text-[#0f172a] font-semibold rounded-[14px] hover:bg-[#f1f5f9] transition-colors"
          >
            Go home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
