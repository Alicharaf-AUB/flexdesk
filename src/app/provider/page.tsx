"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Listing } from "@/lib/types";

export default function ProviderDashboard() {
  const [user, setUser] = useState<{ id: string; email: string; role?: string } | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [pricePerHour, setPricePerHour] = useState(8);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (isMounted) setUser(meData.user || null);
      if (meData.user?.role !== "COWORKING_OPERATOR" && meData.user?.role !== "CORPORATE_ADMIN" && meData.user?.role !== "MICRO_HOST") return;

      const res = await fetch("/api/provider/listings");
      const data = await res.json();
      if (isMounted) setListings(data.listings || []);
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const createListing = async () => {
    setError(null);
    const res = await fetch("/api/provider/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, address, pricePerHour }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Unable to create listing");
      return;
    }
    setListings((prev) => [data.listing, ...prev]);
    setName("");
    setAddress("");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-blueprint flex items-center justify-center">
        <div className="text-sm text-text-muted">Please sign in.</div>
      </div>
    );
  }

  if (user.role !== "COWORKING_OPERATOR" && user.role !== "CORPORATE_ADMIN" && user.role !== "MICRO_HOST") {
    return (
      <div className="min-h-screen bg-blueprint flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm font-semibold text-text-primary mb-2">Operator access only</div>
          <Link href="/provider/login" className="text-xs text-brand-600">Sign in as operator</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blueprint">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Manage my coworking space</h1>
          <div className="flex gap-3">
            <Link href="/host" className="text-sm font-semibold text-brand-600">Desk builder</Link>
            <Link href="/host/bookings" className="text-sm font-semibold text-brand-600">Approvals</Link>
          </div>
        </div>

        <div className="bg-white rounded-card border border-border-light p-4 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <h2 className="text-sm font-semibold text-text-primary mb-3">Create listing</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Listing name"
              className="px-3 py-2 rounded-lg border border-border-light"
            />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              className="px-3 py-2 rounded-lg border border-border-light"
            />
            <input
              type="number"
              value={pricePerHour}
              onChange={(e) => setPricePerHour(Number(e.target.value))}
              placeholder="Price/hr"
              className="px-3 py-2 rounded-lg border border-border-light"
            />
          </div>
          {error && <div className="text-xs text-red-500 mt-2">{error}</div>}
          <button onClick={createListing} className="mt-3 px-4 py-2 rounded-button bg-brand-600 text-white text-sm font-semibold">
            Create
          </button>
        </div>

        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="bg-white rounded-card border border-border-light p-4" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{l.name}</p>
                  <p className="text-xs text-text-muted">{l.address}</p>
                </div>
                <Link href="/host" className="text-xs text-brand-600">Edit map</Link>
              </div>
            </div>
          ))}
          {listings.length === 0 && (
            <div className="text-sm text-text-muted">No listings yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}