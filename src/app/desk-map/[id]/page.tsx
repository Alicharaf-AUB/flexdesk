"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronUp,
  Wifi,
  Coffee,
  Monitor,
  VolumeX,
  Plug,
  Sun,
  DoorOpen,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  List,
  Map,
  Check,
  X,
  Headphones,
  MessageSquare,
  QrCode,
  CalendarCheck,
} from "lucide-react";
import { listings, desks, zones, amenities, type Desk } from "@/data/mock";

const perkIconSmall: Record<string, React.ReactNode> = {
  Outlet: <Plug className="w-3.5 h-3.5" />,
  Window: <Sun className="w-3.5 h-3.5" />,
  Monitor: <Monitor className="w-3.5 h-3.5" />,
  "Wi-Fi": <Wifi className="w-3.5 h-3.5" />,
};

const zoneColors: Record<string, { bg: string; border: string; text: string; label: string }> = {
  quiet: { bg: "rgba(59,130,246,0.06)", border: "#3b82f6", text: "text-blue-600", label: "Quiet Zone" },
  collab: { bg: "rgba(34,197,94,0.06)", border: "#22c55e", text: "text-green-600", label: "Collaboration" },
  calls: { bg: "rgba(234,179,8,0.06)", border: "#eab308", text: "text-yellow-600", label: "Calls Corner" },
};

