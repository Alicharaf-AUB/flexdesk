import { prisma } from "../src/lib/prisma";

async function main() {
  const existing = await prisma.listing.count();
  if (existing > 0) return;

  const provider = await prisma.user.create({
    data: {
      email: "host@flexdesk.io",
      passwordHash: "seed-only",
      name: "Host Admin",
      role: "COWORKING_OPERATOR",
      accountType: "COWORKING_OPERATOR",
    },
  });

  const listing = await prisma.listing.create({
    data: {
      ownerId: provider.id,
      name: "The Hive Studio",
      neighborhood: "Beirut Central District",
      address: "Foch-Allenby, Beirut",
      distance: "0.3 km",
      rating: 4.8,
      reviewCount: 124,
      pricePerHour: 8,
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=500&fit=crop",
      ]),
      perks: JSON.stringify(["Wi-Fi", "Coffee", "Monitor", "Quiet", "Outlet"]),
      vibeTags: JSON.stringify(["Focused", "Quiet", "Founder-friendly"]),
      availability: JSON.stringify([true, true, false, true, true, true, false, false, true, true, true, true]),
      lat: 33.8938,
      lng: 35.5018,
      description: "A calm, focused workspace in the heart of downtown.",
      rules: JSON.stringify([
        { icon: "volume-x", text: "Quiet after 6 PM" },
        { icon: "phone", text: "Calls allowed in phone corner" },
      ]),
      vibe: JSON.stringify({ quiet: 80, bright: 70, focus: 90 }),
      mode: "OPEN",
      isPublic: true,
      reviewsEnabled: true,
      requiresId: false,
      securityDepositCents: 0,
      cancellationPolicy: "flexible",
      houseRules: JSON.stringify(["No smoking", "Respect quiet zones"]),
      requiresApproval: true,
      paidEnabled: false,
      allowedEmails: JSON.stringify(["member@flexdesk.io"]),
      workspace: {
        create: {
          name: "Hive Studio",
          floors: {
            create: [
              {
                name: "Floor 1",
                sortOrder: 1,
                desks: {
                  create: [
                    { label: "Q-1", zone: "quiet", perks: JSON.stringify(["Outlet"]), x: 60, y: 80, width: 70, height: 40, available: true },
                    { label: "Q-2", zone: "quiet", perks: JSON.stringify(["Window"]), x: 160, y: 80, width: 70, height: 40, available: true },
                    { label: "C-1", zone: "collab", perks: JSON.stringify(["Monitor"]), x: 360, y: 120, width: 70, height: 40, available: true },
                  ],
                },
                zones: {
                  create: [
                    { type: "quiet", name: "Quiet Zone", x: 40, y: 60, width: 260, height: 180 },
                    { type: "collab", name: "Collaboration", x: 320, y: 80, width: 230, height: 160 },
                  ],
                },
                amenities: {
                  create: [
                    { type: "coffee", icon: "coffee", x: 120, y: 260 },
                    { type: "outlet", icon: "plug", x: 260, y: 260 },
                  ],
                },
              },
              {
                name: "Floor 2",
                sortOrder: 2,
                desks: {
                  create: [
                    { label: "F2-1", zone: "calls", perks: JSON.stringify(["Outlet"]), x: 80, y: 100, width: 70, height: 40, available: true },
                    { label: "F2-2", zone: "calls", perks: JSON.stringify(["Monitor"]), x: 200, y: 140, width: 70, height: 40, available: true },
                  ],
                },
                zones: {
                  create: [{ type: "calls", name: "Calls Corner", x: 60, y: 80, width: 260, height: 160 }],
                },
                amenities: {
                  create: [{ type: "printer", icon: "printer", x: 180, y: 260 }],
                },
              },
            ],
          },
        },
      },
    },
  });

  await prisma.booking.create({
    data: {
      listingId: listing.id,
      deskLabel: "Q-1",
      date: "Today",
      time: "2:00 PM",
      duration: "2h",
      status: "active",
      totalPrice: 18,
      checkInCode: "FD-8294",
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
