"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Timer,
  ChevronRight,
  ChevronLeft,
  Star,
  Wifi,
  Coffee,
  Monitor,
  VolumeX,
  Plug,
  ArrowRight,
  Sparkles,
  Users,
  Shield,
} from "lucide-react";
import type { Listing } from "@/lib/types";

const perkIconMap: Record<string, React.ReactNode> = {
  "Wi-Fi": <Wifi className="w-3.5 h-3.5" />,
  Coffee: <Coffee className="w-3.5 h-3.5" />,
  Monitor: <Monitor className="w-3.5 h-3.5" />,
  Quiet: <VolumeX className="w-3.5 h-3.5" />,
  Outlet: <Plug className="w-3.5 h-3.5" />,
};

const durations = ["1h", "2h", "4h", "Day"];
const locationOptions: Array<{ id: string; label: string }> = [
  { id: "all", label: "All locations" },
  { id: "beirut", label: "Beirut, Lebanon" },
  { id: "dubai", label: "Dubai, UAE" },
  { id: "london", label: "London, UK" },
  { id: "paris", label: "Paris, France" },
  { id: "new-york", label: "New York, USA" },
];

/* ===== Animated icon components for hover ===== */
function CoffeeSteamIcon({ hovering }: { hovering: boolean }) {
  return (
    <div className="relative w-3.5 h-3.5">
      <Coffee className="w-3.5 h-3.5" />
      {hovering && (
        <>
          <span className="absolute -top-1 left-0.5 w-0.5 h-1.5 bg-amber-400/60 rounded-full animate-steam" style={{ animationDelay: "0ms" }} />
          <span className="absolute -top-1.5 left-1.5 w-0.5 h-1.5 bg-amber-400/40 rounded-full animate-steam" style={{ animationDelay: "200ms" }} />
          <span className="absolute -top-1 left-2.5 w-0.5 h-1.5 bg-amber-400/50 rounded-full animate-steam" style={{ animationDelay: "400ms" }} />
        </>
      )}
    </div>
  );
}

function WifiWaveIcon({ hovering }: { hovering: boolean }) {
  return (
    <div className={`w-3.5 h-3.5 ${hovering ? "animate-wifi" : ""}`}>
      <Wifi className="w-3.5 h-3.5" />
    </div>
  );
}

function MonitorGlowIcon({ hovering }: { hovering: boolean }) {
  return (
    <div className={`w-3.5 h-3.5 transition-all duration-300 ${hovering ? "text-blue-500 drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]" : ""}`}>
      <Monitor className="w-3.5 h-3.5" />
    </div>
  );
}

function QuietPulseIcon({ hovering }: { hovering: boolean }) {
  return (
    <div className={`w-3.5 h-3.5 ${hovering ? "animate-pulse" : ""}`}>
      <VolumeX className="w-3.5 h-3.5" />
    </div>
  );
}

function OutletZapIcon({ hovering }: { hovering: boolean }) {
  return (
    <div className={`w-3.5 h-3.5 transition-colors duration-200 ${hovering ? "text-amber-500" : ""}`}>
      <Plug className="w-3.5 h-3.5" />
    </div>
  );
}

function AnimatedPerkIcon({ perk, hovering }: { perk: string; hovering: boolean }) {
  switch (perk) {
    case "Coffee": return <CoffeeSteamIcon hovering={hovering} />;
    case "Wi-Fi": return <WifiWaveIcon hovering={hovering} />;
    case "Monitor": return <MonitorGlowIcon hovering={hovering} />;
    case "Quiet": return <QuietPulseIcon hovering={hovering} />;
    case "Outlet": return <OutletZapIcon hovering={hovering} />;
    default: return <>{perkIconMap[perk]}</>;
  }
}

