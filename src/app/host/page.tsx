"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  Palette,
  Building,
  LayoutGrid,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Eye,
  Check,
  GripVertical,
  VolumeX,
  MessageSquare,
  Phone,
  Plug,
  Coffee,
  DoorOpen,
  Printer,
  Sun,
  Monitor,
  Map as MapIcon,
  Move,
  MousePointer2,
} from "lucide-react";
import { hostTemplates } from "@/data/mock";

const templateIcons: Record<string, React.ReactNode> = {
  home: <Home className="w-6 h-6" />,
  palette: <Palette className="w-6 h-6" />,
  building: <Building className="w-6 h-6" />,
  "layout-grid": <LayoutGrid className="w-6 h-6" />,
};

const zoneOptions = [
  { type: "quiet" as const, label: "Quiet Zone", icon: <VolumeX className="w-4 h-4" />, color: "#3b82f6" },
  { type: "collab" as const, label: "Collaboration", icon: <MessageSquare className="w-4 h-4" />, color: "#22c55e" },
  { type: "calls" as const, label: "Calls Corner", icon: <Phone className="w-4 h-4" />, color: "#eab308" },
];

const amenityOptions = [
  { type: "outlet", label: "Outlet", icon: <Plug className="w-4 h-4" />, emoji: "\u26A1" },
  { type: "coffee", label: "Coffee", icon: <Coffee className="w-4 h-4" />, emoji: "\u2615" },
  { type: "restroom", label: "Restroom", icon: <DoorOpen className="w-4 h-4" />, emoji: "\u25A1" },
  { type: "printer", label: "Printer", icon: <Printer className="w-4 h-4" />, emoji: "\u2399" },
  { type: "window", label: "Window", icon: <Sun className="w-4 h-4" />, emoji: "\u2600" },
  { type: "door", label: "Door", icon: <DoorOpen className="w-4 h-4" />, emoji: "\u25A1" },
];

