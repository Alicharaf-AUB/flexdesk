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
}

export interface Desk {
  id: string;
  label: string;
  zone: "quiet" | "collab" | "calls";
  perks: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  available: boolean;
  whyLike?: string;
}

export interface Zone {
  id: string;
  name: string;
  type: "quiet" | "collab" | "calls";
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Amenity {
  id: string;
  type: string;
  icon: string;
  x: number;
  y: number;
}

export const listings: Listing[] = [
  {
    id: "1",
    name: "The Hive Studio",
    neighborhood: "Beirut Central District",
    address: "Foch-Allenby, Beirut",
    distance: "0.3 km",
    rating: 4.8,
    reviewCount: 124,
    pricePerHour: 8,
    photos: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=500&fit=crop",
    ],
    perks: ["Wi-Fi", "Coffee", "Monitor", "Quiet", "Outlet"],
    vibeTags: ["Focused", "Quiet", "Founder-friendly"],
    availability: [true, true, false, true, true, true, false, false, true, true, true, true],
    lat: 33.8938,
    lng: 35.5018,
    description: "A calm, focused workspace in the heart of downtown. Natural light, great coffee, and fast Wi-Fi. Perfect for deep work sessions.",
    rules: [
      { icon: "volume-x", text: "Quiet after 6 PM" },
      { icon: "phone", text: "Calls allowed in phone corner" },
      { icon: "cigarette-off", text: "No smoking" },
    ],
    vibe: { quiet: 80, bright: 70, focus: 90 },
  },
  {
    id: "2",
    name: "Pixel Loft",
    neighborhood: "Gemmayzeh",
    address: "Armenia St, Beirut",
    distance: "0.7 km",
    rating: 4.6,
    reviewCount: 89,
    pricePerHour: 6,
    photos: [
      "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1564069114553-7215e1ff1890?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=500&fit=crop",
    ],
    perks: ["Wi-Fi", "Coffee", "Quiet", "Outlet"],
    vibeTags: ["Creative", "Social", "Calls OK"],
    availability: [true, false, false, true, true, false, true, true, true, false, true, true],
    lat: 33.8966,
    lng: 35.5154,
    description: "An energetic creative space with exposed brick and industrial vibes. Great for brainstorming, calls, and collaborative work.",
    rules: [
      { icon: "music", text: "Background music plays" },
      { icon: "phone", text: "Calls allowed everywhere" },
      { icon: "cigarette-off", text: "No smoking" },
    ],
    vibe: { quiet: 30, bright: 85, focus: 40 },
  },
  {
    id: "3",
    name: "Sunrise Workspace",
    neighborhood: "Hamra",
    address: "Hamra St, Beirut",
    distance: "1.2 km",
    rating: 4.9,
    reviewCount: 203,
    pricePerHour: 12,
    photos: [
      "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1562664377-709f2c337eb2?w=800&h=500&fit=crop",
    ],
    perks: ["Wi-Fi", "Coffee", "Monitor", "Quiet", "Outlet", "AC"],
    vibeTags: ["Premium", "Quiet", "Focused"],
    availability: [true, true, true, true, false, false, true, true, true, true, true, false],
    lat: 33.8958,
    lng: 35.4782,
    description: "Premium penthouse workspace with panoramic city views. Floor-to-ceiling windows fill the space with natural light all day.",
    rules: [
      { icon: "volume-x", text: "Whisper-only zone" },
      { icon: "phone-off", text: "No calls in main area" },
      { icon: "cigarette-off", text: "No smoking" },
    ],
    vibe: { quiet: 95, bright: 95, focus: 95 },
  },
  {
    id: "4",
    name: "The Corner Desk",
    neighborhood: "Mar Mikhael",
    address: "Armenia St, Beirut",
    distance: "0.5 km",
    rating: 4.5,
    reviewCount: 67,
    pricePerHour: 5,
    photos: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?w=800&h=500&fit=crop",
    ],
    perks: ["Wi-Fi", "Coffee", "Outlet"],
    vibeTags: ["Cozy", "Social", "Budget-friendly"],
    availability: [false, true, true, true, true, true, false, true, false, true, true, true],
    lat: 33.8952,
    lng: 35.5190,
    description: "A cozy neighborhood cafe-workspace hybrid. Affordable, friendly, and perfect for a quick work session or a full day.",
    rules: [
      { icon: "coffee", text: "One drink minimum" },
      { icon: "phone", text: "Calls in designated area" },
      { icon: "cigarette-off", text: "No smoking" },
    ],
    vibe: { quiet: 40, bright: 60, focus: 50 },
  },
  {
    id: "5",
    name: "Neon Lab",
    neighborhood: "Achrafieh",
    address: "Sodeco, Beirut",
    distance: "0.9 km",
    rating: 4.7,
    reviewCount: 156,
    pricePerHour: 10,
    photos: [
      "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&h=500&fit=crop",
    ],
    perks: ["Wi-Fi", "Monitor", "Coffee", "Outlet", "AC"],
    vibeTags: ["Tech", "Focused", "Startup-ready"],
    availability: [true, true, true, false, true, true, true, false, true, true, false, true],
    lat: 33.8817,
    lng: 35.5200,
    description: "A tech-forward space designed for builders. Dual monitors at every desk, standing desk options, and lightning-fast internet.",
    rules: [
      { icon: "volume-x", text: "Quiet hours 9 AM - 12 PM" },
      { icon: "phone", text: "Phone booths available" },
      { icon: "cigarette-off", text: "No smoking" },
    ],
    vibe: { quiet: 65, bright: 50, focus: 85 },
  },
  {
    id: "6",
    name: "Garden Desk Co.",
    neighborhood: "Verdun",
    address: "Rue Verdun, Beirut",
    distance: "1.5 km",
    rating: 4.4,
    reviewCount: 42,
    pricePerHour: 7,
    photos: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=500&fit=crop",
    ],
    perks: ["Wi-Fi", "Quiet", "Outlet", "AC"],
    vibeTags: ["Green", "Quiet", "Relaxed"],
    availability: [true, true, false, false, true, true, true, true, false, true, true, true],
    lat: 33.8885,
    lng: 35.4790,
    description: "A serene garden-adjacent workspace. Plants everywhere, natural light, and a peaceful atmosphere for focused work.",
    rules: [
      { icon: "volume-x", text: "Quiet zone all day" },
      { icon: "phone-off", text: "No calls inside" },
      { icon: "leaf", text: "Please care for the plants" },
    ],
    vibe: { quiet: 90, bright: 80, focus: 85 },
  },
];