export default function DeskMapPage() {
  const params = useParams();
  const listing = listings.find((l) => l.id === params.id) || listings[0];

  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [workMode, setWorkMode] = useState<"focus" | "social" | null>(null);
  const [booked, setBooked] = useState(false);
  const [deskFilter, setDeskFilter] = useState<string[]>([]);
  const [mobileSheet, setMobileSheet] = useState<"collapsed" | "peek" | "full">("collapsed");

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 1.8));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.6));
  const handleFit = () => setZoom(1);

  const toggleDeskFilter = (f: string) => {
    setDeskFilter((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  const getFilteredDesks = useCallback(() => {
    let filtered = desks;
    if (workMode === "focus") filtered = filtered.filter((d) => d.zone === "quiet");
    if (workMode === "social") filtered = filtered.filter((d) => d.zone === "collab");
    if (deskFilter.includes("Near window")) filtered = filtered.filter((d) => d.perks.includes("Window"));
    if (deskFilter.includes("Near outlet")) filtered = filtered.filter((d) => d.perks.includes("Outlet"));
    if (deskFilter.includes("Extra monitor")) filtered = filtered.filter((d) => d.perks.includes("Monitor"));
    if (deskFilter.includes("Quiet zone")) filtered = filtered.filter((d) => d.zone === "quiet");
    return filtered;
  }, [workMode, deskFilter]);

  const filteredDesks = getFilteredDesks();
  const highlightedDeskIds = new Set(filteredDesks.map((d) => d.id));

  const handleBookDesk = () => {
    if (selectedDesk && selectedDesk.available) {
      setBooked(true);
      setMobileSheet("full");
    }
  };

  const handleSelectDesk = (desk: Desk) => {
    if (!booked) {
      setSelectedDesk(desk);
      setMobileSheet("peek");
    }
  };

  const suggestedDesks = desks
    .filter((d) => d.available && d.id !== selectedDesk?.id)
    .sort((a, b) => b.perks.length - a.perks.length)
    .slice(0, 3);

  const checkInCode = `FD-${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-surface-muted">
      {/* ===== TOP BAR ===== */}
      <div className="bg-white border-b border-border-light px-4 sm:px-6 py-3 shrink-0">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/listing/${listing.id}`}
              className="flex items-center gap-1 text-sm font-medium text-text-muted hover:text-brand-600 transition-colors shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="w-px h-5 bg-border-light" />
            <h1 className="text-sm font-bold text-text-primary truncate">{listing.name}</h1>
            <span className="text-xs text-text-muted hidden sm:inline">Today, 2h</span>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-success" />
              <span className="text-xs text-text-muted">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-border-default" />
              <span className="text-xs text-text-muted">Booked</span>
            </div>
            {booked && (
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-brand-600" />
                <span className="text-xs text-text-muted">Your desk</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 bg-surface-muted rounded-xl p-1">
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === "map" ? "bg-white text-text-primary shadow-sm" : "text-text-muted"
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              Map
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === "list" ? "bg-white text-text-primary shadow-sm" : "text-text-muted"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANEL (desktop) */}
        <div className="hidden sm:flex w-80 lg:w-96 bg-white border-r border-border-light overflow-y-auto shrink-0 flex-col">
          {/* Work mode */}
          <div className="p-4 border-b border-border-light">
            <p className="text-xs font-semibold text-text-muted mb-2">Work mode</p>
            <div className="flex gap-2">
              <button
                onClick={() => setWorkMode(workMode === "focus" ? null : "focus")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all btn-press ${
                  workMode === "focus" ? "bg-brand-600 text-white" : "bg-surface-muted text-text-secondary hover:bg-brand-50"
                }`}
              >
                <Headphones className="w-4 h-4" />
                Focus
              </button>
              <button
                onClick={() => setWorkMode(workMode === "social" ? null : "social")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all btn-press ${
                  workMode === "social" ? "bg-green-600 text-white" : "bg-surface-muted text-text-secondary hover:bg-green-50"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Social
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-border-light">
            <p className="text-xs font-semibold text-text-muted mb-2">Filter desks</p>
            <div className="flex flex-wrap gap-1.5">
              {["Near window", "Near outlet", "Extra monitor", "Quiet zone"].map((f) => (
                <button
                  key={f}
                  onClick={() => toggleDeskFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    deskFilter.includes(f) ? "bg-brand-600 text-white" : "bg-surface-muted text-text-secondary hover:bg-brand-50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Desk list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {booked && selectedDesk && (
              <div className="p-3 rounded-[var(--radius-card)] bg-brand-50 border border-brand-200 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-4 h-4 text-brand-600" />
                  <span className="text-sm font-bold text-brand-700">Your desk: {selectedDesk.label}</span>
                </div>
                <p className="text-xs text-brand-600">You&apos;re booked. Go build.</p>
              </div>
            )}

            {filteredDesks.map((desk) => (
              <button
                key={desk.id}
                onClick={() => handleSelectDesk(desk)}
                className={`w-full text-left p-3 rounded-[var(--radius-card)] border transition-all ${
                  selectedDesk?.id === desk.id
                    ? booked ? "border-brand-600 bg-brand-50" : "border-brand-400 bg-brand-50"
                    : desk.available
                    ? "border-border-light bg-white hover:border-brand-300 hover:bg-brand-50/50"
                    : "border-border-light bg-surface-muted opacity-60 cursor-not-allowed"
                }`}
                disabled={!desk.available && !booked}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-text-primary">{desk.label}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                    booked && selectedDesk?.id === desk.id
                      ? "bg-brand-600 text-white"
                      : desk.available ? "bg-success/10 text-green-700" : "bg-red-50 text-red-500"
                  }`}>
                    {booked && selectedDesk?.id === desk.id ? "Your desk" : desk.available ? "Available" : "Booked"}
                  </span>
                </div>
                <span className={`text-xs font-medium ${zoneColors[desk.zone].text}`}>
                  {zoneColors[desk.zone].label}
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {desk.perks.map((p) => (
                    <span key={p} className="inline-flex items-center gap-1 text-xs text-text-muted">
                      {perkIconSmall[p]} {p}
                    </span>
                  ))}
                </div>
              </button>
            ))}

            {filteredDesks.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm font-medium text-text-primary mb-1">No desks match that filter</p>
                <p className="text-xs text-text-muted">Try removing a filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* MAIN CANVAS */}
        {viewMode === "map" && (
          <div className="flex-1 flex flex-col relative bg-surface-muted overflow-hidden">
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8">
              <svg
                width={680 * zoom}
                height={540 * zoom}
                viewBox="0 0 680 540"
                className="transition-all duration-200"
                style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.06))" }}
              >
                <rect x="0" y="0" width="680" height="540" rx="16" fill="white" stroke="#e2e8f0" strokeWidth="1" />
                {Array.from({ length: 17 }).map((_, i) => (
                  <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="540" stroke="#f1f5f9" strokeWidth="0.5" />
                ))}
                {Array.from({ length: 14 }).map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={i * 40} x2="680" y2={i * 40} stroke="#f1f5f9" strokeWidth="0.5" />
                ))}

                {/* Zones */}
                {zones.map((zone) => {
                  const zc = zoneColors[zone.type];
                  const dimmed = workMode && (
                    (workMode === "focus" && zone.type !== "quiet") ||
                    (workMode === "social" && zone.type !== "collab")
                  );
                  return (
                    <g key={zone.id} opacity={dimmed ? 0.25 : 1} className="transition-opacity duration-300">
                      <rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} rx="12" fill={zc.bg} stroke={zc.border} strokeWidth="1.5" strokeDasharray="6 3" />
                      <text x={zone.x + 12} y={zone.y + 24} fontSize="11" fontWeight="600" fill={zc.border} opacity={0.8}>{zone.name}</text>
                    </g>
                  );
                })}

                {/* Amenities */}
                {amenities.map((am) => (
                  <g key={am.id}>
                    <circle cx={am.x} cy={am.y} r="14" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                    <text x={am.x} y={am.y + 4} textAnchor="middle" fontSize="10" fill="#94a3b8">
                      {am.type === "coffee" ? "\u2615" : am.type === "printer" ? "\u2399" : am.type === "window" ? "\u2600" : "\u25A1"}
                    </text>
                  </g>
                ))}

                {/* Desks */}
                {desks.map((desk) => {
                  const isSelected = selectedDesk?.id === desk.id;
                  const isHighlighted = highlightedDeskIds.has(desk.id);
                  const isBooked = booked && isSelected;
                  const dimmed = !isHighlighted && (deskFilter.length > 0 || workMode);

                  return (
                    <g
                      key={desk.id}
                      onClick={() => handleSelectDesk(desk)}
                      className={`${desk.available && !booked ? "cursor-pointer" : ""}`}
                      opacity={dimmed ? 0.25 : 1}
                    >
                      <rect
                        x={desk.x} y={desk.y} width={desk.width} height={desk.height} rx="8"
                        fill={isBooked ? "#2563eb" : isSelected ? "#dbeafe" : desk.available ? "#f0fdf4" : "#f1f5f9"}
                        stroke={isBooked ? "#1d4ed8" : isSelected ? "#3b82f6" : desk.available ? "#86efac" : "#cbd5e1"}
                        strokeWidth={isSelected || isBooked ? "2" : "1"}
                      />
                      <text
                        x={desk.x + desk.width / 2} y={desk.y + desk.height / 2 + 4}
                        textAnchor="middle" fontSize="10" fontWeight={isBooked ? "700" : "600"}
                        fill={isBooked ? "white" : desk.available ? "#166534" : "#94a3b8"}
                      >
                        {desk.label}
                      </text>
                      {desk.perks.length > 0 && (
                        <g>
                          {desk.perks.map((p, pi) => (
                            <circle key={p} cx={desk.x + 10 + pi * 14} cy={desk.y - 6} r="5"
                              fill={p === "Outlet" ? "#f97316" : p === "Monitor" ? "#8b5cf6" : p === "Window" ? "#eab308" : "#94a3b8"} opacity={0.7} />
                          ))}
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Best match sparkles */}
                {desks.filter((d) => d.available && d.perks.length >= 2 && highlightedDeskIds.has(d.id)).map((desk) => (
                  <text key={`best-${desk.id}`} x={desk.x + desk.width - 4} y={desk.y + 10} fontSize="10" className="animate-float">{"\u2728"}</text>
                ))}
              </svg>
            </div>

            {/* Zoom controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-10">
              <button onClick={handleZoomIn} className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-surface-muted transition-colors"><ZoomIn className="w-4 h-4 text-text-primary" /></button>
              <button onClick={handleZoomOut} className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-surface-muted transition-colors"><ZoomOut className="w-4 h-4 text-text-primary" /></button>
              <button onClick={handleFit} className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-surface-muted transition-colors"><Maximize2 className="w-4 h-4 text-text-primary" /></button>
            </div>

            {/* Desktop info panel */}
            {selectedDesk && !booked && (
              <div className="hidden sm:block absolute bottom-4 left-1/2 -translate-x-1/2 w-96 max-w-[calc(100%-32px)] bg-white rounded-[var(--radius-card)] border border-border-light p-5 animate-fade-in-up z-10" style={{ boxShadow: "var(--shadow-elevated)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-text-primary">{selectedDesk.label}</h3>
                    <span className={`text-xs font-medium ${zoneColors[selectedDesk.zone].text}`}>{zoneColors[selectedDesk.zone].label}</span>
                  </div>
                  <button onClick={() => setSelectedDesk(null)} className="w-8 h-8 rounded-lg hover:bg-surface-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedDesk.perks.map((p) => (
                    <span key={p} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-muted text-xs font-medium text-text-secondary">{perkIconSmall[p]} {p}</span>
                  ))}
                </div>
                {selectedDesk.whyLike && (
                  <p className="text-xs text-brand-600 bg-brand-50 px-3 py-2 rounded-lg mb-3 font-medium">{selectedDesk.whyLike}</p>
                )}
                {selectedDesk.available ? (
                  <button onClick={handleBookDesk} className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-[var(--radius-button)] btn-press transition-colors">Book this desk</button>
                ) : (
                  <div>
                    <p className="text-sm text-red-500 font-medium mb-2">This desk is taken for your time.</p>
                    <p className="text-xs text-text-muted mb-2">Want the closest one instead?</p>
                    <div className="flex gap-2">
                      {suggestedDesks.map((d) => (
                        <button key={d.id} onClick={() => handleSelectDesk(d)} className="flex-1 py-2 px-3 text-xs font-semibold bg-surface-muted hover:bg-brand-50 rounded-lg transition-colors">{d.label}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Desktop booked confirmation */}
            {booked && (
              <div className="hidden sm:block absolute bottom-4 left-1/2 -translate-x-1/2 w-96 bg-white rounded-[var(--radius-card)] p-6 text-center animate-fade-in-up z-10" style={{ boxShadow: "var(--shadow-elevated)" }}>
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-1">You&apos;re booked!</h3>
                <p className="text-sm text-text-secondary mb-4">Desk {selectedDesk?.label} is yours. Go build.</p>
                <div className="bg-surface-muted rounded-2xl p-4 mb-4">
                  <QrCode className="w-8 h-8 text-brand-600 mx-auto mb-1" />
                  <p className="text-xs text-text-muted">Check-in code</p>
                  <p className="text-xl font-bold text-text-primary tracking-wider font-mono">{checkInCode}</p>
                </div>
                <div className="flex gap-3">
                  <Link href="/bookings" className="flex-1 py-2.5 bg-brand-600 text-white text-sm font-bold rounded-xl btn-press hover:bg-brand-700 transition-colors flex items-center justify-center gap-1.5">
                    <CalendarCheck className="w-4 h-4" /> My bookings
                  </Link>
                  <Link href="/" className="flex-1 py-2.5 border border-border-light text-text-primary text-sm font-semibold rounded-xl hover:bg-surface-muted transition-colors text-center">
                    Home
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === "list" && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-2xl mx-auto space-y-2">
              {filteredDesks.map((desk) => (
                <button
                  key={desk.id}
                  onClick={() => handleSelectDesk(desk)}
                  className={`w-full text-left p-4 rounded-[var(--radius-card)] border bg-white transition-all ${
                    selectedDesk?.id === desk.id ? "border-brand-400 bg-brand-50" : desk.available ? "border-border-light hover:border-brand-300" : "opacity-60 border-border-light"
                  }`}
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base font-bold text-text-primary">{desk.label}</span>
                      <span className={`ml-2 text-xs font-medium ${zoneColors[desk.zone].text}`}>{zoneColors[desk.zone].label}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${desk.available ? "bg-success/10 text-green-700" : "bg-red-50 text-red-500"}`}>
                      {desk.available ? "Available" : "Booked"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {desk.perks.map((p) => (
                      <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface-muted text-xs font-medium text-text-secondary">{perkIconSmall[p]} {p}</span>
                    ))}
                  </div>
                  {desk.whyLike && <p className="text-xs text-brand-600 mt-2">{desk.whyLike}</p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===== MOBILE BOTTOM SHEET ===== */}
        <div
          className={`sm:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-[24px] z-20 transition-all duration-300 ease-out ${
            mobileSheet === "full" ? "h-[75vh]" : mobileSheet === "peek" ? "h-[280px]" : "h-[100px]"
          }`}
          style={{ boxShadow: "0 -4px 30px rgba(0,0,0,0.1)" }}
        >
          {/* Drag handle */}
          <button
            onClick={() => setMobileSheet(mobileSheet === "full" ? "collapsed" : mobileSheet === "peek" ? "full" : "peek")}
            className="w-full flex flex-col items-center pt-3 pb-2"
          >
            <div className="w-10 h-1 bg-border-default rounded-full mb-2" />
            <ChevronUp className={`w-4 h-4 text-text-muted transition-transform ${mobileSheet === "full" ? "rotate-180" : ""}`} />
          </button>

          <div className="px-4 pb-4 overflow-y-auto" style={{ maxHeight: "calc(100% - 44px)" }}>
            {/* Collapsed: Quick filters */}
            {mobileSheet === "collapsed" && !selectedDesk && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => { setWorkMode(workMode === "focus" ? null : "focus"); setMobileSheet("peek"); }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap ${workMode === "focus" ? "bg-brand-600 text-white" : "bg-surface-muted text-text-secondary"}`}
                >
                  <Headphones className="w-3.5 h-3.5" /> Focus
                </button>
                <button
                  onClick={() => { setWorkMode(workMode === "social" ? null : "social"); setMobileSheet("peek"); }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap ${workMode === "social" ? "bg-green-600 text-white" : "bg-surface-muted text-text-secondary"}`}
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Social
                </button>
                <span className="text-xs text-text-muted self-center whitespace-nowrap">
                  {filteredDesks.filter((d) => d.available).length} available
                </span>
              </div>
            )}

            {/* Peek/Full: Selected desk or list */}
            {mobileSheet !== "collapsed" && selectedDesk && !booked && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">{selectedDesk.label}</h3>
                    <span className={`text-xs font-medium ${zoneColors[selectedDesk.zone].text}`}>{zoneColors[selectedDesk.zone].label}</span>
                  </div>
                  <button onClick={() => { setSelectedDesk(null); setMobileSheet("collapsed"); }} className="w-8 h-8 rounded-lg hover:bg-surface-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedDesk.perks.map((p) => (
                    <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-muted text-xs font-medium text-text-secondary">{perkIconSmall[p]} {p}</span>
                  ))}
                </div>
                {selectedDesk.whyLike && (
                  <p className="text-xs text-brand-600 bg-brand-50 px-3 py-2 rounded-lg mb-3 font-medium">{selectedDesk.whyLike}</p>
                )}
                {selectedDesk.available ? (
                  <button onClick={handleBookDesk} className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-[var(--radius-button)] btn-press transition-colors text-base">
                    Book this desk
                  </button>
                ) : (
                  <div>
                    <p className="text-sm text-red-500 font-medium mb-2">This desk is taken for your time.</p>
                    <p className="text-xs text-text-muted mb-2">Want the closest one instead?</p>
                    <div className="flex gap-2">
                      {suggestedDesks.map((d) => (
                        <button key={d.id} onClick={() => handleSelectDesk(d)} className="flex-1 py-2.5 text-xs font-semibold bg-surface-muted hover:bg-brand-50 rounded-lg">{d.label}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Booked state */}
            {booked && selectedDesk && (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-1">You&apos;re booked!</h3>
                <p className="text-sm text-text-secondary mb-4">Desk {selectedDesk.label} is yours. Go build.</p>
                <div className="bg-surface-muted rounded-2xl p-4 mb-4">
                  <QrCode className="w-8 h-8 text-brand-600 mx-auto mb-1" />
                  <p className="text-xs text-text-muted">Check-in code</p>
                  <p className="text-xl font-bold text-text-primary tracking-wider font-mono">{checkInCode}</p>
                </div>
                <div className="flex gap-3">
                  <Link href="/bookings" className="flex-1 py-3 bg-brand-600 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-1.5">
                    <CalendarCheck className="w-4 h-4" /> My bookings
                  </Link>
                  <Link href="/" className="flex-1 py-3 border border-border-light text-text-primary text-sm font-semibold rounded-xl text-center">Home</Link>
                </div>
              </div>
            )}

            {/* Desk list in full mode */}
            {mobileSheet === "full" && !selectedDesk && !booked && (
              <div className="space-y-2">
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                  {["Near window", "Near outlet", "Extra monitor", "Quiet zone"].map((f) => (
                    <button key={f} onClick={() => toggleDeskFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${deskFilter.includes(f) ? "bg-brand-600 text-white" : "bg-surface-muted text-text-secondary"}`}
                    >{f}</button>
                  ))}
                </div>
                {filteredDesks.map((desk) => (
                  <button key={desk.id} onClick={() => handleSelectDesk(desk)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${desk.available ? "border-border-light bg-white" : "border-border-light bg-surface-muted opacity-60"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{desk.label}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${desk.available ? "bg-success/10 text-green-700" : "bg-red-50 text-red-500"}`}>
                        {desk.available ? "Available" : "Booked"}
                      </span>
                    </div>
                    <span className={`text-xs ${zoneColors[desk.zone].text}`}>{zoneColors[desk.zone].label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
