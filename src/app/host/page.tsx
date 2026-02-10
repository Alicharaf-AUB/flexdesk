"use client";

import { useState, useCallback } from "react";
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
  Move,
  Map as MapIcon,
} from "lucide-react";
import { hostTemplates, zones as defaultZones, type Zone } from "@/data/mock";

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
  { type: "outlet", label: "Outlet", icon: <Plug className="w-4 h-4" /> },
  { type: "coffee", label: "Coffee", icon: <Coffee className="w-4 h-4" /> },
  { type: "restroom", label: "Restroom", icon: <DoorOpen className="w-4 h-4" /> },
  { type: "printer", label: "Printer", icon: <Printer className="w-4 h-4" /> },
  { type: "window", label: "Window", icon: <Sun className="w-4 h-4" /> },
  { type: "door", label: "Door", icon: <DoorOpen className="w-4 h-4" /> },
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

export default function HostPage() {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [builderZones, setBuilderZones] = useState<BuilderZone[]>([]);
  const [builderDesks, setBuilderDesks] = useState<BuilderDesk[]>([]);
  const [builderAmenities, setBuilderAmenities] = useState<BuilderAmenity[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [deskCounter, setDeskCounter] = useState(1);

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

  const removeZone = (id: string) => {
    setBuilderZones((prev) => prev.filter((z) => z.id !== id));
  };

  const addDesk = () => {
    const label = `A${deskCounter}`;
    setDeskCounter((c) => c + 1);
    setBuilderDesks((prev) => [
      ...prev,
      {
        id: `bd-${Date.now()}`,
        label,
        x: 100 + Math.random() * 300,
        y: 100 + Math.random() * 200,
      },
    ]);
  };

  const duplicateDesk = (desk: BuilderDesk) => {
    const label = `A${deskCounter}`;
    setDeskCounter((c) => c + 1);
    setBuilderDesks((prev) => [
      ...prev,
      {
        id: `bd-${Date.now()}`,
        label,
        x: desk.x + 80,
        y: desk.y,
      },
    ]);
  };

  const removeDesk = (id: string) => {
    setBuilderDesks((prev) => prev.filter((d) => d.id !== id));
  };

  const addAmenity = (type: string) => {
    setBuilderAmenities((prev) => [
      ...prev,
      {
        id: `ba-${Date.now()}`,
        type,
        x: 200 + Math.random() * 200,
        y: 200 + Math.random() * 100,
      },
    ]);
  };

  const removeAmenity = (id: string) => {
    setBuilderAmenities((prev) => prev.filter((a) => a.id !== id));
  };

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

  return (
    <div className="min-h-screen bg-blueprint">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Desk Map Builder
          </h1>
          <p className="text-text-secondary mt-1">Create your floor plan in minutes — no CAD skills needed.</p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <button
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  step === s.num
                    ? "bg-brand-600 text-white"
                    : step > s.num
                    ? "bg-brand-50 text-brand-700"
                    : "bg-surface-muted text-text-muted"
                }`}
              >
                {step > s.num ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-current/10 flex items-center justify-center text-xs">
                    {s.num}
                  </span>
                )}
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
                    selectedTemplate === t.id
                      ? "border-brand-600 bg-brand-50"
                      : "border-border-light bg-white hover:border-brand-300"
                  }`}
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                    selectedTemplate === t.id ? "bg-brand-600 text-white" : "bg-surface-muted text-text-secondary"
                  }`}>
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
            <h2 className="text-xl font-bold text-text-primary mb-2">Add zones</h2>
            <p className="text-sm text-text-secondary mb-6">Define different areas in your workspace.</p>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Zone palette */}
              <div className="lg:w-64 shrink-0 space-y-3">
                {zoneOptions.map((z) => (
                  <button
                    key={z.type}
                    onClick={() => addZone(z.type)}
                    className="w-full flex items-center gap-3 p-4 rounded-[var(--radius-card)] bg-white border border-border-light hover:border-brand-300 transition-all text-left"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${z.color}15`, color: z.color }}>
                      {z.icon}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-text-primary block">{z.label}</span>
                      <span className="text-xs text-text-muted">Click to add</span>
                    </div>
                    <Plus className="w-4 h-4 text-text-muted ml-auto" />
                  </button>
                ))}

                {/* Zone list */}
                {builderZones.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border-light space-y-2">
                    <p className="text-xs font-semibold text-text-muted">Added zones</p>
                    {builderZones.map((z) => (
                      <div key={z.id} className="flex items-center justify-between p-2 rounded-lg bg-surface-muted">
                        <span className="text-xs font-medium text-text-primary">{z.name}</span>
                        <button onClick={() => removeZone(z.id)} className="text-text-muted hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Canvas preview */}
              <div className="flex-1 bg-white rounded-[var(--radius-card)] border border-border-light overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
                <svg width="100%" height="400" viewBox="0 0 600 400">
                  <rect width="600" height="400" fill="white" />
                  {/* Grid */}
                  {Array.from({ length: 15 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="400" stroke="#f1f5f9" strokeWidth="0.5" />
                  ))}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 40} x2="600" y2={i * 40} stroke="#f1f5f9" strokeWidth="0.5" />
                  ))}
                  {builderZones.map((zone) => {
                    const zc = zoneColors[zone.type];
                    return (
                      <g key={zone.id}>
                        <rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} rx="12" fill={zc.bg} stroke={zc.border} strokeWidth="1.5" strokeDasharray="6 3" />
                        <text x={zone.x + 12} y={zone.y + 24} fontSize="11" fontWeight="600" fill={zc.border}>{zone.name}</text>
                      </g>
                    );
                  })}
                  {builderZones.length === 0 && (
                    <text x="300" y="200" textAnchor="middle" fontSize="14" fill="#94a3b8" fontWeight="500">
                      Click a zone type to add it here
                    </text>
                  )}
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 3: DESKS ===== */}
        {step === 3 && (
          <div className="animate-fade-in-up">
            <h2 className="text-xl font-bold text-text-primary mb-2">Place desks</h2>
            <p className="text-sm text-text-secondary mb-6">Add and arrange desks in your workspace. Auto-numbered for you.</p>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-64 shrink-0 space-y-3">
                <button
                  onClick={addDesk}
                  className="w-full flex items-center gap-3 p-4 rounded-[var(--radius-card)] bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                  style={{ boxShadow: "var(--shadow-button)" }}
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-sm font-bold">Add desk</span>
                </button>

                {builderDesks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-text-muted">{builderDesks.length} desks placed</p>
                    {builderDesks.map((desk) => (
                      <div key={desk.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-border-light">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-3.5 h-3.5 text-text-muted" />
                          <span className="text-xs font-bold text-text-primary">{desk.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => duplicateDesk(desk)} className="p-1 text-text-muted hover:text-brand-600 transition-colors" title="Duplicate">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => removeDesk(desk.id)} className="p-1 text-text-muted hover:text-red-500 transition-colors" title="Remove">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Canvas */}
              <div className="flex-1 bg-white rounded-[var(--radius-card)] border border-border-light overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
                <svg width="100%" height="400" viewBox="0 0 600 400">
                  <rect width="600" height="400" fill="white" />
                  {Array.from({ length: 15 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="400" stroke="#f1f5f9" strokeWidth="0.5" />
                  ))}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 40} x2="600" y2={i * 40} stroke="#f1f5f9" strokeWidth="0.5" />
                  ))}
                  {builderZones.map((zone) => {
                    const zc = zoneColors[zone.type];
                    return (
                      <g key={zone.id}>
                        <rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} rx="12" fill={zc.bg} stroke={zc.border} strokeWidth="1" strokeDasharray="6 3" opacity={0.5} />
                      </g>
                    );
                  })}
                  {builderDesks.map((desk) => (
                    <g key={desk.id} className="cursor-move">
                      <rect x={desk.x} y={desk.y} width={65} height={35} rx="8" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.5" />
                      <text x={desk.x + 32.5} y={desk.y + 21} textAnchor="middle" fontSize="10" fontWeight="700" fill="#166534">{desk.label}</text>
                    </g>
                  ))}
                  {builderDesks.length === 0 && (
                    <text x="300" y="200" textAnchor="middle" fontSize="14" fill="#94a3b8" fontWeight="500">
                      Click &quot;Add desk&quot; to place desks
                    </text>
                  )}
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 4: AMENITIES ===== */}
        {step === 4 && (
          <div className="animate-fade-in-up">
            <h2 className="text-xl font-bold text-text-primary mb-2">Add amenities</h2>
            <p className="text-sm text-text-secondary mb-6">Mark outlets, coffee, restrooms, and other amenities on the map.</p>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-64 shrink-0">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  {amenityOptions.map((a) => (
                    <button
                      key={a.type}
                      onClick={() => addAmenity(a.type)}
                      className="flex items-center gap-2 p-3 rounded-xl bg-white border border-border-light hover:border-brand-300 hover:bg-brand-50 transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center text-text-secondary">
                        {a.icon}
                      </div>
                      <span className="text-xs font-semibold text-text-primary">{a.label}</span>
                      <Plus className="w-3.5 h-3.5 text-text-muted ml-auto" />
                    </button>
                  ))}
                </div>

                {builderAmenities.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-text-muted">{builderAmenities.length} amenities placed</p>
                    {builderAmenities.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-surface-muted">
                        <span className="text-xs font-medium text-text-primary capitalize">{a.type}</span>
                        <button onClick={() => removeAmenity(a.id)} className="text-text-muted hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Canvas */}
              <div className="flex-1 bg-white rounded-[var(--radius-card)] border border-border-light overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
                <svg width="100%" height="400" viewBox="0 0 600 400">
                  <rect width="600" height="400" fill="white" />
                  {Array.from({ length: 15 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="400" stroke="#f1f5f9" strokeWidth="0.5" />
                  ))}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 40} x2="600" y2={i * 40} stroke="#f1f5f9" strokeWidth="0.5" />
                  ))}
                  {builderZones.map((zone) => {
                    const zc = zoneColors[zone.type];
                    return (
                      <g key={zone.id}>
                        <rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} rx="12" fill={zc.bg} stroke={zc.border} strokeWidth="1" strokeDasharray="6 3" opacity={0.4} />
                      </g>
                    );
                  })}
                  {builderDesks.map((desk) => (
                    <g key={desk.id}>
                      <rect x={desk.x} y={desk.y} width={65} height={35} rx="8" fill="#f0fdf4" stroke="#86efac" strokeWidth="1" opacity={0.5} />
                      <text x={desk.x + 32.5} y={desk.y + 21} textAnchor="middle" fontSize="9" fill="#94a3b8">{desk.label}</text>
                    </g>
                  ))}
                  {builderAmenities.map((am) => (
                    <g key={am.id}>
                      <circle cx={am.x} cy={am.y} r="16" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
                      <text x={am.x} y={am.y + 4} textAnchor="middle" fontSize="12" fill="#64748b">
                        {am.type === "coffee" ? "\u2615" : am.type === "printer" ? "\U0001F5A8" : am.type === "window" ? "\u2600" : am.type === "outlet" ? "\u26A1" : "\U0001F6AA"}
                      </text>
                    </g>
                  ))}
                  {builderAmenities.length === 0 && builderDesks.length === 0 && (
                    <text x="300" y="200" textAnchor="middle" fontSize="14" fill="#94a3b8" fontWeight="500">
                      Click amenities to place them on the map
                    </text>
                  )}
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 5: PREVIEW ===== */}
        {step === 5 && (
          <div className="animate-fade-in-up">
            <h2 className="text-xl font-bold text-text-primary mb-2">Preview your space</h2>
            <p className="text-sm text-text-secondary mb-6">This is how guests will see your desk map.</p>

            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setPreviewMode(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  !previewMode ? "bg-brand-600 text-white" : "bg-surface-muted text-text-secondary"
                }`}
              >
                <MapIcon className="w-4 h-4" />
                Map View
              </button>
              <button
                onClick={() => setPreviewMode(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  previewMode ? "bg-brand-600 text-white" : "bg-surface-muted text-text-secondary"
                }`}
              >
                <Eye className="w-4 h-4" />
                Guest Preview
              </button>
            </div>

            <div className="bg-white rounded-[var(--radius-card)] border border-border-light overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
              <svg width="100%" height="500" viewBox="0 0 700 500">
                <rect width="700" height="500" fill="white" rx="12" />
                {Array.from({ length: 18 }).map((_, i) => (
                  <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="500" stroke="#f1f5f9" strokeWidth="0.5" />
                ))}
                {Array.from({ length: 13 }).map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={i * 40} x2="700" y2={i * 40} stroke="#f1f5f9" strokeWidth="0.5" />
                ))}
                {builderZones.map((zone) => {
                  const zc = zoneColors[zone.type];
                  return (
                    <g key={zone.id}>
                      <rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} rx="12" fill={zc.bg} stroke={zc.border} strokeWidth="1.5" strokeDasharray="6 3" />
                      <text x={zone.x + 12} y={zone.y + 24} fontSize="11" fontWeight="600" fill={zc.border}>{zone.name}</text>
                    </g>
                  );
                })}
                {builderDesks.map((desk) => (
                  <g key={desk.id}>
                    <rect x={desk.x} y={desk.y} width={65} height={35} rx="8" fill={previewMode ? "#f0fdf4" : "#dbeafe"} stroke={previewMode ? "#86efac" : "#93c5fd"} strokeWidth="1.5" />
                    <text x={desk.x + 32.5} y={desk.y + 21} textAnchor="middle" fontSize="10" fontWeight="700" fill={previewMode ? "#166534" : "#1e40af"}>{desk.label}</text>
                  </g>
                ))}
                {builderAmenities.map((am) => (
                  <g key={am.id}>
                    <circle cx={am.x} cy={am.y} r="16" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
                    <text x={am.x} y={am.y + 4} textAnchor="middle" fontSize="12" fill="#64748b">
                      {am.type === "coffee" ? "\u2615" : am.type === "printer" ? "\U0001F5A8" : am.type === "window" ? "\u2600" : am.type === "outlet" ? "\u26A1" : "\U0001F6AA"}
                    </text>
                  </g>
                ))}
                {builderDesks.length === 0 && builderZones.length === 0 && (
                  <text x="350" y="250" textAnchor="middle" fontSize="16" fill="#94a3b8" fontWeight="500">
                    Go back to add zones, desks, and amenities
                  </text>
                )}
              </svg>
            </div>

            {/* Summary */}
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

        {/* ===== NAVIGATION ===== */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-border-light">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-button)] text-sm font-semibold transition-all btn-press ${
              step === 1
                ? "opacity-40 cursor-not-allowed text-text-muted"
                : "bg-white border border-border-light text-text-primary hover:bg-surface-muted"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {step < 5 ? (
            <button
              onClick={nextStep}
              disabled={step === 1 && !selectedTemplate}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-[var(--radius-button)] text-sm font-bold transition-all btn-press ${
                step === 1 && !selectedTemplate
                  ? "opacity-40 cursor-not-allowed bg-brand-300 text-white"
                  : "bg-brand-600 text-white hover:bg-brand-700"
              }`}
              style={{ boxShadow: "var(--shadow-button)" }}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              className="flex items-center gap-2 px-8 py-3 bg-brand-600 text-white font-bold rounded-[var(--radius-button)] btn-press hover:bg-brand-700 transition-colors text-base"
              style={{ boxShadow: "var(--shadow-button)" }}
            >
              <Check className="w-5 h-5" />
              Publish listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
