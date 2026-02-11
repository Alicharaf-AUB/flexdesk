"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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
  MapPin,
} from "lucide-react";
import { listings, filterOptions } from "@/data/mock";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

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

  const filteredListings = listings.filter((l) => {
    if (l.pricePerHour > priceRange) return false;
    if (activeFilters.includes("Quiet") && !l.perks.includes("Quiet")) return false;
    if (activeFilters.includes("Monitor") && !l.perks.includes("Monitor")) return false;
    if (activeFilters.includes("Coffee") && !l.perks.includes("Coffee")) return false;
    if (activeFilters.includes("Near Outlet") && !l.perks.includes("Outlet")) return false;
    if (activeFilters.includes("AC") && !l.perks.includes("AC")) return false;
    return true;
  });

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-surface-muted">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          padding: 0 !important;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,0.12) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          padding: 12px 16px !important;
          line-height: 1.4 !important;
        }
        .leaflet-popup-content > a {
          text-decoration: none !important;
          color: inherit !important;
        }
        .leaflet-popup-tip {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
        .custom-marker {
          background: none !important;
          border: none !important;
        }
      `}</style>

      {/* ===== TOP BAR ===== */}
      <div className="bg-white border-b border-border-light px-4 sm:px-6 py-3 shrink-0">
        <div className="max-w-[1600px] mx-auto">
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
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
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
                  boxShadow: hoveredListing === listing.id ? "var(--shadow-card-hover)" : "var(--shadow-card)",
                  animationDelay: `${index * 60}ms`,
                  transform: hoveredListing === listing.id ? "translateY(-2px)" : undefined,
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
          className={`relative ${
            viewMode === "list"
              ? "hidden"
              : viewMode === "map"
              ? "w-full"
              : "hidden lg:block flex-1"
          }`}
        >
          <MapView
            listings={filteredListings}
            hoveredId={hoveredListing}
            onHover={setHoveredListing}
          />
        </div>
      </div>
    </div>
  );
}