export const desks: Desk[] = [
  // Quiet Zone
  { id: "q1", label: "Q-1", zone: "quiet", perks: ["Outlet", "Window"], x: 60, y: 80, width: 70, height: 40, available: true, whyLike: "Morning sun + power outlet right there" },
  { id: "q2", label: "Q-2", zone: "quiet", perks: ["Outlet"], x: 60, y: 140, width: 70, height: 40, available: true, whyLike: "Tucked in the corner — zero distractions" },
  { id: "q3", label: "Q-3", zone: "quiet", perks: ["Window"], x: 60, y: 200, width: 70, height: 40, available: false },
  { id: "q4", label: "Q-4", zone: "quiet", perks: ["Outlet", "Monitor"], x: 170, y: 80, width: 70, height: 40, available: true, whyLike: "Dual monitor setup ready to go" },
  { id: "q5", label: "Q-5", zone: "quiet", perks: ["Outlet"], x: 170, y: 140, width: 70, height: 40, available: true },
  { id: "q6", label: "Q-6", zone: "quiet", perks: [], x: 170, y: 200, width: 70, height: 40, available: false },

  // Collaboration Zone
  { id: "c1", label: "C-1", zone: "collab", perks: ["Outlet", "Monitor"], x: 380, y: 80, width: 70, height: 40, available: true, whyLike: "Big table, great for pair programming" },
  { id: "c2", label: "C-2", zone: "collab", perks: ["Outlet"], x: 380, y: 140, width: 70, height: 40, available: true },
  { id: "c3", label: "C-3", zone: "collab", perks: ["Monitor"], x: 380, y: 200, width: 70, height: 40, available: true },
  { id: "c4", label: "C-4", zone: "collab", perks: ["Outlet"], x: 490, y: 80, width: 70, height: 40, available: false },
  { id: "c5", label: "C-5", zone: "collab", perks: ["Outlet", "Monitor"], x: 490, y: 140, width: 70, height: 40, available: true, whyLike: "Right next to the whiteboard" },
  { id: "c6", label: "C-6", zone: "collab", perks: [], x: 490, y: 200, width: 70, height: 40, available: true },

  // Calls Corner
  { id: "p1", label: "P-1", zone: "calls", perks: ["Outlet", "Monitor"], x: 380, y: 360, width: 70, height: 40, available: true, whyLike: "Soundproofed booth — take any call" },
  { id: "p2", label: "P-2", zone: "calls", perks: ["Outlet"], x: 490, y: 360, width: 70, height: 40, available: false },
  { id: "p3", label: "P-3", zone: "calls", perks: ["Outlet"], x: 380, y: 420, width: 70, height: 40, available: true },
  { id: "p4", label: "P-4", zone: "calls", perks: [], x: 490, y: 420, width: 70, height: 40, available: true },
];

export const zones: Zone[] = [
  { id: "z1", name: "Quiet Zone", type: "quiet", x: 30, y: 50, width: 240, height: 220 },
  { id: "z2", name: "Collaboration Zone", type: "collab", x: 350, y: 50, width: 240, height: 220 },
  { id: "z3", name: "Calls Corner", type: "calls", x: 350, y: 320, width: 240, height: 170 },
];

export const amenities: Amenity[] = [
  { id: "a1", type: "coffee", icon: "coffee", x: 300, y: 140 },
  { id: "a2", type: "restroom", icon: "door-open", x: 620, y: 80 },
  { id: "a3", type: "printer", icon: "printer", x: 300, y: 400 },
  { id: "a4", type: "window", icon: "sun", x: 30, y: 30 },
  { id: "a5", type: "entrance", icon: "door-open", x: 300, y: 500 },
];

export const perkIcons: Record<string, string> = {
  "Wi-Fi": "wifi",
  "Coffee": "coffee",
  "Monitor": "monitor",
  "Quiet": "volume-x",
  "Outlet": "plug",
  "AC": "wind",
  "Window": "sun",
  "Chair": "armchair",
};

export const filterOptions = [
  { label: "Instant Book", icon: "zap" },
  { label: "Quiet", icon: "volume-x" },
  { label: "Near Outlet", icon: "plug" },
  { label: "Monitor", icon: "monitor" },
  { label: "Coffee", icon: "coffee" },
  { label: "AC", icon: "wind" },
];

export const hostTemplates = [
  { id: "home", label: "Home Office", icon: "home", desc: "1-3 desks" },
  { id: "studio", label: "Studio", icon: "palette", desc: "3-6 desks" },
  { id: "small-office", label: "Small Office", icon: "building", desc: "6-12 desks" },
  { id: "coworking", label: "Coworking Floor", icon: "layout-grid", desc: "12+ desks" },
];
