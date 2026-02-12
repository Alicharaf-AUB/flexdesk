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
import type { Listing } from "@/lib/types";

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
  width: number;
  height: number;
  rotation?: number;
  zone?: "quiet" | "collab" | "calls";
  perks?: string[];
  kind?: "desk" | "table";
}

interface BuilderZone {
  id: string;
  type: "quiet" | "collab" | "calls";
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

interface BuilderAmenity {
  id: string;
  type: string;
  x: number;
  y: number;
  name?: string;
  rotation?: number;
}

interface BuilderFloor {
  id: string;
  name: string;
  desks: BuilderDesk[];
  zones: BuilderZone[];
  amenities: BuilderAmenity[];
}

interface AvailabilityWindow {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isAllDay?: boolean;
}

interface BlackoutDate {
  date: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

const CANVAS_W = 600;
const CANVAS_H = 400;
const DESK_W = 65;
const DESK_H = 35;

export default function HostPage() {
  const [user, setUser] = useState<{ id: string; email: string; role?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [floors, setFloors] = useState<BuilderFloor[]>([
    { id: `floor-${Date.now()}`, name: "Floor 1", desks: [], zones: [], amenities: [] },
  ]);
  const [activeFloorId, setActiveFloorId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [deskCounter, setDeskCounter] = useState(1);
  const [published, setPublished] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [listingOptions, setListingOptions] = useState<Listing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [paidEnabled, setPaidEnabled] = useState(false);
  const [allowedEmailsInput, setAllowedEmailsInput] = useState("");
  const [listingMode, setListingMode] = useState<"CLOSED" | "OPEN" | "MICRO_HOST">("OPEN");
  const [isPublic, setIsPublic] = useState(true);
  const [reviewsEnabled, setReviewsEnabled] = useState(true);
  const [requiresId, setRequiresId] = useState(false);
  const [securityDepositCents, setSecurityDepositCents] = useState(0);
  const [cancellationPolicy, setCancellationPolicy] = useState("flexible");
  const [houseRulesInput, setHouseRulesInput] = useState("");
  const [availabilityWindows, setAvailabilityWindows] = useState<AvailabilityWindow[]>([]);
  const [blackoutDates, setBlackoutDates] = useState<BlackoutDate[]>([]);
  const [deskPlacementError, setDeskPlacementError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoUrlInput, setPhotoUrlInput] = useState("");

  // Drag state
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<{
    kind: "desk" | "zone" | "amenity";
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [resizing, setResizing] = useState<{
    kind: "desk" | "zone";
    id: string;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const activeFloor = floors.find((f) => f.id === activeFloorId) || floors[0];

  useEffect(() => {
    if (!activeFloorId && floors[0]) setActiveFloorId(floors[0].id);
  }, [activeFloorId, floors]);

  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      try {
        setAuthLoading(true);
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (isMounted) setUser(data.user || null);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    }
    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadListings() {
      try {
        const res = await fetch("/api/provider/listings");
        if (!res.ok) throw new Error("Failed to load listings");
        const data = await res.json();
        if (isMounted) {
          const list = data.listings || [];
          setListingOptions(list);
          setSelectedListingId(list[0]?.id || null);
          const first = list[0];
          if (first) {
            setRequiresApproval(Boolean(first.requiresApproval));
            setPaidEnabled(first.paidEnabled !== false);
            setAllowedEmailsInput((first.allowedEmails || []).join(", "));
            setListingMode(first.mode || "OPEN");
            setIsPublic(first.isPublic !== false);
            setReviewsEnabled(first.reviewsEnabled !== false);
            setRequiresId(Boolean(first.requiresId));
            setSecurityDepositCents(Number(first.securityDepositCents || 0));
            setCancellationPolicy(first.cancellationPolicy || "flexible");
            setHouseRulesInput((first.houseRules || []).join("\n"));
            setPhotoUrls(first.photos || []);
          }
        }
      } catch {
        if (isMounted) {
          setListingOptions([]);
          setSelectedListingId(null);
        }
      }
    }
    loadListings();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadAvailability() {
      if (!selectedListingId) return;
      try {
        const [windowsRes, blackoutsRes] = await Promise.all([
          fetch(`/api/availability/windows?listingId=${selectedListingId}`),
          fetch(`/api/availability/blackouts?listingId=${selectedListingId}`),
        ]);
        const windowsData = windowsRes.ok ? await windowsRes.json() : { windows: [] };
        const blackoutsData = blackoutsRes.ok ? await blackoutsRes.json() : { blackouts: [] };
        if (isMounted) {
          setAvailabilityWindows(windowsData.windows || []);
          setBlackoutDates(blackoutsData.blackouts || []);
        }
      } catch {
        if (isMounted) {
          setAvailabilityWindows([]);
          setBlackoutDates([]);
        }
      }
    }
    loadAvailability();
    return () => {
      isMounted = false;
    };
  }, [selectedListingId]);

  const updateActiveFloor = (updater: (floor: BuilderFloor) => BuilderFloor) => {
    if (!activeFloor) return;
    setFloors((prev) => prev.map((f) => (f.id === activeFloor.id ? updater(f) : f)));
  };

  const activeZones = activeFloor?.zones ?? [];
  const activeDesks = activeFloor?.desks ?? [];
  const activeAmenities = activeFloor?.amenities ?? [];
  const totalZones = floors.reduce((sum, f) => sum + f.zones.length, 0);
  const totalDesks = floors.reduce((sum, f) => sum + f.desks.length, 0);
  const totalAmenities = floors.reduce((sum, f) => sum + f.amenities.length, 0);

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
        const desk = activeFloor?.desks.find((d) => d.id === id);
        if (desk) { offsetX = pt.x - desk.x; offsetY = pt.y - desk.y; }
      } else if (kind === "zone") {
        const zone = activeFloor?.zones.find((z) => z.id === id);
        if (zone) { offsetX = pt.x - zone.x; offsetY = pt.y - zone.y; }
      } else {
        const am = activeFloor?.amenities.find((a) => a.id === id);
        if (am) { offsetX = pt.x - am.x; offsetY = pt.y - am.y; }
      }

      setDragging({ kind, id, offsetX, offsetY });
      setActiveItem(id);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [activeFloor, getSVGPoint]
  );

  const handleResizeStart = useCallback(
    (kind: "desk" | "zone", id: string, e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const pt = getSVGPoint(e.clientX, e.clientY);
      const item = kind === "desk"
        ? activeFloor?.desks.find((d) => d.id === id)
        : activeFloor?.zones.find((z) => z.id === id);
      if (!item) return;
      setResizing({
        kind,
        id,
        startX: pt.x,
        startY: pt.y,
        startW: item.width,
        startH: item.height,
      });
      setActiveItem(id);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [activeFloor, getSVGPoint]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const pt = getSVGPoint(e.clientX, e.clientY);

      if (resizing) {
        const dx = pt.x - resizing.startX;
        const dy = pt.y - resizing.startY;
        let newW = Math.max(30, Math.min(resizing.startW + dx, CANVAS_W));
        let newH = Math.max(24, Math.min(resizing.startH + dy, CANVAS_H));
        updateActiveFloor((floor) => ({
          ...floor,
          desks: floor.desks.map((d) => {
            if (!(resizing.kind === "desk" && d.id === resizing.id)) return d;
            const zone = getZoneForPoint(d.x + d.width / 2, d.y + d.height / 2) || getNearestZone(d.x, d.y);
            if (zone) {
              newW = Math.min(newW, zone.x + zone.width - d.x);
              newH = Math.min(newH, zone.y + zone.height - d.y);
            }
            return { ...d, width: newW, height: newH };
          }),
          zones: floor.zones.map((z) =>
            resizing.kind === "zone" && z.id === resizing.id
              ? { ...z, width: newW, height: newH }
              : z
          ),
        }));
        return;
      }

      if (!dragging) return;
      const nx = pt.x - dragging.offsetX;
      const ny = pt.y - dragging.offsetY;

      if (dragging.kind === "desk") {
        updateActiveFloor((floor) => ({
          ...floor,
          desks: floor.desks.map((d) => {
            if (d.id !== dragging.id) return d;
            const clamped = clampDeskToZone(d, nx, ny);
            return { ...d, x: clamped.x, y: clamped.y, zone: clamped.zone || d.zone };
          }),
        }));
      } else if (dragging.kind === "zone") {
        updateActiveFloor((floor) => ({
          ...floor,
          zones: floor.zones.map((z) =>
            z.id === dragging.id
              ? { ...z, x: Math.max(0, Math.min(nx, CANVAS_W - z.width)), y: Math.max(0, Math.min(ny, CANVAS_H - z.height)) }
              : z
          ),
        }));
      } else {
        updateActiveFloor((floor) => ({
          ...floor,
          amenities: floor.amenities.map((a) =>
            a.id === dragging.id
              ? { ...a, x: Math.max(16, Math.min(nx, CANVAS_W - 16)), y: Math.max(16, Math.min(ny, CANVAS_H - 16)) }
              : a
          ),
        }));
      }
    },
    [dragging, resizing, getSVGPoint, updateActiveFloor]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
    setResizing(null);
  }, []);

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const addZone = (type: "quiet" | "collab" | "calls") => {
    const label = zoneOptions.find((z) => z.type === type)?.label || "Zone";
    setDeskPlacementError(null);
    updateActiveFloor((floor) => ({
      ...floor,
      zones: [
        ...floor.zones,
        {
          id: `bz-${Date.now()}`,
          type,
          name: label,
          x: 40 + Math.random() * 200,
          y: 40 + Math.random() * 100,
          width: 200,
          height: 160,
          rotation: 0,
        },
      ],
    }));
  };

