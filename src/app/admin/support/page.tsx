"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SupportRequest = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  topic: string;
  message: string;
  status: string;
  createdAt: string;
};

export default function SupportAdminPage() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (!meData.user || meData.user.role !== "SUPER_ADMIN") {
          if (isMounted) {
            setAuthorized(false);
            setLoading(false);
          }
          return;
        }

        const res = await fetch("/api/support/requests");
        if (!res.ok) throw new Error("Unable to load requests");
        const data = await res.json();
        if (isMounted) {
          setRequests(data.requests || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError((err as Error).message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-blueprint flex items-center justify-center px-4">
        <div className="bg-white rounded-card border border-border-light p-6 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="text-sm font-semibold text-text-primary mb-2">Admin access only</div>
          <Link href="/" className="text-xs font-semibold text-brand-600">Go home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blueprint">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Support requests</h1>
          <Link href="/help" className="text-xs font-semibold text-brand-600">View Help Center</Link>
        </div>

        {loading && <div className="text-sm text-text-muted">Loading requests...</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="bg-white rounded-card border border-border-light overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="grid grid-cols-6 gap-4 px-4 py-3 text-xs font-semibold text-text-muted bg-surface-muted">
              <span className="col-span-2">Request</span>
              <span>Role</span>
              <span>Status</span>
              <span>Created</span>
              <span>Contact</span>
            </div>
            {requests.length === 0 && (
              <div className="px-4 py-6 text-sm text-text-secondary">No requests yet.</div>
            )}
            {requests.map((req) => (
              <div key={req.id} className="grid grid-cols-6 gap-4 px-4 py-4 border-t border-border-light text-sm">
                <div className="col-span-2">
                  <div className="font-semibold text-text-primary">{req.topic}</div>
                  <div className="text-xs text-text-muted line-clamp-2">{req.message}</div>
                </div>
                <div className="text-xs text-text-secondary">{req.role || "-"}</div>
                <div className="text-xs text-text-secondary capitalize">{req.status}</div>
                <div className="text-xs text-text-secondary">{new Date(req.createdAt).toLocaleDateString()}</div>
                <div className="text-xs text-text-secondary">
                  <div>{req.name || "-"}</div>
                  <div className="text-text-muted">{req.email || "-"}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