interface BuilderDesk {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface BuilderZone {
  id: string;
  type: "quiet" | "collab" | "calls";
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BuilderAmenity {
  id: string;
  type: string;
  x: number;
  y: number;
}

const CANVAS_W = 600;
const CANVAS_H = 400;
const DESK_W = 65;
const DESK_H = 35;

export default function HostPage() {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [builderZones, setBuilderZones] = useState<BuilderZone[]>([]);
  const [builderDesks, setBuilderDesks] = useState<BuilderDesk[]>([]);
  const [builderAmenities, setBuilderAmenities] = useState<BuilderAmenity[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [deskCounter, setDeskCounter] = useState(1);
  const [published, setPublished] = useState(false);

  // Drag state
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<{
    kind: "desk" | "zone" | "amenity";
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const getSVGPoint = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      const scaleX = CANVAS_W / rect.width;
      const scaleY = CANVAS_H / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const handlePointerDown = useCallback(
    (kind: "desk" | "zone" | "amenity", id: string, e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const pt = getSVGPoint(e.clientX, e.clientY);

      let offsetX = 0;
      let offsetY = 0;
      if (kind === "desk") {
        const desk = builderDesks.find((d) => d.id === id);
        if (desk) { offsetX = pt.x - desk.x; offsetY = pt.y - desk.y; }
      } else if (kind === "zone") {
        const zone = builderZones.find((z) => z.id === id);
        if (zone) { offsetX = pt.x - zone.x; offsetY = pt.y - zone.y; }
      } else {
        const am = builderAmenities.find((a) => a.id === id);
        if (am) { offsetX = pt.x - am.x; offsetY = pt.y - am.y; }
      }

      setDragging({ kind, id, offsetX, offsetY });
      setActiveItem(id);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [builderDesks, builderZones, builderAmenities, getSVGPoint]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const pt = getSVGPoint(e.clientX, e.clientY);
      const nx = pt.x - dragging.offsetX;
      const ny = pt.y - dragging.offsetY;

      // Snap to 20px grid
      const sx = Math.round(nx / 20) * 20;
      const sy = Math.round(ny / 20) * 20;

      if (dragging.kind === "desk") {
        setBuilderDesks((prev) =>
          prev.map((d) =>
            d.id === dragging.id
              ? { ...d, x: Math.max(0, Math.min(sx, CANVAS_W - DESK_W)), y: Math.max(0, Math.min(sy, CANVAS_H - DESK_H)) }
              : d
          )
        );
      } else if (dragging.kind === "zone") {
        setBuilderZones((prev) =>
          prev.map((z) =>
            z.id === dragging.id
              ? { ...z, x: Math.max(0, Math.min(sx, CANVAS_W - z.width)), y: Math.max(0, Math.min(sy, CANVAS_H - z.height)) }
              : z
          )
        );
      } else {
        setBuilderAmenities((prev) =>
          prev.map((a) =>
            a.id === dragging.id
              ? { ...a, x: Math.max(16, Math.min(sx, CANVAS_W - 16)), y: Math.max(16, Math.min(sy, CANVAS_H - 16)) }
              : a
          )
        );
      }
    },
    [dragging, getSVGPoint]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const addZone = (type: "quiet" | "collab" | "calls") => {
    const label = zoneOptions.find((z) => z.type === type)?.label || "Zone";
    setBuilderZones((prev) => [
      ...prev,
      {
        id: `bz-${Date.now()}`,
        type,
        name: label,
        x: 40 + Math.random() * 200,
        y: 40 + Math.random() * 100,
        width: 200,
        height: 160,
      },
    ]);
  };

  const removeZone = (id: string) => setBuilderZones((prev) => prev.filter((z) => z.id !== id));

  const addDesk = () => {
    const label = `A${deskCounter}`;
    setDeskCounter((c) => c + 1);
    setBuilderDesks((prev) => [
      ...prev,
      { id: `bd-${Date.now()}`, label, x: 100 + Math.random() * 300, y: 100 + Math.random() * 200 },
    ]);
  };

  const duplicateDesk = (desk: BuilderDesk) => {
    const label = `A${deskCounter}`;
    setDeskCounter((c) => c + 1);
    setBuilderDesks((prev) => [...prev, { id: `bd-${Date.now()}`, label, x: desk.x + 80, y: desk.y }]);
  };

  const removeDesk = (id: string) => setBuilderDesks((prev) => prev.filter((d) => d.id !== id));

  const addAmenity = (type: string) => {
    setBuilderAmenities((prev) => [
      ...prev,
      { id: `ba-${Date.now()}`, type, x: 200 + Math.random() * 200, y: 200 + Math.random() * 100 },
    ]);
  };

  const removeAmenity = (id: string) => setBuilderAmenities((prev) => prev.filter((a) => a.id !== id));

  const zoneColors: Record<string, { bg: string; border: string }> = {
    quiet: { bg: "rgba(59,130,246,0.06)", border: "#3b82f6" },
    collab: { bg: "rgba(34,197,94,0.06)", border: "#22c55e" },
    calls: { bg: "rgba(234,179,8,0.06)", border: "#eab308" },
  };

  const steps = [
    { num: 1, label: "Template" },
    { num: 2, label: "Zones" },
    { num: 3, label: "Desks" },
    { num: 4, label: "Amenities" },
    { num: 5, label: "Preview" },
  ];

  // Shared canvas renderer
  const renderCanvas = (opts: { showGrid?: boolean; interactive?: "zone" | "desk" | "amenity" | "all"; dimNonActive?: boolean; preview?: boolean }) => (
    <svg
      ref={svgRef}
      width="100%"
      height="400"
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      className={`${dragging ? "cursor-grabbing" : ""}`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ touchAction: "none" }}
    >
      <rect width={CANVAS_W} height={CANVAS_H} fill="white" />
      {/* Grid */}
      {opts.showGrid !== false && (
        <>
          {Array.from({ length: Math.ceil(CANVAS_W / 20) + 1 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2={CANVAS_H} stroke={i % 2 === 0 ? "#e2e8f0" : "#f1f5f9"} strokeWidth={i % 2 === 0 ? "0.5" : "0.3"} opacity={0.5} />
          ))}
          {Array.from({ length: Math.ceil(CANVAS_H / 20) + 1 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 20} x2={CANVAS_W} y2={i * 20} stroke={i % 2 === 0 ? "#e2e8f0" : "#f1f5f9"} strokeWidth={i % 2 === 0 ? "0.5" : "0.3"} opacity={0.5} />
          ))}
        </>
      )}

      {/* Zones */}
      {builderZones.map((zone) => {
        const zc = zoneColors[zone.type];
        const isActive = activeItem === zone.id;
        const canDrag = opts.interactive === "zone" || opts.interactive === "all";
        const dimmed = opts.dimNonActive && opts.interactive !== "zone" && opts.interactive !== "all";
        return (
          <g
            key={zone.id}
            opacity={dimmed ? 0.3 : 1}
            onPointerDown={canDrag ? (e) => handlePointerDown("zone", zone.id, e) : undefined}
            className={canDrag ? "cursor-grab" : ""}
          >
            <rect
              x={zone.x} y={zone.y} width={zone.width} height={zone.height} rx="12"
              fill={zc.bg} stroke={zc.border}
              strokeWidth={isActive && canDrag ? "2.5" : "1.5"}
              strokeDasharray={isActive && canDrag ? "none" : "6 3"}
            />
            <text x={zone.x + 12} y={zone.y + 24} fontSize="11" fontWeight="600" fill={zc.border} style={{ pointerEvents: "none" }}>
              {zone.name}
            </text>
            {canDrag && (
              <g opacity={0.5} style={{ pointerEvents: "none" }}>
                <rect x={zone.x + zone.width - 24} y={zone.y + 4} width="20" height="14" rx="3" fill={zc.border} opacity={0.15} />
                <text x={zone.x + zone.width - 14} y={zone.y + 14} textAnchor="middle" fontSize="8" fill={zc.border}>{"\u2725"}</text>
              </g>
            )}
          </g>
        );
      })}

      {/* Desks */}
      {builderDesks.map((desk) => {
        const isActive = activeItem === desk.id;
        const canDrag = opts.interactive === "desk" || opts.interactive === "all";
        const dimmed = opts.dimNonActive && opts.interactive !== "desk" && opts.interactive !== "all";
        return (
          <g
            key={desk.id}
            opacity={dimmed ? 0.3 : 1}
            onPointerDown={canDrag ? (e) => handlePointerDown("desk", desk.id, e) : undefined}
            className={canDrag ? "cursor-grab" : ""}
          >
            <rect
              x={desk.x} y={desk.y} width={DESK_W} height={DESK_H} rx="8"
              fill={isActive && canDrag ? "#dbeafe" : opts.preview ? "#f0fdf4" : "#f0fdf4"}
              stroke={isActive && canDrag ? "#3b82f6" : opts.preview ? "#86efac" : "#86efac"}
              strokeWidth={isActive && canDrag ? "2.5" : "1.5"}
            />
            <text
              x={desk.x + DESK_W / 2} y={desk.y + DESK_H / 2 + 4}
              textAnchor="middle" fontSize="10" fontWeight="700"
              fill={isActive && canDrag ? "#1e40af" : "#166534"}
              style={{ pointerEvents: "none" }}
            >
              {desk.label}
            </text>
            {canDrag && (
              <g opacity={0.4} style={{ pointerEvents: "none" }}>
                <circle cx={desk.x + DESK_W - 8} cy={desk.y + 8} r="5" fill="#3b82f6" opacity={0.2} />
                <text x={desk.x + DESK_W - 8} y={desk.y + 11} textAnchor="middle" fontSize="7" fill="#3b82f6">{"\u2725"}</text>
              </g>
            )}
          </g>
        );
      })}

      {/* Amenities */}
      {builderAmenities.map((am) => {
        const isActive = activeItem === am.id;
        const canDrag = opts.interactive === "amenity" || opts.interactive === "all";
        const dimmed = opts.dimNonActive && opts.interactive !== "amenity" && opts.interactive !== "all";
        const emoji = amenityOptions.find((a) => a.type === am.type)?.emoji || "\u25A1";
        return (
          <g
            key={am.id}
            opacity={dimmed ? 0.3 : 1}
            onPointerDown={canDrag ? (e) => handlePointerDown("amenity", am.id, e) : undefined}
            className={canDrag ? "cursor-grab" : ""}
          >
            <circle
              cx={am.x} cy={am.y} r="16"
              fill={isActive && canDrag ? "#eff6ff" : "#f8fafc"}
              stroke={isActive && canDrag ? "#3b82f6" : "#e2e8f0"}
              strokeWidth={isActive && canDrag ? "2.5" : "1.5"}
            />
            <text x={am.x} y={am.y + 4} textAnchor="middle" fontSize="12" fill="#64748b" style={{ pointerEvents: "none" }}>
              {emoji}
            </text>
          </g>
        );
      })}

      {/* Empty state */}
      {builderDesks.length === 0 && builderZones.length === 0 && builderAmenities.length === 0 && (
        <text x={CANVAS_W / 2} y={CANVAS_H / 2} textAnchor="middle" fontSize="14" fill="#94a3b8" fontWeight="500">
          {step === 2 ? "Click a zone type to add, then drag to position" : step === 3 ? "Add desks and drag them into place" : step === 4 ? "Add amenities and drag to position" : "Go back to add zones, desks, and amenities"}
        </text>
      )}
    </svg>
  );

  return (
    <div className="min-h-screen bg-blueprint">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Desk Map Builder
          </h1>
          <p className="text-text-secondary mt-1">Create your floor plan in minutes — drag, drop, done.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <button
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  step === s.num ? "bg-brand-600 text-white" : step > s.num ? "bg-brand-50 text-brand-700" : "bg-surface-muted text-text-muted"
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : <span className="w-5 h-5 rounded-full bg-current/10 flex items-center justify-center text-xs">{s.num}</span>}
                {s.label}
              </button>
              {i < steps.length - 1 && <div className="w-6 h-px bg-border-light hidden sm:block" />}
            </div>
          ))}
        </div>

