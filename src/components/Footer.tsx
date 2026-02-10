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
              <li><span className="text-sm text-text-muted">Pricing</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Company</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-text-muted">About</span></li>
              <li><span className="text-sm text-text-muted">Blog</span></li>
              <li><span className="text-sm text-text-muted">Careers</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Support</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-text-muted">Help Center</span></li>
              <li><span className="text-sm text-text-muted">Contact</span></li>
              <li><span className="text-sm text-text-muted">Privacy</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border-light mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">&copy; 2026 FlexDesk. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-text-muted">Terms</span>
            <span className="text-xs text-text-muted">Privacy</span>
            <span className="text-xs text-text-muted">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
