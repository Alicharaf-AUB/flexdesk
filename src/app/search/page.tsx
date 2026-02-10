"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  Wifi,
  Coffee,
  Monitor,
  VolumeX,
  Plug,
  Wind,
  Zap,
  SlidersHorizontal,
  Map,
  List,
  X,
  ChevronDown,
  MapPin,
} from "lucide-react";
import { listings, filterOptions } from "@/data/mock";

const perkIconMap: Record<string, React.ReactNode> = {
  "Wi-Fi": <Wifi className="w-3.5 h-3.5" />,
  Coffee: <Coffee className="w-3.5 h-3.5" />,
  Monitor: <Monitor className="w-3.5 h-3.5" />,
  Quiet: <VolumeX className="w-3.5 h-3.5" />,
  Outlet: <Plug className="w-3.5 h-3.5" />,
  AC: <Wind className="w-3.5 h-3.5" />,
};

const filterIconMap: Record<string, React.ReactNode> = {
  zap: <Zap className="w-3.5 h-3.5" />,
  "volume-x": <VolumeX className="w-3.5 h-3.5" />,
  plug: <Plug className="w-3.5 h-3.5" />,
  monitor: <Monitor className="w-3.5 h-3.5" />,
  coffee: <Coffee className="w-3.5 h-3.5" />,
  wind: <Wind className="w-3.5 h-3.5" />,
};

