import { MapPin } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border-light mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-text-primary tracking-tight">
                Flex<span className="text-brand-600">Desk</span>
              </span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed">
              Book a desk near you — by the hour. Fast, simple, premium.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/search" className="text-sm text-text-muted hover:text-text-primary transition-colors">Find a Desk</Link></li>
              <li><Link href="/host" className="text-sm text-text-muted hover:text-text-primary transition-colors">List Your Desk</Link></li>
              <li><Link href="/pricing" className="text-sm text-text-muted hover:text-text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-text-muted hover:text-text-primary transition-colors">About</Link></li>
              <li><Link href="/blog" className="text-sm text-text-muted hover:text-text-primary transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="text-sm text-text-muted hover:text-text-primary transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-sm text-text-muted hover:text-text-primary transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="text-sm text-text-muted hover:text-text-primary transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="text-sm text-text-muted hover:text-text-primary transition-colors">Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border-light mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">&copy; 2026 FlexDesk. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-xs text-text-muted hover:text-text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="text-xs text-text-muted hover:text-text-primary transition-colors">Privacy</Link>
            <Link href="/cookies" className="text-xs text-text-muted hover:text-text-primary transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