  const removeZone = (id: string) => updateActiveFloor((floor) => ({
    ...floor,
    zones: floor.zones.filter((z) => z.id !== id),
  }));

  const updateZoneName = (id: string, name: string) => updateActiveFloor((floor) => ({
    ...floor,
    zones: floor.zones.map((z) => (z.id === id ? { ...z, name } : z)),
  }));

  const updateZoneRotation = (id: string, rotation: number) => updateActiveFloor((floor) => ({
    ...floor,
    zones: floor.zones.map((z) => (z.id === id ? { ...z, rotation } : z)),
  }));

  const updateDeskLabel = (id: string, label: string) => updateActiveFloor((floor) => ({
    ...floor,
    desks: floor.desks.map((d) => (d.id === id ? { ...d, label } : d)),
  }));

  const updateDeskRotation = (id: string, rotation: number) => updateActiveFloor((floor) => ({
    ...floor,
    desks: floor.desks.map((d) => (d.id === id ? { ...d, rotation } : d)),
  }));

  const getZoneForPoint = (x: number, y: number) =>
    activeZones.find((z) => x >= z.x && x <= z.x + z.width && y >= z.y && y <= z.y + z.height);

  const getNearestZone = (x: number, y: number) => {
    if (activeZones.length === 0) return null;
    return activeZones.reduce((best, z) => {
      const cx = z.x + z.width / 2;
      const cy = z.y + z.height / 2;
      const dist = Math.hypot(cx - x, cy - y);
      const bestDist = Math.hypot((best.x + best.width / 2) - x, (best.y + best.height / 2) - y);
      return dist < bestDist ? z : best;
    });
  };

