"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import type { Booking, Listing } from "@/lib/types";

export default function HostBookingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingId, setListingId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadListings() {
      try {
        const res = await fetch("/api/listings");
        const data = await res.json();
        if (isMounted) {
          setListings(data.listings || []);
          setListingId(data.listings?.[0]?.id || null);
        }
      } catch {
        if (isMounted) setListings([]);
      }
    }
    loadListings();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadBookings() {
      if (!listingId) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/bookings?listingId=${listingId}`);
        if (!res.ok) throw new Error("Failed to load bookings");
        const data = await res.json();
        if (isMounted) {
          setBookings(data.bookings || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError((err as Error).message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadBookings();
    return () => { isMounted = false; };
  }, [listingId]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: status as Booking["status"] } : b)));
  };

  return (
    <div className="min-h-screen bg-blueprint">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Host approvals</h1>
          <Link href="/host" className="text-sm font-semibold text-brand-600 hover:text-brand-700">Back to builder</Link>
        </div>

        <div className="bg-white rounded-card border border-border-light p-4 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <label className="text-xs font-semibold text-text-muted">Workspace</label>
          <select
            value={listingId || ""}
            onChange={(e) => setListingId(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-lg border border-border-light bg-white text-sm text-text-primary"
          >
            {listings.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        {loading && <div className="text-sm text-text-muted">Loading bookings...</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="space-y-3">
            {bookings.length === 0 && (
              <div className="bg-white rounded-card border border-border-light p-6 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
                <p className="text-sm text-text-secondary">No bookings yet.</p>
              </div>
            )}
            {bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-card border border-border-light p-4" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Desk {b.deskLabel}</p>
                    <p className="text-xs text-text-muted">{b.date} · {b.time} · {b.duration}</p>
                    <p className="text-xs text-text-muted">Status: {b.status}</p>
                  </div>
                  {b.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(b.id, "upcoming")}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg"
                      >
                        <Check className="w-3 h-3 inline" /> Approve
                      </button>
                      <button
                        onClick={() => updateStatus(b.id, "cancelled")}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-red-500 rounded-lg"
                      >
                        <X className="w-3 h-3 inline" /> Deny
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
