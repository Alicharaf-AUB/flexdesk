"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  ChevronRight,
  Wifi,
  Coffee,
  Monitor,
  VolumeX,
  Plug,
  RotateCcw,
  QrCode,
  Navigation,
} from "lucide-react";
import type { Booking, Listing } from "@/lib/types";

const mockBookings: Booking[] = [];

const statusConfig = {
  pending: { label: "Pending approval", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  active: { label: "Active now", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  upcoming: { label: "Upcoming", bg: "bg-brand-50", text: "text-brand-700", dot: "bg-brand-500" },
  completed: { label: "Completed", bg: "bg-surface-muted", text: "text-text-muted", dot: "bg-text-muted" },
  cancelled: { label: "Cancelled", bg: "bg-red-50", text: "text-red-500", dot: "bg-red-400" },
};

const perkIconMap: Record<string, React.ReactNode> = {
  "Wi-Fi": <Wifi className="w-3.5 h-3.5" />,
  Coffee: <Coffee className="w-3.5 h-3.5" />,
  Monitor: <Monitor className="w-3.5 h-3.5" />,
  Quiet: <VolumeX className="w-3.5 h-3.5" />,
  Outlet: <Plug className="w-3.5 h-3.5" />,
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "past">("all");
  const [expandedBooking, setExpandedBooking] = useState<string | null>("b1");
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setIsLoading(true);
        const [bookingsRes, listingsRes] = await Promise.all([
          fetch("/api/bookings"),
          fetch("/api/listings"),
        ]);
        if (bookingsRes.status === 401) throw new Error("Please log in to view bookings");
        if (!bookingsRes.ok) throw new Error("Failed to load bookings");
        if (!listingsRes.ok) throw new Error("Failed to load listings");
        const data = await bookingsRes.json();
        const listingsData = await listingsRes.json();
        if (isMounted) {
          setBookings(data.bookings || []);
          setListings(listingsData.listings || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError((err as Error).message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCancel = (id: string) => {
    setCancellingId(id);
    setTimeout(() => {
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "cancelled" as const } : b));
      setCancellingId(null);
    }, 600);
  };

  const filtered = bookings.filter((b) => {
    if (activeTab === "upcoming") return b.status === "upcoming" || b.status === "active" || b.status === "pending";
    if (activeTab === "past") return b.status === "completed" || b.status === "cancelled";
    return true;
  });

  return (
    <div className="bg-blueprint min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              My Bookings
            </h1>
            <p className="text-text-secondary mt-1 text-sm">
              {bookings.filter((b) => b.status === "upcoming" || b.status === "active" || b.status === "pending").length} upcoming
            </p>
          </div>
          <Link
            href="/search"
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-button btn-press transition-colors"
            style={{ boxShadow: "var(--shadow-button)" }}
          >
            Book a desk
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 mb-6 border border-border-light" style={{ boxShadow: "var(--shadow-card)" }}>
          {(["all", "upcoming", "past"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all capitalize ${
                activeTab === tab
                  ? "bg-brand-600 text-white"
                  : "text-text-muted hover:text-text-secondary hover:bg-surface-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Bookings list */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`booking-skel-${i}`}
                className="bg-white rounded-card overflow-hidden border border-border-light"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-center gap-4 p-4 sm:p-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl skeleton" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 skeleton rounded" />
                    <div className="h-4 w-40 skeleton rounded" />
                    <div className="h-3 w-32 skeleton rounded" />
                  </div>
                  <div className="w-16 space-y-2">
                    <div className="h-4 w-16 skeleton rounded" />
                    <div className="h-3 w-12 skeleton rounded" />
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="bg-white rounded-card border border-border-light p-8 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="text-sm font-semibold text-text-primary mb-2">Unable to load bookings</div>
              <p className="text-sm text-text-muted mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-button transition-colors"
                style={{ boxShadow: "var(--shadow-button)" }}
              >
                Retry
              </button>
            </div>
          ) : (
            filtered.map((booking) => {
            const listing = listings.find((l) => l.id === booking.listingId) || {
              id: booking.listingId,
              name: "Workspace",
              neighborhood: "",
              address: "",
              distance: "",
              rating: 0,
              reviewCount: 0,
              pricePerHour: 0,
              photos: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop"],
              perks: [],
              vibeTags: [],
              availability: [],
              lat: 0,
              lng: 0,
              description: "",
              rules: [],
              vibe: { quiet: 0, bright: 0, focus: 0 },
            };
            const sc = statusConfig[booking.status];
            const isExpanded = expandedBooking === booking.id;

            return (
              <div
                key={booking.id}
                className={`bg-white rounded-card overflow-hidden transition-all ${
                  booking.status === "active" ? "ring-2 ring-green-300" : ""
                }`}
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {/* Main row */}
                <button
                  onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                  className="w-full flex items-center gap-4 p-4 sm:p-5 text-left hover:bg-surface-hover transition-colors"
                >
                  {/* Photo */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 bg-surface-muted">
                    <Image
                      src={listing.photos[0]}
                      alt={listing.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${booking.status === "active" ? "animate-pulse" : ""}`} />
                        {sc.label}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-text-primary truncate">
                      {listing.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="w-3.5 h-3.5" />
                        {booking.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {booking.time} &middot; {booking.duration}
                      </span>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-text-primary">${booking.totalPrice}</p>
                    <p className="text-xs text-text-muted">Desk {booking.deskLabel}</p>
                    <ChevronRight className={`w-4 h-4 text-text-muted ml-auto mt-1 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border-light px-4 sm:px-5 py-4 bg-surface-muted/50 animate-fade-in-up">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Left details */}
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-text-muted mb-1">Location</p>
                          <p className="text-sm text-text-primary flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-brand-500" />
                            {listing.address}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-text-muted mb-1">Desk perks</p>
                          <div className="flex flex-wrap gap-1.5">
                            {listing.perks.slice(0, 4).map((p) => (
                              <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white text-xs font-medium text-text-secondary border border-border-light">
                                {perkIconMap[p]}
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-semibold text-text-primary">{listing.rating}</span>
                          <span>&middot; {listing.reviewCount} reviews</span>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="space-y-3">
                        {(booking.status === "active" || booking.status === "upcoming") && (
                          <div className="bg-white rounded-2xl p-4 border border-border-light text-center">
                            <QrCode className="w-10 h-10 text-brand-600 mx-auto mb-2" />
                            <p className="text-xs text-text-muted mb-1">Check-in code</p>
                            <p className="text-2xl font-bold text-text-primary tracking-wider font-mono">
                              {booking.checkInCode}
                            </p>
                          </div>
                        )}

                        {booking.status === "pending" && (
                          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-center">
                            <p className="text-xs font-semibold text-amber-700 mb-1">Awaiting host approval</p>
                            <p className="text-xs text-amber-700">You’ll be notified once it’s approved.</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {booking.status === "active" && (
                            <Link
                              href={`/desk-map/${booking.listingId}`}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl btn-press hover:bg-brand-700 transition-colors"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              View desk map
                            </Link>
                          )}
                          {booking.status === "upcoming" && (
                            <>
                              <Link
                                href={`/desk-map/${booking.listingId}`}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl btn-press hover:bg-brand-700 transition-colors"
                              >
                                <Navigation className="w-3.5 h-3.5" />
                                View desk
                              </Link>
                              <button
                                onClick={() => handleCancel(booking.id)}
                                disabled={cancellingId === booking.id}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 border text-xs font-semibold rounded-xl transition-all ${
                                  cancellingId === booking.id
                                    ? "border-red-200 bg-red-50 text-red-400 cursor-not-allowed"
                                    : "border-border-light text-text-secondary hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                                }`}
                              >
                                {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
                              </button>
                            </>
                          )}
                          {booking.status === "completed" && (
                            <Link
                              href={`/listing/${booking.listingId}`}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-surface-muted text-text-primary text-xs font-bold rounded-xl hover:bg-brand-50 transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Book again
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
            })
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-surface-muted flex items-center justify-center mx-auto mb-4">
                <CalendarCheck className="w-7 h-7 text-text-muted" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-1">No bookings yet</h3>
              <p className="text-sm text-text-secondary mb-4">Find your first desk and get to work.</p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white text-sm font-bold rounded-button btn-press hover:bg-brand-700 transition-colors"
              >
                Find a desk
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
