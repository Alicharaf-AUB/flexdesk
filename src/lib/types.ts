export interface Listing {
  id: string;
  name: string;
  neighborhood: string;
  address: string;
  distance: string;
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  photos: string[];
  perks: string[];
  vibeTags: string[];
  availability: boolean[];
  lat: number;
  lng: number;
  description: string;
  rules: { icon: string; text: string }[];
  vibe: {
    quiet: number;
    bright: number;
    focus: number;
  };
  mode?: "CLOSED" | "OPEN" | "MICRO_HOST";
  isPublic?: boolean;
  reviewsEnabled?: boolean;
  requiresId?: boolean;
  securityDepositCents?: number;
  cancellationPolicy?: string;
  houseRules?: string[];
  requiresApproval?: boolean;
  paidEnabled?: boolean;
  allowedEmails?: string[];
  ownerId?: string | null;
}

export interface Booking {
  id: string;
  listingId: string;
  deskLabel: string;
  date: string;
  time: string;
  duration: string;
  status: "pending" | "upcoming" | "active" | "completed" | "cancelled";
  totalPrice: number;
  checkInCode: string;
}

export interface WorkspaceFloor {
  id: string;
  name: string;
  sortOrder: number;
  desks: Array<{ id: string; label: string; zone: string; perks: string[]; x: number; y: number; width: number; height: number; rotation?: number; available: boolean; whyLike?: string; kind?: "desk" | "table" }>;
  zones: Array<{ id: string; type: string; name: string; x: number; y: number; width: number; height: number; rotation?: number }>;
  amenities: Array<{ id: string; type: string; icon: string; x: number; y: number; rotation?: number; name?: string | null }>;
}

export interface Workspace {
  id: string;
  name: string;
  listingId?: string | null;
  floors: WorkspaceFloor[];
}
