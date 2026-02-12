"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Listing } from "@/data/mock";

// Fix leaflet default icon issue in Next.js
const createPriceIcon = (price: number, isHovered: boolean) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background: ${isHovered ? "#2563eb" : "#ffffff"};
      color: ${isHovered ? "#ffffff" : "#0f172a"};
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      font-family: system-ui, sans-serif;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      white-space: nowrap;
      border: 2px solid ${isHovered ? "#1d4ed8" : "#e2e8f0"};
      transition: all 0.15s ease;
    ">$${price}/hr</div>`,
    iconSize: [70, 30],
    iconAnchor: [35, 15],
  });
};

function MapPins({
  listings,
  hoveredId,
  onHover,
}: {
  listings: Listing[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  return (
    <>
      {listings.map((listing) => (
        <Marker
          key={listing.id}
          position={[listing.lat, listing.lng]}
          icon={createPriceIcon(listing.pricePerHour, hoveredId === listing.id)}
          eventHandlers={{
            mouseover: () => onHover(listing.id),
            mouseout: () => onHover(null),
          }}
        >
          <Popup closeButton={false} className="custom-popup">
            <Link href={`/listing/${listing.id}`} className="block w-56 no-underline">
              <div className="relative h-28 -mx-5 -mt-4 mb-2 overflow-hidden">
                <Image
                  src={listing.photos[0]}
                  alt={listing.name}
                  fill
                  sizes="224px"
                  className="object-cover"
                />
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-0.5">{listing.name}</h4>
              <div className="flex items-center gap-1 mb-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-semibold text-gray-900">{listing.rating}</span>
                <span className="text-xs text-gray-500">&middot; {listing.neighborhood}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">${listing.pricePerHour}/hr</span>
                <span className="text-xs font-semibold text-blue-600">View &rarr;</span>
              </div>
            </Link>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

function FitBounds({ listings }: { listings: Listing[] }) {
  const map = useMap();
  useEffect(() => {
    if (listings.length > 0) {
      const bounds = L.latLngBounds(listings.map((l) => [l.lat, l.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [listings, map]);
  return null;
}

function CenterOnChange({ center, zoom }: { center: [number, number] | null | undefined; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom ?? map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapView({
  listings,
  hoveredId,
  onHover,
  centerOverride,
  zoomOverride,
}: {
  listings: Listing[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  centerOverride?: [number, number] | null;
  zoomOverride?: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-surface-muted flex items-center justify-center">
        <div className="text-sm text-text-muted">Loading map...</div>
      </div>
    );
  }

  if (listings.length === 0 && !centerOverride) {
    return (
      <div className="w-full h-full bg-surface-muted flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm font-semibold text-text-primary mb-1">No spaces to show</div>
          <p className="text-xs text-text-muted">Try clearing a filter or raising your price cap.</p>
        </div>
      </div>
    );
  }

  const center: [number, number] = centerOverride || (listings.length
    ? [
        listings.reduce((s, l) => s + l.lat, 0) / listings.length,
        listings.reduce((s, l) => s + l.lng, 0) / listings.length,
      ]
    : [33.8938, 35.5018]);

  return (
    <MapContainer
      center={center}
      zoom={zoomOverride ?? 13}
      style={{ width: "100%", height: "100%" }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <MapPins listings={listings} hoveredId={hoveredId} onHover={onHover} />
      {!centerOverride && <FitBounds listings={listings} />}
      {centerOverride && <CenterOnChange center={centerOverride} zoom={zoomOverride} />}
    </MapContainer>
  );
}
