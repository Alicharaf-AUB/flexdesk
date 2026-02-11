"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Menu, X, Plus, CalendarCheck } from "lucide-react";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  const openLogin = () => {
    setAuthTab("login");
    setAuthOpen(true);
    setMobileOpen(false);
  };

  const openSignup = () => {
    setAuthTab("signup");
    setAuthOpen(true);
    setMobileOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ boxShadow: "var(--shadow-glass)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center transition-transform group-hover:scale-105">
                <MapPin className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-text-primary tracking-tight">
                Flex<span className="text-brand-600">Desk</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/search"
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-xl hover:bg-surface-muted transition-colors"
              >
                Find a Desk
              </Link>
              <Link
                href="/host"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                List Your Desk
              </Link>
              <Link
                href="/bookings"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-xl hover:bg-surface-muted transition-colors"
              >
                <CalendarCheck className="w-4 h-4" />
                My Bookings
              </Link>
              <div className="w-px h-6 bg-border-light mx-1" />
              <button
                onClick={openLogin}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-xl hover:bg-surface-muted transition-colors"
              >
                Log in
              </button>
              <button
                onClick={openSignup}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-[var(--radius-button)] btn-press transition-colors"
                style={{ boxShadow: "var(--shadow-button)" }}
              >
                Sign up
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-surface-muted transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border-light bg-white px-4 py-3 space-y-1 animate-fade-in-up">
            <Link href="/search" className="block px-4 py-3 text-sm font-medium text-text-secondary rounded-xl hover:bg-surface-muted" onClick={() => setMobileOpen(false)}>
              Find a Desk
            </Link>
            <Link href="/host" className="block px-4 py-3 text-sm font-medium text-brand-600 rounded-xl hover:bg-brand-50" onClick={() => setMobileOpen(false)}>
              List Your Desk
            </Link>
            <Link href="/bookings" className="block px-4 py-3 text-sm font-medium text-text-secondary rounded-xl hover:bg-surface-muted" onClick={() => setMobileOpen(false)}>
              My Bookings
            </Link>
            <div className="border-t border-border-light my-2" />
            <button onClick={openLogin} className="block w-full text-left px-4 py-3 text-sm font-medium text-text-secondary rounded-xl hover:bg-surface-muted">
              Log in
            </button>
            <button onClick={openSignup} className="block w-full text-left px-4 py-3 text-sm font-semibold text-white bg-brand-600 rounded-xl text-center">
              Sign up
            </button>
          </div>
        )}
      </nav>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />
    </>
  );
}