        {/* ===== STEP 1: TEMPLATE ===== */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <h2 className="text-xl font-bold text-text-primary mb-2">Choose a template</h2>
            <p className="text-sm text-text-secondary mb-6">Start with a layout that matches your space.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {hostTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`p-6 rounded-[var(--radius-card)] border-2 text-left transition-all card-lift ${
                    selectedTemplate === t.id ? "border-brand-600 bg-brand-50" : "border-border-light bg-white hover:border-brand-300"
                  }`}
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${selectedTemplate === t.id ? "bg-brand-600 text-white" : "bg-surface-muted text-text-secondary"}`}>
                    {templateIcons[t.icon]}
                  </div>
                  <h3 className="text-base font-bold text-text-primary mb-0.5">{t.label}</h3>
                  <p className="text-xs text-text-muted">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===== STEP 2: ZONES ===== */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-1">Add zones</h2>
                <p className="text-sm text-text-secondary">Click to add, then <span className="font-semibold text-brand-600">drag to position</span>.</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-xs font-semibold text-brand-700">
                <Move className="w-3.5 h-3.5" /> Drag to move
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-64 shrink-0 space-y-3">
                {zoneOptions.map((z) => (
                  <button key={z.type} onClick={() => addZone(z.type)} className="w-full flex items-center gap-3 p-4 rounded-[var(--radius-card)] bg-white border border-border-light hover:border-brand-300 transition-all text-left" style={{ boxShadow: "var(--shadow-card)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${z.color}15`, color: z.color }}>{z.icon}</div>
                    <div>
                      <span className="text-sm font-bold text-text-primary block">{z.label}</span>
                      <span className="text-xs text-text-muted">Click to add</span>
                    </div>
                    <Plus className="w-4 h-4 text-text-muted ml-auto" />
                  </button>
                ))}
                {builderZones.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border-light space-y-2">
                    <p className="text-xs font-semibold text-text-muted">Added zones</p>
                    {builderZones.map((z) => (
                      <div key={z.id} className={`flex items-center justify-between p-2 rounded-lg ${activeItem === z.id ? "bg-brand-50 border border-brand-200" : "bg-surface-muted"}`}>
                        <button onClick={() => setActiveItem(z.id)} className="text-xs font-medium text-text-primary">{z.name}</button>
                        <button onClick={() => removeZone(z.id)} className="text-text-muted hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 bg-white rounded-[var(--radius-card)] border border-border-light overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
                {renderCanvas({ interactive: "zone", dimNonActive: true })}
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 3: DESKS ===== */}
        {step === 3 && (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-1">Place desks</h2>
                <p className="text-sm text-text-secondary">Add desks and <span className="font-semibold text-brand-600">drag to arrange</span>. Snaps to grid.</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-xs font-semibold text-brand-700">
                <MousePointer2 className="w-3.5 h-3.5" /> Drag desks to position
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-64 shrink-0 space-y-3">
                <button onClick={addDesk} className="w-full flex items-center gap-3 p-4 rounded-[var(--radius-card)] bg-brand-600 text-white hover:bg-brand-700 transition-colors" style={{ boxShadow: "var(--shadow-button)" }}>
                  <Plus className="w-5 h-5" />
                  <span className="text-sm font-bold">Add desk</span>
                </button>
                {builderDesks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-text-muted">{builderDesks.length} desks placed</p>
                    {builderDesks.map((desk) => (
                      <div key={desk.id} className={`flex items-center justify-between p-2 rounded-lg border ${activeItem === desk.id ? "bg-brand-50 border-brand-200" : "bg-white border-border-light"}`}>
                        <button onClick={() => setActiveItem(desk.id)} className="flex items-center gap-2">
                          <GripVertical className="w-3.5 h-3.5 text-text-muted" />
                          <span className="text-xs font-bold text-text-primary">{desk.label}</span>
                        </button>
                        <div className="flex items-center gap-1">
                          <button onClick={() => duplicateDesk(desk)} className="p-1 text-text-muted hover:text-brand-600 transition-colors" title="Duplicate"><Copy className="w-3.5 h-3.5" /></button>
                          <button onClick={() => removeDesk(desk.id)} className="p-1 text-text-muted hover:text-red-500 transition-colors" title="Remove"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 bg-white rounded-[var(--radius-card)] border border-border-light overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
                {renderCanvas({ interactive: "desk", dimNonActive: true })}
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 4: AMENITIES ===== */}
        {step === 4 && (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-1">Add amenities</h2>
                <p className="text-sm text-text-secondary">Mark outlets, coffee, restrooms. <span className="font-semibold text-brand-600">Drag to position</span>.</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-xs font-semibold text-brand-700">
                <Move className="w-3.5 h-3.5" /> Drag to position
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-64 shrink-0">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  {amenityOptions.map((a) => (
                    <button key={a.type} onClick={() => addAmenity(a.type)} className="flex items-center gap-2 p-3 rounded-xl bg-white border border-border-light hover:border-brand-300 hover:bg-brand-50 transition-all text-left">
                      <div className="w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center text-text-secondary">{a.icon}</div>
                      <span className="text-xs font-semibold text-text-primary">{a.label}</span>
                      <Plus className="w-3.5 h-3.5 text-text-muted ml-auto" />
                    </button>
                  ))}
                </div>
                {builderAmenities.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-text-muted">{builderAmenities.length} amenities</p>
                    {builderAmenities.map((a) => (
                      <div key={a.id} className={`flex items-center justify-between p-2 rounded-lg ${activeItem === a.id ? "bg-brand-50 border border-brand-200" : "bg-surface-muted"}`}>
                        <button onClick={() => setActiveItem(a.id)} className="text-xs font-medium text-text-primary capitalize">{a.type}</button>
                        <button onClick={() => removeAmenity(a.id)} className="text-text-muted hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 bg-white rounded-[var(--radius-card)] border border-border-light overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
                {renderCanvas({ interactive: "amenity", dimNonActive: true })}
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 5: PREVIEW ===== */}
        {step === 5 && !published && (
          <div className="animate-fade-in-up">
            <h2 className="text-xl font-bold text-text-primary mb-2">Preview your space</h2>
            <p className="text-sm text-text-secondary mb-6">This is how guests will see your desk map. Drag to fine-tune.</p>

            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setPreviewMode(false)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${!previewMode ? "bg-brand-600 text-white" : "bg-surface-muted text-text-secondary"}`}>
                <MapIcon className="w-4 h-4" /> Edit View
              </button>
              <button onClick={() => setPreviewMode(true)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${previewMode ? "bg-brand-600 text-white" : "bg-surface-muted text-text-secondary"}`}>
                <Eye className="w-4 h-4" /> Guest Preview
              </button>
            </div>

            <div className="bg-white rounded-[var(--radius-card)] border border-border-light overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
              {renderCanvas({ interactive: previewMode ? undefined : "all", preview: previewMode })}
            </div>

            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-[var(--radius-card)] p-5 border border-border-light" style={{ boxShadow: "var(--shadow-card)" }}>
                <p className="text-2xl font-bold text-text-primary">{builderZones.length}</p>
                <p className="text-sm text-text-muted">Zones</p>
              </div>
              <div className="bg-white rounded-[var(--radius-card)] p-5 border border-border-light" style={{ boxShadow: "var(--shadow-card)" }}>
                <p className="text-2xl font-bold text-text-primary">{builderDesks.length}</p>
                <p className="text-sm text-text-muted">Desks</p>
              </div>
              <div className="bg-white rounded-[var(--radius-card)] p-5 border border-border-light" style={{ boxShadow: "var(--shadow-card)" }}>
                <p className="text-2xl font-bold text-text-primary">{builderAmenities.length}</p>
                <p className="text-sm text-text-muted">Amenities</p>
              </div>
            </div>
          </div>
        )}

        {/* Published success */}
        {published && (
          <div className="animate-fade-in-up text-center py-16">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Your listing is live!</h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              Your space with {builderDesks.length} desks, {builderZones.length} zones, and {builderAmenities.length} amenities is now visible to thousands of users.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/" className="px-6 py-3 bg-brand-600 text-white font-bold rounded-[var(--radius-button)] btn-press hover:bg-brand-700 transition-colors">
                Back to home
              </Link>
              <button onClick={() => { setPublished(false); setStep(1); }} className="px-6 py-3 border border-border-light text-text-primary font-semibold rounded-[var(--radius-button)] hover:bg-surface-muted transition-colors">
                Create another
              </button>
            </div>
          </div>
        )}

        {/* ===== NAVIGATION ===== */}
        {!published && (
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-border-light">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-button)] text-sm font-semibold transition-all btn-press ${
                step === 1 ? "opacity-40 cursor-not-allowed text-text-muted" : "bg-white border border-border-light text-text-primary hover:bg-surface-muted"
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {step < 5 ? (
              <button
                onClick={nextStep}
                disabled={step === 1 && !selectedTemplate}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-[var(--radius-button)] text-sm font-bold transition-all btn-press ${
                  step === 1 && !selectedTemplate ? "opacity-40 cursor-not-allowed bg-brand-300 text-white" : "bg-brand-600 text-white hover:bg-brand-700"
                }`}
                style={{ boxShadow: "var(--shadow-button)" }}
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setPublished(true)}
                className="flex items-center gap-2 px-8 py-3 bg-brand-600 text-white font-bold rounded-[var(--radius-button)] btn-press hover:bg-brand-700 transition-colors text-base"
                style={{ boxShadow: "var(--shadow-button)" }}
              >
                <Check className="w-5 h-5" /> Publish listing
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