  const clampDeskToZone = (desk: BuilderDesk, x: number, y: number) => {
    const centerX = x + desk.width / 2;
    const centerY = y + desk.height / 2;
    const zone = getZoneForPoint(centerX, centerY) || getNearestZone(centerX, centerY);
    if (!zone) return { x, y, zone: desk.zone };
    const clampedX = Math.max(zone.x, Math.min(x, zone.x + zone.width - desk.width));
    const clampedY = Math.max(zone.y, Math.min(y, zone.y + zone.height - desk.height));
    return { x: clampedX, y: clampedY, zone: zone.type as BuilderDesk["zone"] };
  };

  const addDesk = (kind: "desk" | "table" = "desk") => {
    if (activeZones.length === 0) {
      setDeskPlacementError("Add a zone first. Desks must be placed inside a zone.");
      return;
    }
    setDeskPlacementError(null);
    const label = kind === "table" ? `Table ${deskCounter}` : `Desk ${deskCounter}`;
    setDeskCounter((c) => c + 1);
    const zone = activeZones[0];
    const baseW = kind === "table" ? DESK_W * 1.4 : DESK_W;
    const baseH = kind === "table" ? DESK_H * 1.2 : DESK_H;
    const startX = zone.x + Math.min(20, Math.max(0, zone.width - baseW - 20));
    const startY = zone.y + Math.min(20, Math.max(0, zone.height - baseH - 20));
    updateActiveFloor((floor) => ({
      ...floor,
      desks: [
        ...floor.desks,
        { id: `bd-${Date.now()}`, label, x: startX, y: startY, width: baseW, height: baseH, rotation: 0, zone: zone.type, perks: [], kind },
      ],
    }));
  };

  const duplicateDesk = (desk: BuilderDesk) => {
    const label = desk.kind === "table" ? `Table ${deskCounter}` : `Desk ${deskCounter}`;
    setDeskCounter((c) => c + 1);
    const clamped = clampDeskToZone(desk, desk.x + 80, desk.y);
    updateActiveFloor((floor) => ({
      ...floor,
      desks: [
        ...floor.desks,
        { id: `bd-${Date.now()}`, label, x: clamped.x, y: clamped.y, width: desk.width, height: desk.height, rotation: desk.rotation ?? 0, zone: clamped.zone || desk.zone, perks: desk.perks ?? [], kind: desk.kind || "desk" },
      ],
    }));
  };

  const removeDesk = (id: string) => updateActiveFloor((floor) => ({
    ...floor,
    desks: floor.desks.filter((d) => d.id !== id),
  }));

  const addAmenity = (type: string) => {
    const label = amenityOptions.find((a) => a.type === type)?.label || "Amenity";
    updateActiveFloor((floor) => ({
      ...floor,
      amenities: [
        ...floor.amenities,
        { id: `ba-${Date.now()}`, type, name: label, x: 200 + Math.random() * 200, y: 200 + Math.random() * 100, rotation: 0 },
      ],
    }));
  };

  const removeAmenity = (id: string) => updateActiveFloor((floor) => ({
    ...floor,
    amenities: floor.amenities.filter((a) => a.id !== id),
  }));

  const updateAmenityName = (id: string, name: string) => updateActiveFloor((floor) => ({
    ...floor,
    amenities: floor.amenities.map((a) => (a.id === id ? { ...a, name } : a)),
  }));

  const updateAmenityRotation = (id: string, rotation: number) => updateActiveFloor((floor) => ({
    ...floor,
    amenities: floor.amenities.map((a) => (a.id === id ? { ...a, rotation } : a)),
  }));

  const addFloor = () => {
    const nextIndex = floors.length + 1;
    const newFloor: BuilderFloor = {
      id: `floor-${Date.now()}`,
      name: `Floor ${nextIndex}`,
      desks: [],
      zones: [],
      amenities: [],
    };
    setFloors((prev) => [...prev, newFloor]);
    setActiveFloorId(newFloor.id);
  };

  const removeFloor = (id: string) => {
    if (floors.length <= 1) return;
    setFloors((prev) => {
      const next = prev.filter((f) => f.id !== id);
      if (activeFloorId === id) setActiveFloorId(next[0]?.id || null);
      return next;
    });
  };

