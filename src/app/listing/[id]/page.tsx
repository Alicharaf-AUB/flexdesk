"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Star,
  Wifi,
  Coffee,
  Monitor,
  VolumeX,
  Plug,
  Wind,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Users,
  Minus,
  Plus,
  ArrowRight,
  MapPin,
  Phone,
  PhoneOff,
  Music,
  Leaf,
  Ban,
} from "lucide-react";
import type { Listing } from "@/lib/types";

const perkIconMap: Record<string, React.ReactNode> = {
  "Wi-Fi": <Wifi className="w-5 h-5" />,
  Coffee: <Coffee className="w-5 h-5" />,
  Monitor: <Monitor className="w-5 h-5" />,
  Quiet: <VolumeX className="w-5 h-5" />,
  Outlet: <Plug className="w-5 h-5" />,
  AC: <Wind className="w-5 h-5" />,
};

const ruleIconMap: Record<string, React.ReactNode> = {
  "volume-x": <VolumeX className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
  "phone-off": <PhoneOff className="w-4 h-4" />,
  "cigarette-off": <Ban className="w-4 h-4" />,
  music: <Music className="w-4 h-4" />,
  coffee: <Coffee className="w-4 h-4" />,
  leaf: <Leaf className="w-4 h-4" />,
};

export default function ListingPage() {
  const params = useParams();
  const listingId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [guests, setGuests] = useState(1);
  const [selectedDate] = useState("Today");
  const [selectedTime] = useState("Now");
  const [duration, setDuration] = useState("2h");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!listingId) {
        setError("Invalid listing");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await fetch(`/api/listings/${listingId}`);
        if (!res.ok) throw new Error("Listing not found");
        const data = await res.json();
        if (isMounted) {
          setListing(data.listing);
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
  }, [listingId]);

  const durationHours: Record<string, number> = { "1h": 1, "2h": 2, "4h": 4, Day: 8 };

  if (isLoading || !listing) {
    return (
      <div className="bg-blueprint min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-5 w-32 skeleton rounded mb-6" />
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 min-w-0 space-y-6">
              <div className="aspect-video rounded-card skeleton" />
              <div className="space-y-3">
                <div className="h-6 w-1/2 skeleton rounded" />
                <div className="h-4 w-1/3 skeleton rounded" />
                <div className="h-3 w-3/4 skeleton rounded" />
              </div>
              <div className="bg-white rounded-card p-6">
                <div className="h-5 w-40 skeleton rounded mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={`perk-skel-${i}`} className="h-10 skeleton rounded-chip" />
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:w-95 shrink-0">
              <div className="bg-white rounded-card p-6 border border-border-light">
                <div className="h-8 w-24 skeleton rounded mb-6" />
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="h-14 skeleton rounded-(--radius-input)" />
                  <div className="h-14 skeleton rounded-(--radius-input)" />
                </div>
                <div className="h-11 skeleton rounded-button" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = listing.pricePerHour * durationHours[duration] * guests;

  if (error) {
    return (
      <div className="bg-blueprint min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-card border border-border-light p-8 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="text-sm font-semibold text-text-primary mb-2">Unable to load listing</div>
            <p className="text-sm text-text-muted mb-4">{error}</p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-button transition-colors"
              style={{ boxShadow: "var(--shadow-button)" }}
            >
              Back to search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blueprint min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-brand-600 transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to search
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ===== LEFT COLUMN ===== */}
          <div className="flex-1 min-w-0">
            {/* Photo Gallery */}
            <div className="relative rounded-card overflow-hidden bg-surface-muted mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="aspect-video relative">
                <Image
                  src={listing.photos[currentPhoto]}
                  alt={listing.name}
                  fill
                  sizes="(min-width: 1024px) 800px, 100vw"
                  className="object-cover transition-opacity duration-300"
                />

                {/* Nav arrows */}
                {listing.photos.length > 1 && (
                  <>
                    <button
                      aria-label="Previous photo"
                      onClick={() => setCurrentPhoto((p) => (p - 1 + listing.photos.length) % listing.photos.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md transition-all"
                    >
                      <ChevronLeft className="w-5 h-5 text-text-primary" />
                    </button>
                    <button
                      aria-label="Next photo"
                      onClick={() => setCurrentPhoto((p) => (p + 1) % listing.photos.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md transition-all"
                    >
                      <ChevronRight className="w-5 h-5 text-text-primary" />
                    </button>
                  </>
                )}

                {/* Photo dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {listing.photos.map((_, i) => (
                    <button
                      aria-label={`Show photo ${i + 1}`}
                      key={i}
                      onClick={() => setCurrentPhoto(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentPhoto ? "bg-white w-5" : "bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Title + rating */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                {listing.vibeTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                {listing.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-text-muted" />
                  <span className="text-sm text-text-secondary">{listing.address}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-semibold text-text-primary">{listing.rating}</span>
                  <span className="text-sm text-text-muted">({listing.reviewCount} reviews)</span>
                </div>
              </div>
              <p className="mt-4 text-text-secondary leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* What you get */}
            <div className="bg-white rounded-card p-6 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <h2 className="text-lg font-bold text-text-primary mb-4">What you get</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {listing.perks.map((perk) => (
                  <div
                    key={perk}
                    className="flex items-center gap-3 p-3 rounded-chip bg-surface-muted group hover:bg-brand-50 transition-colors"
                  >
                    <div className="text-brand-600 group-hover:scale-110 transition-transform">
                      {perkIconMap[perk] || <Plug className="w-5 h-5" />}
                    </div>
                    <span className="text-sm font-medium text-text-primary">{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vibe meter */}
            <div className="bg-white rounded-card p-6 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <h2 className="text-lg font-bold text-text-primary mb-4">Space vibe</h2>
              <div className="space-y-4">
                {[
                  { label: "Quiet", opposite: "Social", value: listing.vibe.quiet },
                  { label: "Bright", opposite: "Cozy", value: listing.vibe.bright },
                  { label: "Focus", opposite: "Collaborative", value: listing.vibe.focus },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-brand-600">{item.label}</span>
                      <span className="text-xs font-semibold text-text-muted">{item.opposite}</span>
                    </div>
                    <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-400 rounded-full transition-all duration-700"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="bg-white rounded-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <h2 className="text-lg font-bold text-text-primary mb-4">Space rules</h2>
              <div className="space-y-3">
                {listing.rules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center text-text-secondary">
                      {ruleIconMap[rule.icon] || <Ban className="w-4 h-4" />}
                    </div>
                    <span className="text-sm text-text-secondary">{rule.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ===== RIGHT COLUMN: BOOKING BOX ===== */}
          <div className="lg:w-95 shrink-0">
            <div className="lg:sticky lg:top-24">
              <div
                className="bg-white rounded-card p-6 border border-border-light"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {/* Price */}
                <div className="flex items-baseline gap-1 mb-6">
                  {listing.paidEnabled === false ? (
                    <span className="text-3xl font-bold text-text-primary">Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-text-primary">${listing.pricePerHour}</span>
                      <span className="text-text-muted text-sm font-medium">/ hour</span>
                    </>
                  )}
                </div>

                {/* Date / Time */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-3 rounded-(--radius-input) border border-border-light hover:border-brand-300 transition-colors cursor-pointer">
                    <p className="text-xs font-medium text-text-muted mb-0.5">Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-500" />
                      <span className="text-sm font-semibold text-text-primary">{selectedDate}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-(--radius-input) border border-border-light hover:border-brand-300 transition-colors cursor-pointer">
                    <p className="text-xs font-medium text-text-muted mb-0.5">Time</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand-500" />
                      <span className="text-sm font-semibold text-text-primary">{selectedTime}</span>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="p-3 rounded-(--radius-input) border border-border-light mb-3">
                  <p className="text-xs font-medium text-text-muted mb-2">Duration</p>
                  <div className="flex gap-2">
                    {["1h", "2h", "4h", "Day"].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all btn-press ${
                          duration === d
                            ? "bg-brand-600 text-white"
                            : "bg-surface-muted text-text-secondary hover:bg-brand-50 hover:text-brand-600"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guests */}
                <div className="p-3 rounded-(--radius-input) border border-border-light mb-4">
                  <p className="text-xs font-medium text-text-muted mb-2">Guests</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-brand-500" />
                      <span className="text-sm font-semibold text-text-primary">
                        {guests} {guests === 1 ? "person" : "people"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                          aria-label="Decrease guests"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="w-8 h-8 rounded-lg border border-border-light flex items-center justify-center hover:bg-surface-muted transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                        <button
                          aria-label="Increase guests"
                        onClick={() => setGuests(Math.min(10, guests + 1))}
                        className="w-8 h-8 rounded-lg border border-border-light flex items-center justify-center hover:bg-surface-muted transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="border-t border-border-light pt-4 mb-4 space-y-2">
                  {listing.paidEnabled === false ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">No payment required</span>
                      <span className="font-medium text-text-primary">$0</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">
                          ${listing.pricePerHour} x {durationHours[duration]}h x {guests} {guests === 1 ? "guest" : "guests"}
                        </span>
                        <span className="font-medium text-text-primary">${totalPrice}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">Service fee</span>
                        <span className="font-medium text-text-primary">${Math.round(totalPrice * 0.1)}</span>
                      </div>
                      <div className="border-t border-border-light pt-2 flex items-center justify-between">
                        <span className="font-bold text-text-primary">Total</span>
                        <span className="font-bold text-text-primary text-lg">${totalPrice + Math.round(totalPrice * 0.1)}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={`/desk-map/${listing.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-button btn-press transition-colors text-base"
                  style={{ boxShadow: "var(--shadow-button)" }}
                >
                  Choose your desk
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <p className="text-xs text-text-muted text-center mt-3">
                  No charge until you confirm a desk
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