/* ===== Date / Time helpers ===== */
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDate(d: Date) {
  const today = new Date();
  if (isSameDay(d, today)) return "Today";
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (isSameDay(d, tomorrow)) return "Tomorrow";
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

function generateTimeSlots() {
  const slots: string[] = [];
  for (let h = 6; h <= 22; h++) {
    slots.push(`${h === 0 ? 12 : h > 12 ? h - 12 : h}:00 ${h < 12 ? "AM" : "PM"}`);
    slots.push(`${h === 0 ? 12 : h > 12 ? h - 12 : h}:30 ${h < 12 ? "AM" : "PM"}`);
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

export default function LandingPage() {
  const router = useRouter();
  const [selectedDuration, setSelectedDuration] = useState("2h");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("Now");
  const [selectedLocationId, setSelectedLocationId] = useState("all");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const dateRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDatePicker(false);
      if (timeRef.current && !timeRef.current.contains(e.target as Node)) setShowTimePicker(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setFeaturedLoading(true);
        const res = await fetch("/api/listings");
        if (!res.ok) throw new Error("Failed to load spaces");
        const data = await res.json();
        if (isMounted) {
          setFeaturedListings((data.listings || []).slice(0, 6));
          setFeaturedError(null);
        }
      } catch (err) {
        if (isMounted) setFeaturedError((err as Error).message);
      } finally {
        if (isMounted) setFeaturedLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calendar grid for the current month view
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calendarDays: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const canGoPrev = calYear > today.getFullYear() || (calYear === today.getFullYear() && calMonth > today.getMonth());

  return (
    <div className="bg-blueprint">
      {/* ===== HERO ===== */}
      <section className="relative overflow-visible">
        <div className="absolute top-20 -left-32 w-96 h-96 bg-brand-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent-200 rounded-full opacity-15 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Flexible workspaces, on your terms
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-text-primary leading-tight tracking-tight">
              Book a desk near you
              <br />
              <span className="text-brand-600">by the hour.</span>
            </h1>

            <p className="mt-5 text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
              Find flexible workspaces, pick your perfect spot, and get to work — all in under 60 seconds.
            </p>
          </div>

          {/* ===== SEARCH BAR ===== */}
          <div className="mt-10 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <div className="glass rounded-3xl p-2" style={{ boxShadow: "var(--shadow-elevated)" }}>
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-(--radius-input) hover:bg-surface-muted transition-colors group">
                  <MapPin className="w-5 h-5 text-brand-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-muted">Location</p>
                    <select
                      value={selectedLocationId}
                      onChange={(e) => setSelectedLocationId(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-text-primary truncate focus:outline-none"
                    >
                      {locationOptions.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="hidden md:block w-px bg-border-light my-2" />
                {/* Date picker */}
                <div ref={dateRef} className="relative">
                  <div
                    onClick={() => { setShowDatePicker(!showDatePicker); setShowTimePicker(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-(--radius-input) hover:bg-surface-muted transition-colors cursor-pointer group ${showDatePicker ? "bg-surface-muted" : ""}`}
                  >
                    <Calendar className="w-5 h-5 text-brand-500 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-text-muted">Date</p>
                      <p className="text-sm font-semibold text-text-primary group-hover:text-brand-600 transition-colors">{formatDate(selectedDate)}</p>
                    </div>
                  </div>

                  {showDatePicker && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl border border-border-light p-4 z-50 w-70 animate-fade-in-up" style={{ boxShadow: "var(--shadow-elevated)" }}>
                      {/* Month navigation */}
                      <div className="flex items-center justify-between mb-3">
                        <button
                          onClick={() => {
                            if (!canGoPrev) return;
                            if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
                            else setCalMonth(calMonth - 1);
                          }}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${canGoPrev ? "hover:bg-surface-muted text-text-secondary" : "text-border-light cursor-not-allowed"}`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold text-text-primary">{MONTHS[calMonth]} {calYear}</span>
                        <button
                          onClick={() => {
                            if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
                            else setCalMonth(calMonth + 1);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-muted text-text-secondary transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Day headers */}
                      <div className="grid grid-cols-7 gap-1 mb-1">
                        {DAYS.map((d) => (
                          <div key={d} className="text-center text-[10px] font-semibold text-text-muted py-1">{d}</div>
                        ))}
                      </div>

                      {/* Day grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, i) => {
                          if (day === null) return <div key={`empty-${i}`} />;
                          const date = new Date(calYear, calMonth, day);
                          date.setHours(0, 0, 0, 0);
                          const isPast = date < today;
                          const isSelected = isSameDay(date, selectedDate);
                          const isToday = isSameDay(date, today);
                          return (
                            <button
                              key={day}
                              disabled={isPast}
                              onClick={() => {
                                setSelectedDate(date);
                                setShowDatePicker(false);
                              }}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                                isPast
                                  ? "text-border-light cursor-not-allowed"
                                  : isSelected
                                  ? "bg-brand-600 text-white"
                                  : isToday
                                  ? "bg-brand-50 text-brand-600 hover:bg-brand-100"
                                  : "text-text-primary hover:bg-surface-muted"
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="hidden md:block w-px bg-border-light my-2" />
                {/* Time picker */}
                <div ref={timeRef} className="relative">
                  <div
                    onClick={() => { setShowTimePicker(!showTimePicker); setShowDatePicker(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-(--radius-input) hover:bg-surface-muted transition-colors cursor-pointer group ${showTimePicker ? "bg-surface-muted" : ""}`}
                  >
                    <Clock className="w-5 h-5 text-brand-500 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-text-muted">Time</p>
                      <p className="text-sm font-semibold text-text-primary group-hover:text-brand-600 transition-colors">{selectedTime}</p>
                    </div>
                  </div>

                  {showTimePicker && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl border border-border-light p-3 z-50 w-50 max-h-70 overflow-y-auto animate-fade-in-up" style={{ boxShadow: "var(--shadow-elevated)" }}>
                      <button
                        onClick={() => { setSelectedTime("Now"); setShowTimePicker(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors mb-1 ${
                          selectedTime === "Now" ? "bg-brand-600 text-white" : "text-text-primary hover:bg-surface-muted"
                        }`}
                      >
                        Now
                      </button>
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => { setSelectedTime(slot); setShowTimePicker(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedTime === slot ? "bg-brand-600 text-white" : "text-text-primary hover:bg-surface-muted"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="hidden md:block w-px bg-border-light my-2" />
                <div className="flex items-center gap-3 px-4 py-3 rounded-(--radius-input)">
                  <Timer className="w-5 h-5 text-brand-500 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-text-muted mb-1">Duration</p>
                    <div className="flex gap-1">
                      {durations.map((d) => (
                        <button
                          key={d}
                          onClick={() => setSelectedDuration(d)}
                          className={`px-2.5 py-0.5 text-xs font-semibold rounded-lg transition-all ${
                            selectedDuration === d ? "bg-brand-600 text-white" : "bg-surface-muted text-text-secondary hover:bg-brand-50 hover:text-brand-600"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <Link
                  href={`/search?date=${selectedDate.toISOString().split("T")[0]}&time=${encodeURIComponent(selectedTime)}&duration=${selectedDuration}&loc=${selectedLocationId}`}
                  className="flex items-center justify-center gap-2 px-6 py-3 md:py-0 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-button btn-press transition-colors"
                >
                  <Search className="w-5 h-5" />
                  <span className="md:hidden">Find desks</span>
                </Link>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Link href="/host" className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-brand-600 transition-colors">
                Have a desk to share?
                <span className="text-brand-600 font-semibold">List your desk</span>
                <ChevronRight className="w-4 h-4 text-brand-600" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 bg-white border-y border-border-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-text-primary tracking-tight">Get to work in 3 steps</h2>
            <p className="mt-2 text-text-secondary">No signup required to browse. Booking takes seconds.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {[
              { step: "1", icon: <Search className="w-7 h-7 text-brand-600" />, title: "Find", desc: "Search by location, time, and duration. Results load instantly." },
              { step: "2", icon: <MapPin className="w-7 h-7 text-brand-600" />, title: "Pick a desk", desc: "Browse the floor plan. Choose the exact spot that fits your work style." },
              { step: "3", icon: <Sparkles className="w-7 h-7 text-brand-600" />, title: "Check in & work", desc: "Confirm your booking, show up, and get to work. That\u2019s it." },
            ].map((item) => (
              <div key={item.step} className="relative bg-surface-muted rounded-card p-8 text-center group hover:bg-white hover:shadow-(--shadow-card) transition-all duration-300">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">{item.step}</div>
                <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED SPACES ===== */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-text-primary tracking-tight">Featured spaces</h2>
              <p className="mt-1 text-text-secondary">High-rated workspaces near you</p>
            </div>
            <Link href="/search" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {featuredLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={`featured-skel-${i}`} className="bg-white rounded-card overflow-hidden border border-border-light" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="h-48 skeleton" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 w-2/3 skeleton rounded" />
                    <div className="h-3 w-1/3 skeleton rounded" />
                    <div className="flex gap-2">
                      <div className="h-6 w-14 skeleton rounded-full" />
                      <div className="h-6 w-16 skeleton rounded-full" />
                      <div className="h-6 w-12 skeleton rounded-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : featuredError ? (
              <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-card border border-border-light p-8 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="text-sm font-semibold text-text-primary mb-2">Unable to load featured spaces</div>
                <p className="text-sm text-text-muted mb-4">{featuredError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-button transition-colors"
                  style={{ boxShadow: "var(--shadow-button)" }}
                >
                  Retry
                </button>
              </div>
            ) : (
              featuredListings.map((listing) => {
              const isHovered = hoveredCard === listing.id;
              return (
                <Link
                  key={listing.id}
                  href={`/listing/${listing.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/listing/${listing.id}`);
                  }}
                  className="group bg-white rounded-card overflow-hidden card-lift"
                  style={{ boxShadow: "var(--shadow-card)" }}
                  onMouseEnter={() => setHoveredCard(listing.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Photo */}
                  <div className="relative h-48 bg-surface-muted overflow-hidden">
                    <Image
                      src={listing.photos[0]}
                      alt={listing.name}
                      fill
                      sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg glass text-xs font-bold text-text-primary">
                      ${listing.pricePerHour}/hr
                    </div>

                    {/* Hover overlay with animated perks */}
                    <div className={`absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent flex items-end p-4 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
                      <div className="flex items-center gap-3">
                        {listing.perks.slice(0, 3).map((perk) => (
                          <div key={perk} className="flex items-center gap-1 text-white text-xs font-medium">
                            <AnimatedPerkIcon perk={perk} hovering={isHovered} />
                            {perk}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-text-primary truncate group-hover:text-brand-600 transition-colors">{listing.name}</h3>
                        <p className="text-sm text-text-muted mt-0.5">{listing.neighborhood} &middot; {listing.distance}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className={`w-4 h-4 text-amber-400 fill-amber-400 transition-transform duration-300 ${isHovered ? "scale-125 rotate-12" : ""}`} />
                        <span className="text-sm font-semibold text-text-primary">{listing.rating}</span>
                        <span className="text-xs text-text-muted">({listing.reviewCount})</span>
                      </div>
                    </div>

                    {/* Animated perk chips */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {listing.perks.slice(0, 4).map((perk, i) => (
                        <span
                          key={perk}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-chip text-xs font-medium transition-all duration-300 ${
                            isHovered
                              ? "bg-brand-50 text-brand-700 border border-brand-200"
                              : "bg-surface-muted text-text-secondary"
                          }`}
                          style={{
                            transitionDelay: isHovered ? `${i * 50}ms` : "0ms",
                            transform: isHovered ? "translateY(-1px)" : "translateY(0)",
                          }}
                        >
                          <AnimatedPerkIcon perk={perk} hovering={isHovered} />
                          {perk}
                        </span>
                      ))}
                    </div>

                    {/* Availability bar */}
                    <div className="availability-bar mt-4">
                      {listing.availability.map((avail, i) => (
                        <span
                          key={i}
                          className={`transition-all duration-300 ${
                            isHovered && avail ? "bg-brand-500" : avail ? "bg-success" : "bg-border-light"
                          }`}
                          style={{
                            transform: isHovered && avail ? "scaleY(1.5)" : "scaleY(1)",
                            transformOrigin: "bottom",
                            transition: `all 0.3s ease ${i * 30}ms`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </Link>
              );
            }))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/search" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
              View all spaces <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TRUST SECTION ===== */}
      <section className="py-16 bg-white border-y border-border-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10 text-center">
            {[
              { icon: <Shield className="w-6 h-6 text-brand-600" />, title: "Verified spaces", desc: "Every workspace is reviewed and verified before listing." },
              { icon: <Users className="w-6 h-6 text-brand-600" />, title: "10K+ happy users", desc: "Join thousands of founders, freelancers, and creators." },
              { icon: <Sparkles className="w-6 h-6 text-brand-600" />, title: "Instant booking", desc: "No waiting. Book your desk and start working immediately." },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center group">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-brand-100 transition-all duration-300">{item.icon}</div>
                <h3 className="text-base font-bold text-text-primary mb-1">{item.title}</h3>
                <p className="text-sm text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOST CTA ===== */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[28px] overflow-hidden bg-brand-900 text-white p-10 md:p-14 text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-blueprint opacity-10" />
            <div className="absolute top-6 right-6 w-40 h-40 bg-brand-500 rounded-full opacity-10 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Got a desk? Start earning.</h2>
              <p className="text-brand-200 max-w-lg mx-auto mb-8 leading-relaxed">
                Turn your unused workspace into income. Our drag-and-drop builder makes setup effortless — like Canva for floor plans.
              </p>
              <Link href="/host" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-brand-700 font-bold rounded-button btn-press hover:bg-brand-50 transition-colors" style={{ boxShadow: "var(--shadow-button)" }}>
                List your desk <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