export default function SearchPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(20);
  const [viewMode, setViewMode] = useState<"split" | "map" | "list">("split");
  const [hoveredListing, setHoveredListing] = useState<string | null>(null);

  const toggleFilter = (label: string) => {
    setActiveFilters((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]
    );
  };

  const filteredListings = listings.filter((l) => l.pricePerHour <= priceRange);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-surface-muted">
      {/* ===== TOP BAR ===== */}
      <div className="bg-white border-b border-border-light px-4 sm:px-6 py-3">
        <div className="max-w-[1600px] mx-auto">
          {/* Search summary */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-muted text-sm text-text-secondary">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span className="font-medium truncate">Downtown</span>
              </div>
              <span className="text-text-muted text-sm hidden sm:inline">&middot;</span>
              <span className="text-sm text-text-secondary hidden sm:inline">Today, 2h</span>
              <span className="text-text-muted text-sm hidden sm:inline">&middot;</span>
              <span className="text-sm font-medium text-text-primary hidden sm:inline">
                {filteredListings.length} spaces found
              </span>
            </div>

            {/* View toggle (desktop) */}
            <div className="hidden lg:flex items-center gap-1 bg-surface-muted rounded-xl p-1">
              {(["split", "list", "map"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    viewMode === mode
                      ? "bg-white text-text-primary shadow-sm"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {mode === "map" ? <Map className="w-3.5 h-3.5" /> : mode === "list" ? <List className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
                  {mode === "split" ? "Split" : mode === "list" ? "List" : "Map"}
                </button>
              ))}
            </div>

            {/* Mobile toggle */}
            <div className="flex lg:hidden items-center gap-1 bg-surface-muted rounded-xl p-1">
              <button
                onClick={() => setViewMode(viewMode === "map" ? "list" : "map")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-primary bg-white rounded-lg shadow-sm"
              >
                {viewMode === "map" ? <List className="w-3.5 h-3.5" /> : <Map className="w-3.5 h-3.5" />}
                {viewMode === "map" ? "List" : "Map"}
              </button>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {filterOptions.map((filter) => (
              <button
                key={filter.label}
                onClick={() => toggleFilter(filter.label)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all btn-press ${
                  activeFilters.includes(filter.label)
                    ? "bg-brand-600 text-white"
                    : "bg-surface-muted text-text-secondary hover:bg-brand-50 hover:text-brand-600 border border-border-light"
                }`}
              >
                {filterIconMap[filter.icon]}
                {filter.label}
                {activeFilters.includes(filter.label) && <X className="w-3 h-3 ml-0.5" />}
              </button>
            ))}

            {/* Price range */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-muted border border-border-light">
              <span className="text-xs font-semibold text-text-secondary whitespace-nowrap">
                Up to ${priceRange}/hr
              </span>
              <input
                type="range"
                min={3}
                max={25}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-20"
              />
            </div>

            {activeFilters.length > 0 && (
              <button
                onClick={() => setActiveFilters([])}
                className="text-xs font-medium text-brand-600 hover:text-brand-700 whitespace-nowrap"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="flex-1 flex overflow-hidden">
        {/* LIST */}
        <div
          className={`overflow-y-auto ${
            viewMode === "map"
              ? "hidden"
              : viewMode === "list"
              ? "w-full"
              : "w-full lg:w-[480px] xl:w-[520px]"
          }`}
        >
          <div className={`p-4 space-y-4 ${viewMode === "list" ? "max-w-4xl mx-auto" : ""}`}>
            {filteredListings.map((listing, index) => (
              <Link
                key={listing.id}
                href={`/listing/${listing.id}`}
                className="group flex flex-col sm:flex-row bg-white rounded-[var(--radius-card)] overflow-hidden card-lift animate-fade-in-up"
                style={{
                  boxShadow: "var(--shadow-card)",
                  animationDelay: `${index * 60}ms`,
                  ...(hoveredListing === listing.id ? { boxShadow: "var(--shadow-card-hover)", transform: "translateY(-2px)" } : {}),
                }}
                onMouseEnter={() => setHoveredListing(listing.id)}
                onMouseLeave={() => setHoveredListing(null)}
              >
                {/* Photo */}
                <div className="relative sm:w-52 h-44 sm:h-auto shrink-0 bg-surface-muted overflow-hidden">
                  <img
                    src={listing.photos[0]}
                    alt={listing.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg glass text-xs font-bold text-text-primary">
                    ${listing.pricePerHour}/hr
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-base font-bold text-text-primary group-hover:text-brand-600 transition-colors">
                        {listing.name}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-semibold">{listing.rating}</span>
                        <span className="text-xs text-text-muted">({listing.reviewCount})</span>
                      </div>
                    </div>
                    <p className="text-sm text-text-muted">
                      {listing.neighborhood} &middot; {listing.distance}
                    </p>

                    {/* Perks */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {listing.perks.slice(0, 5).map((perk) => (
                        <span
                          key={perk}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-chip)] bg-surface-muted text-xs font-medium text-text-secondary"
                        >
                          {perkIconMap[perk]}
                          {perk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="availability-bar flex-1 max-w-40">
                      {listing.availability.map((avail, i) => (
                        <span key={i} className={avail ? "bg-success" : "bg-border-light"} />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-brand-600 ml-3">
                      View &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {filteredListings.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-surface-muted flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-text-muted" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-1">No desks match that filter</h3>
                <p className="text-sm text-text-secondary">Try adjusting the price range or removing some filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* MAP */}
        <div
          className={`bg-brand-50 relative ${
            viewMode === "list"
              ? "hidden"
              : viewMode === "map"
              ? "w-full"
              : "hidden lg:block flex-1"
          }`}
        >
          {/* Simulated map */}
          <div className="w-full h-full bg-blueprint relative overflow-hidden" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)" }}>
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-blueprint" />

            {/* Map pins */}
            {filteredListings.map((listing, i) => {
              const positions = [
                { left: "25%", top: "30%" },
                { left: "55%", top: "20%" },
                { left: "70%", top: "45%" },
                { left: "20%", top: "65%" },
                { left: "45%", top: "55%" },
                { left: "65%", top: "70%" },
              ];
              const pos = positions[i % positions.length];

              return (
                <Link
                  key={listing.id}
                  href={`/listing/${listing.id}`}
                  className={`absolute group z-10 transition-all duration-200 ${
                    hoveredListing === listing.id ? "z-20 scale-110" : ""
                  }`}
                  style={{ left: pos.left, top: pos.top }}
                  onMouseEnter={() => setHoveredListing(listing.id)}
                  onMouseLeave={() => setHoveredListing(null)}
                >
                  {/* Pin */}
                  <div
                    className={`px-3 py-1.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                      hoveredListing === listing.id
                        ? "bg-brand-600 text-white shadow-lg scale-105"
                        : "bg-white text-text-primary shadow-md hover:bg-brand-600 hover:text-white"
                    }`}
                  >
                    ${listing.pricePerHour}/hr
                  </div>

                  {/* Preview card on hover */}
                  {hoveredListing === listing.id && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-[var(--radius-card)] overflow-hidden shadow-xl animate-fade-in-up z-30">
                      <div className="h-28 bg-surface-muted">
                        <img src={listing.photos[0]} alt={listing.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3">
                        <h4 className="text-sm font-bold text-text-primary">{listing.name}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-semibold">{listing.rating}</span>
                          <span className="text-xs text-text-muted">&middot; {listing.neighborhood}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {listing.perks.slice(0, 3).map((p) => (
                            <span key={p} className="text-xs px-1.5 py-0.5 rounded bg-surface-muted text-text-muted font-medium">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}

            {/* Map decoration */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-1">
              <button className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center text-text-primary hover:bg-surface-muted transition-colors font-bold text-lg">+</button>
              <button className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center text-text-primary hover:bg-surface-muted transition-colors font-bold text-lg">&minus;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