  const addAvailabilityWindow = () => {
    setAvailabilityWindows((prev) => [
      ...prev,
      { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", timezone: "Asia/Beirut", isAllDay: false },
    ]);
  };

  const updateAvailabilityWindow = (index: number, patch: Partial<AvailabilityWindow>) => {
    setAvailabilityWindows((prev) => prev.map((w, i) => (i === index ? { ...w, ...patch } : w)));
  };

  const removeAvailabilityWindow = (index: number) => {
    setAvailabilityWindows((prev) => prev.filter((_, i) => i !== index));
  };

  const addBlackoutDate = () => {
    const today = new Date().toISOString().slice(0, 10);
    setBlackoutDates((prev) => [
      ...prev,
      { date: today, startTime: "", endTime: "", reason: "" },
    ]);
  };

  const updateBlackoutDate = (index: number, patch: Partial<BlackoutDate>) => {
    setBlackoutDates((prev) => prev.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  };

  const removeBlackoutDate = (index: number) => {
    setBlackoutDates((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePhotoFiles = (files: FileList | null) => {
    if (!files) return;
    const readers = Array.from(files).slice(0, 5 - photoUrls.length).map((file) =>
      new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.readAsDataURL(file);
      })
    );
    Promise.all(readers).then((results) => {
      const valid = results.filter(Boolean);
      setPhotoUrls((prev) => [...prev, ...valid]);
    });
  };

  const addPhotoUrl = () => {
    const url = photoUrlInput.trim();
    if (!url) return;
    setPhotoUrls((prev) => [...prev, url].slice(0, 5));
    setPhotoUrlInput("");
  };

  const removePhotoUrl = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!selectedListingId) {
      setPublishError("Select a listing to attach this workspace.");
      return;
    }
    setIsPublishing(true);
    setPublishError(null);
    try {
      const allowedEmails = allowedEmailsInput
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      const houseRules = houseRulesInput
        .split("\n")
        .map((rule) => rule.trim())
        .filter(Boolean);
      const resolvedPublic = listingMode === "CLOSED" ? false : isPublic;
      const payload = {
        listingId: selectedListingId,
        name: "Workspace",
        requiresApproval,
        paidEnabled,
        allowedEmails,
        photos: photoUrls,
        mode: listingMode,
        isPublic: resolvedPublic,
        reviewsEnabled,
        requiresId,
        securityDepositCents: Number(securityDepositCents) || 0,
        cancellationPolicy,
        houseRules,
        floors: floors.map((f, index) => ({
          name: f.name,
          sortOrder: index + 1,
          desks: f.desks.map((d) => ({
            label: d.label,
            zone: d.zone || "quiet",
            perks: d.perks || [],
            x: d.x,
            y: d.y,
            width: d.width,
            height: d.height,
            rotation: d.rotation ?? 0,
            kind: d.kind || "desk",
            available: true,
          })),
          zones: f.zones.map((z) => ({
            type: z.type,
            name: z.name,
            x: z.x,
            y: z.y,
            width: z.width,
            height: z.height,
            rotation: z.rotation ?? 0,
          })),
          amenities: f.amenities.map((a) => ({
            type: a.type,
            icon: a.type,
            x: a.x,
            y: a.y,
            rotation: a.rotation ?? 0,
            name: a.name || undefined,
          })),
        })),
      };

      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to publish workspace");

      await Promise.all([
        fetch("/api/availability/windows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId: selectedListingId, windows: availabilityWindows }),
        }),
        fetch("/api/availability/blackouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId: selectedListingId, blackouts: blackoutDates }),
        }),
      ]);
      setPublished(true);
    } catch (err) {
      setPublishError((err as Error).message);
    } finally {
      setIsPublishing(false);
    }
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
      {activeZones.map((zone) => {
        const zc = zoneColors[zone.type];
        const isActive = activeItem === zone.id;
        const canDrag = opts.interactive === "zone" || opts.interactive === "all";
        const dimmed = opts.dimNonActive && opts.interactive !== "zone" && opts.interactive !== "all";
        const rotation = zone.rotation ?? 0;
        const zoneCx = zone.x + zone.width / 2;
        const zoneCy = zone.y + zone.height / 2;
        return (
          <g
            key={zone.id}
            opacity={dimmed ? 0.3 : 1}
            transform={`rotate(${rotation} ${zoneCx} ${zoneCy})`}
            onPointerDown={canDrag ? (e) => handlePointerDown("zone", zone.id, e) : undefined}
            className={canDrag ? "cursor-grab" : ""}
          >
            <rect
              x={zone.x} y={zone.y} width={zone.width} height={zone.height} rx="12"
              fill={zc.bg} stroke={zc.border}
              strokeWidth={isActive && canDrag ? "2.5" : "1.5"}
              strokeDasharray={isActive && canDrag ? "none" : "6 3"}
            />
            {canDrag && (
              <circle
                cx={zone.x + zone.width}
                cy={zone.y + zone.height}
                r="6"
                fill="#ffffff"
                stroke={zc.border}
                strokeWidth="2"
                onPointerDown={(e) => handleResizeStart("zone", zone.id, e)}
              />
            )}
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
      {activeDesks.map((desk) => {
        const isActive = activeItem === desk.id;
        const canDrag = opts.interactive === "desk" || opts.interactive === "all";
        const dimmed = opts.dimNonActive && opts.interactive !== "desk" && opts.interactive !== "all";
        const zoneColor = desk.zone ? zoneColors[desk.zone] : null;
        const deskFill = isActive && canDrag ? "#dbeafe" : zoneColor ? zoneColor.bg : "#f0fdf4";
        const deskStroke = isActive && canDrag ? "#3b82f6" : zoneColor ? zoneColor.border : "#86efac";
        const deskW = desk.width ?? DESK_W;
        const deskH = desk.height ?? DESK_H;
        const rotation = desk.rotation ?? 0;
        const deskCx = desk.x + deskW / 2;
        const deskCy = desk.y + deskH / 2;
        return (
          <g
            key={desk.id}
            opacity={dimmed ? 0.3 : 1}
            transform={`rotate(${rotation} ${deskCx} ${deskCy})`}
            onPointerDown={canDrag ? (e) => handlePointerDown("desk", desk.id, e) : undefined}
            className={canDrag ? "cursor-grab" : ""}
          >
            <rect
              x={desk.x} y={desk.y} width={deskW} height={deskH} rx="8"
              fill={deskFill}
              stroke={deskStroke}
              strokeWidth={isActive && canDrag ? "2.5" : "1.5"}
            />
            {canDrag && (
              <circle
                cx={desk.x + deskW}
                cy={desk.y + deskH}
                r="5"
                fill="#ffffff"
                stroke="#3b82f6"
                strokeWidth="2"
                onPointerDown={(e) => handleResizeStart("desk", desk.id, e)}
              />
            )}
            <text
              x={desk.x + deskW / 2} y={desk.y + deskH / 2 + 4}
              textAnchor="middle" fontSize="10" fontWeight="700"
              fill={isActive && canDrag ? "#1e40af" : "#166534"}
              style={{ pointerEvents: "none" }}
            >
              {desk.label}
            </text>
            {canDrag && (
              <g opacity={0.4} style={{ pointerEvents: "none" }}>
                <circle cx={desk.x + deskW - 8} cy={desk.y + 8} r="5" fill="#3b82f6" opacity={0.2} />
                <text x={desk.x + deskW - 8} y={desk.y + 11} textAnchor="middle" fontSize="7" fill="#3b82f6">✥</text>
              </g>
            )}
          </g>
        );
      })}

      {/* Amenities */}
      {activeAmenities.map((am) => {
        const isActive = activeItem === am.id;
        const canDrag = opts.interactive === "amenity" || opts.interactive === "all";
        const dimmed = opts.dimNonActive && opts.interactive !== "amenity" && opts.interactive !== "all";
        const emoji = amenityOptions.find((a) => a.type === am.type)?.emoji || "\u25A1";
        const rotation = am.rotation ?? 0;
        return (
          <g
            key={am.id}
            opacity={dimmed ? 0.3 : 1}
            transform={`rotate(${rotation} ${am.x} ${am.y})`}
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
            {am.name && (
              <text x={am.x} y={am.y + 24} textAnchor="middle" fontSize="9" fill="#64748b" style={{ pointerEvents: "none" }}>
                {am.name}
              </text>
            )}
          </g>
        );
      })}

      {/* Empty state */}
      {activeDesks.length === 0 && activeZones.length === 0 && activeAmenities.length === 0 && (
        <text x={CANVAS_W / 2} y={CANVAS_H / 2} textAnchor="middle" fontSize="14" fill="#94a3b8" fontWeight="500">
          {step === 2 ? "Click a zone type to add, then drag to position" : step === 3 ? "Add desks and drag them into place" : step === 4 ? "Add amenities and drag to position" : "Go back to add zones, desks, and amenities"}
        </text>
      )}
    </svg>
  );

  const renderFloorTabs = () => (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex flex-wrap items-center gap-2">
        {floors.map((floor) => (
          <button
            key={floor.id}
            onClick={() => setActiveFloorId(floor.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeFloorId === floor.id
                ? "bg-brand-600 text-white"
                : "bg-surface-muted text-text-secondary hover:bg-brand-50"
            }`}
          >
            {floor.name}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {activeFloor && floors.length > 1 && (
          <button
            onClick={() => removeFloor(activeFloor.id)}
            className="px-3 py-1.5 text-xs font-semibold text-text-secondary bg-surface-muted rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            Remove floor
          </button>
        )}
        <button
          onClick={addFloor}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
        >
          Add floor
        </button>
      </div>
    </div>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-blueprint flex items-center justify-center">
        <div className="text-sm text-text-muted">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-blueprint flex items-center justify-center px-4">
        <div className="bg-white rounded-card border border-border-light p-6 text-center max-w-md" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="text-sm font-semibold text-text-primary mb-2">Log in to list your space</div>
          <p className="text-xs text-text-muted mb-4">Create an operator or micro‑host account to publish desks.</p>
          <Link href="/login" className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-button">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blueprint">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Desk Map Builder
          </h1>
          <p className="text-text-secondary mt-1">Create your floor plan in minutes — drag, drop, done.</p>
          <div className="mt-2">
            <Link href="/host/bookings" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Manage booking approvals →
            </Link>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-xs font-semibold text-text-muted">Attach to listing</label>
            <div className="flex items-center gap-2">
              <select
                value={selectedListingId || ""}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setSelectedListingId(nextId);
                  const selected = listingOptions.find((l) => l.id === nextId);
                  if (selected) {
                    setRequiresApproval(Boolean(selected.requiresApproval));
                    setPaidEnabled(selected.paidEnabled !== false);
                    setAllowedEmailsInput((selected.allowedEmails || []).join(", "));
                    setListingMode(selected.mode || "OPEN");
                    setIsPublic(selected.isPublic !== false);
                    setReviewsEnabled(selected.reviewsEnabled !== false);
                    setRequiresId(Boolean(selected.requiresId));
                    setSecurityDepositCents(Number(selected.securityDepositCents || 0));
                    setCancellationPolicy(selected.cancellationPolicy || "flexible");
                    setHouseRulesInput((selected.houseRules || []).join("\n"));
                    setPhotoUrls(selected.photos || []);
                  }
                }}
                className="px-3 py-2 rounded-lg border border-border-light bg-white text-sm text-text-primary"
              >
                <option value="" disabled>Select listing</option>
                {listingOptions.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              {!selectedListingId && (
                <span className="text-xs text-text-muted">Required to publish</span>
              )}
            </div>
          </div>

          <div className="mt-6 bg-white rounded-card border border-border-light p-4" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-text-primary">Space photos (optional)</p>
                <p className="text-xs text-text-muted">Add up to 5 photos so renters know what to expect.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-border-light rounded-lg p-4 text-xs text-text-muted cursor-pointer hover:bg-surface-muted">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handlePhotoFiles(e.target.files)}
                />
                <span className="text-sm font-semibold text-text-primary">Upload photos</span>
                <span>JPG or PNG · max 5</span>
              </label>
              <div className="flex gap-2">
                <input
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  placeholder="Paste image URL"
                  className="flex-1 px-3 py-2 rounded-lg border border-border-light text-xs"
                />
                <button
                  type="button"
                  onClick={addPhotoUrl}
                  className="px-3 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
            {photoUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
                {photoUrls.map((src, index) => (
                  <div key={`${src}-${index}`} className="relative rounded-lg overflow-hidden border border-border-light">
                    <img src={src} alt="Space photo" className="h-20 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhotoUrl(index)}
                      className="absolute top-1 right-1 bg-white/90 text-xs px-1.5 py-0.5 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
              />
              Require host approval
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
              <input
                type="checkbox"
                checked={paidEnabled}
                onChange={(e) => setPaidEnabled(e.target.checked)}
              />
              Paid bookings enabled
            </label>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-xs font-semibold text-text-muted">Allowed emails (comma separated)</label>
              <input
                type="text"
                value={allowedEmailsInput}
                onChange={(e) => setAllowedEmailsInput(e.target.value)}
                placeholder="name@company.com, team@company.com"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-border-light bg-white text-sm text-text-primary"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-muted text-xs font-semibold text-text-secondary hover:bg-brand-50 hover:text-brand-600 transition-colors"
            >
              {showAdvanced ? "Hide advanced settings" : "Show advanced settings"}
            </button>
          </div>

          {showAdvanced && (
            <>
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <p className="text-xs font-semibold text-text-muted mb-2">Business mode</p>
                  <div className="grid sm:grid-cols-3 gap-2">
                    {[
                      { id: "CLOSED", label: "Closed environment" },
                      { id: "OPEN", label: "Open marketplace" },
                      { id: "MICRO_HOST", label: "Office desk host" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setListingMode(mode.id as "CLOSED" | "OPEN" | "MICRO_HOST")}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                          listingMode === mode.id
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-border-light text-text-secondary hover:bg-surface-muted"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                      <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                      Public listing
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                      <input type="checkbox" checked={reviewsEnabled} onChange={(e) => setReviewsEnabled(e.target.checked)} />
                      Reviews enabled
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-card border border-border-light p-4" style={{ boxShadow: "var(--shadow-card)" }}>
                  <p className="text-xs font-semibold text-text-muted mb-2">Trust & safety</p>
                  <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary mb-2">
                    <input type="checkbox" checked={requiresId} onChange={(e) => setRequiresId(e.target.checked)} />
                    Require ID verification
                  </label>
                  <label className="text-xs font-semibold text-text-muted">Security deposit (USD)</label>
                  <input
                    type="number"
                    value={Math.round(securityDepositCents / 100)}
                    onChange={(e) => setSecurityDepositCents(Number(e.target.value) * 100)}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border-light bg-white text-sm text-text-primary"
                  />
                  <label className="text-xs font-semibold text-text-muted mt-3 block">Cancellation policy</label>
                  <select
                    value={cancellationPolicy}
                    onChange={(e) => setCancellationPolicy(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border-light bg-white text-sm text-text-primary"
                  >
                    <option value="flexible">Flexible</option>
                    <option value="moderate">Moderate</option>
                    <option value="strict">Strict</option>
                  </select>
                  <label className="text-xs font-semibold text-text-muted mt-3 block">House rules (one per line)</label>
                  <textarea
                    value={houseRulesInput}
                    onChange={(e) => setHouseRulesInput(e.target.value)}
                    rows={3}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border-light bg-white text-sm text-text-primary"
                    placeholder="No smoking\nKeep noise low"
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="bg-white rounded-card border border-border-light p-4" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-text-muted">Availability windows</p>
                    <button type="button" onClick={addAvailabilityWindow} className="text-xs font-semibold text-brand-600">Add window</button>
                  </div>
                  <div className="space-y-3">
                    {availabilityWindows.map((w, index) => (
                      <div key={`win-${index}`} className="grid grid-cols-2 gap-2 items-end">
                        <select
                          value={w.dayOfWeek}
                          onChange={(e) => updateAvailabilityWindow(index, { dayOfWeek: Number(e.target.value) })}
                          className="px-3 py-2 rounded-lg border border-border-light text-xs"
                        >
                          {[
                            "Sunday",
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                          ].map((label, dayIndex) => (
                            <option key={label} value={dayIndex}>{label}</option>
                          ))}
                        </select>
                        <select
                          value={w.timezone}
                          onChange={(e) => updateAvailabilityWindow(index, { timezone: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-border-light text-xs"
                        >
                          <option value="Asia/Beirut">Asia/Beirut</option>
                          <option value="UTC">UTC</option>
                        </select>
                        <input
                          type="time"
                          value={w.startTime}
                          onChange={(e) => updateAvailabilityWindow(index, { startTime: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-border-light text-xs"
                          disabled={w.isAllDay}
                        />
                        <input
                          type="time"
                          value={w.endTime}
                          onChange={(e) => updateAvailabilityWindow(index, { endTime: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-border-light text-xs"
                          disabled={w.isAllDay}
                        />
                        <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                          <input
                            type="checkbox"
                            checked={Boolean(w.isAllDay)}
                            onChange={(e) => updateAvailabilityWindow(index, { isAllDay: e.target.checked })}
                          />
                          All day
                        </label>
                        <button type="button" onClick={() => removeAvailabilityWindow(index)} className="text-xs text-red-500">Remove</button>
                      </div>
                    ))}
                    {availabilityWindows.length === 0 && (
                      <p className="text-xs text-text-muted">No availability windows configured.</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-card border border-border-light p-4" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-text-muted">Blackout dates</p>
                    <button type="button" onClick={addBlackoutDate} className="text-xs font-semibold text-brand-600">Add blackout</button>
                  </div>
                  <div className="space-y-3">
                    {blackoutDates.map((b, index) => (
                      <div key={`blackout-${index}`} className="grid grid-cols-2 gap-2 items-end">
                        <input
                          type="date"
                          value={b.date}
                          onChange={(e) => updateBlackoutDate(index, { date: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-border-light text-xs"
                        />
                        <input
                          type="text"
                          value={b.reason || ""}
                          onChange={(e) => updateBlackoutDate(index, { reason: e.target.value })}
                          placeholder="Reason"
                          className="px-3 py-2 rounded-lg border border-border-light text-xs"
                        />
                        <input
                          type="time"
                          value={b.startTime || ""}
                          onChange={(e) => updateBlackoutDate(index, { startTime: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-border-light text-xs"
                        />
                        <input
                          type="time"
                          value={b.endTime || ""}
                          onChange={(e) => updateBlackoutDate(index, { endTime: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-border-light text-xs"
                        />
                        <button type="button" onClick={() => removeBlackoutDate(index)} className="text-xs text-red-500">Remove</button>
                      </div>
                    ))}
                    {blackoutDates.length === 0 && (
                      <p className="text-xs text-text-muted">No blackout dates configured.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
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
                  className={`p-6 rounded-card border-2 text-left transition-all card-lift ${
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

            {renderFloorTabs()}

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-64 shrink-0 space-y-3">
                {zoneOptions.map((z) => (
                  <button key={z.type} onClick={() => addZone(z.type)} className="w-full flex items-center gap-3 p-4 rounded-card bg-white border border-border-light hover:border-brand-300 transition-all text-left" style={{ boxShadow: "var(--shadow-card)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${z.color}15`, color: z.color }}>{z.icon}</div>
                    <div>
                      <span className="text-sm font-bold text-text-primary block">{z.label}</span>
                      <span className="text-xs text-text-muted">Click to add</span>
                    </div>
                    <Plus className="w-4 h-4 text-text-muted ml-auto" />
                  </button>
                ))}
                {activeZones.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border-light space-y-2">
                    <p className="text-xs font-semibold text-text-muted">Added zones</p>
                    {activeZones.map((z) => (
                      <div key={z.id} className={`p-2 rounded-lg ${activeItem === z.id ? "bg-brand-50 border border-brand-200" : "bg-surface-muted"}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <button onClick={() => setActiveItem(z.id)} className="text-xs font-medium text-text-primary">{z.name}</button>
                            <input
                              value={z.name}
                              onChange={(e) => updateZoneName(z.id, e.target.value)}
                              className="flex-1 bg-white/70 border border-border-light rounded-lg px-2 py-1 text-xs text-text-primary"
                              placeholder="Zone name"
                            />
                          </div>
                          <button onClick={() => removeZone(z.id)} className="text-text-muted hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        {activeItem === z.id && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] text-text-muted">Rotate</span>
                            <input
                              type="range"
                              min={0}
                              max={360}
                              step={5}
                              value={z.rotation ?? 0}
                              onChange={(e) => updateZoneRotation(z.id, Number(e.target.value))}
                              className="flex-1"
                            />
                            <span className="text-[10px] text-text-muted w-8 text-right">{Math.round(z.rotation ?? 0)}°</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 bg-white rounded-card border border-border-light overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
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
                <p className="text-sm text-text-secondary">Add desks and <span className="font-semibold text-brand-600">drag to arrange</span>. Resize freely.</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-xs font-semibold text-brand-700">
                <MousePointer2 className="w-3.5 h-3.5" /> Drag desks to position
              </div>
            </div>

            {renderFloorTabs()}

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-64 shrink-0 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => addDesk("desk")} className="w-full flex items-center gap-2 p-3 rounded-card bg-brand-600 text-white hover:bg-brand-700 transition-colors" style={{ boxShadow: "var(--shadow-button)" }}>
                    <Plus className="w-4 h-4" />
                    <span className="text-xs font-bold">Add desk</span>
                  </button>
                  <button onClick={() => addDesk("table")} className="w-full flex items-center gap-2 p-3 rounded-card bg-accent-500 text-white hover:bg-accent-600 transition-colors" style={{ boxShadow: "var(--shadow-button)" }}>
                    <Plus className="w-4 h-4" />
                    <span className="text-xs font-bold">Add table</span>
                  </button>
                </div>
                {deskPlacementError && (
                  <div className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {deskPlacementError}
                  </div>
                )}
                {activeDesks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-text-muted">{activeDesks.length} desks placed</p>
                    {activeDesks.map((desk) => (
                      <div key={desk.id} className={`p-2 rounded-lg border ${activeItem === desk.id ? "bg-brand-50 border-brand-200" : "bg-white border-border-light"}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <button onClick={() => setActiveItem(desk.id)} className="flex items-center gap-2">
                              <GripVertical className="w-3.5 h-3.5 text-text-muted" />
                            </button>
                            <input
                              value={desk.label}
                              onChange={(e) => updateDeskLabel(desk.id, e.target.value)}
                              className="flex-1 bg-white border border-border-light rounded-lg px-2 py-1 text-xs text-text-primary"
                              placeholder="Desk name"
                            />
                            <select
                              value={desk.kind || "desk"}
                              onChange={(e) => updateActiveFloor((floor) => ({
                                ...floor,
                                desks: floor.desks.map((d) => d.id === desk.id ? { ...d, kind: e.target.value as BuilderDesk["kind"] } : d),
                              }))}
                              className="ml-1 px-2 py-1 rounded-lg border border-border-light text-xs text-text-secondary"
                            >
                              <option value="desk">Desk</option>
                              <option value="table">Table</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => duplicateDesk(desk)} className="p-1 text-text-muted hover:text-brand-600 transition-colors" title="Duplicate"><Copy className="w-3.5 h-3.5" /></button>
                            <button onClick={() => removeDesk(desk.id)} className="p-1 text-text-muted hover:text-red-500 transition-colors" title="Remove"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        {activeItem === desk.id && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] text-text-muted">Rotate</span>
                            <input
                              type="range"
                              min={0}
                              max={360}
                              step={5}
                              value={desk.rotation ?? 0}
                              onChange={(e) => updateDeskRotation(desk.id, Number(e.target.value))}
                              className="flex-1"
                            />
                            <span className="text-[10px] text-text-muted w-8 text-right">{Math.round(desk.rotation ?? 0)}°</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 bg-white rounded-card border border-border-light overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
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

            {renderFloorTabs()}

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
                {activeAmenities.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-text-muted">{activeAmenities.length} amenities</p>
                    {activeAmenities.map((a) => (
                      <div key={a.id} className={`p-2 rounded-lg ${activeItem === a.id ? "bg-brand-50 border border-brand-200" : "bg-surface-muted"}`}>
                        <div className="flex items-center justify-between">
                          <button onClick={() => setActiveItem(a.id)} className="text-xs font-medium text-text-primary capitalize">{a.type}</button>
                          <button onClick={() => removeAmenity(a.id)} className="text-text-muted hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        {activeItem === a.id && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] text-text-muted">Rotate</span>
                            <input
                              type="range"
                              min={0}
                              max={360}
                              step={5}
                              value={a.rotation ?? 0}
                              onChange={(e) => updateAmenityRotation(a.id, Number(e.target.value))}
                              className="flex-1"
                            />
                            <span className="text-[10px] text-text-muted w-8 text-right">{Math.round(a.rotation ?? 0)}°</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 bg-white rounded-card border border-border-light overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
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

            {renderFloorTabs()}

            <div className="bg-white rounded-card border border-border-light overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
              {renderCanvas({ interactive: previewMode ? undefined : "all", preview: previewMode })}
            </div>

            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-card p-5 border border-border-light" style={{ boxShadow: "var(--shadow-card)" }}>
                <p className="text-2xl font-bold text-text-primary">{totalZones}</p>
                <p className="text-sm text-text-muted">Zones</p>
              </div>
              <div className="bg-white rounded-card p-5 border border-border-light" style={{ boxShadow: "var(--shadow-card)" }}>
                <p className="text-2xl font-bold text-text-primary">{totalDesks}</p>
                <p className="text-sm text-text-muted">Desks</p>
              </div>
              <div className="bg-white rounded-card p-5 border border-border-light" style={{ boxShadow: "var(--shadow-card)" }}>
                <p className="text-2xl font-bold text-text-primary">{totalAmenities}</p>
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
              Your space with {totalDesks} desks, {totalZones} zones, and {totalAmenities} amenities is now visible to thousands of users.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/" className="px-6 py-3 bg-brand-600 text-white font-bold rounded-button btn-press hover:bg-brand-700 transition-colors">
                Back to home
              </Link>
              <button onClick={() => { setPublished(false); setStep(1); }} className="px-6 py-3 border border-border-light text-text-primary font-semibold rounded-button hover:bg-surface-muted transition-colors">
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
              className={`flex items-center gap-2 px-5 py-2.5 rounded-button text-sm font-semibold transition-all btn-press ${
                step === 1 ? "opacity-40 cursor-not-allowed text-text-muted" : "bg-white border border-border-light text-text-primary hover:bg-surface-muted"
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {step < 5 ? (
              <button
                onClick={nextStep}
                disabled={step === 1 && !selectedTemplate}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-button text-sm font-bold transition-all btn-press ${
                  step === 1 && !selectedTemplate ? "opacity-40 cursor-not-allowed bg-brand-300 text-white" : "bg-brand-600 text-white hover:bg-brand-700"
                }`}
                style={{ boxShadow: "var(--shadow-button)" }}
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex flex-col items-end gap-2">
                {publishError && (
                  <span className="text-xs text-red-500">{publishError}</span>
                )}
                <button
                  onClick={handlePublish}
                  disabled={isPublishing || !selectedListingId}
                  className={`flex items-center gap-2 px-8 py-3 text-white font-bold rounded-button btn-press transition-colors text-base ${
                    isPublishing || !selectedListingId
                      ? "bg-brand-300 cursor-not-allowed"
                      : "bg-brand-600 hover:bg-brand-700"
                  }`}
                  style={{ boxShadow: "var(--shadow-button)" }}
                >
                  <Check className="w-5 h-5" /> {isPublishing ? "Publishing..." : "Publish listing"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
