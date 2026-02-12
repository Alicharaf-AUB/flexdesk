"use client";

import { useState } from "react";
import Link from "next/link";

export default function CorporateAdminOnboarding() {
  const [companyDomain, setCompanyDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/corporate-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyDomain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to complete onboarding");
      setDone(true);
      setTimeout(() => {
        window.location.href = "/provider";
      }, 1200);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blueprint flex items-center justify-center px-4">
      <div className="bg-white rounded-card border border-border-light p-8 w-full max-w-lg" style={{ boxShadow: "var(--shadow-card)" }}>
        <h1 className="text-xl font-bold text-text-primary mb-2">Corporate admin onboarding</h1>
        <p className="text-sm text-text-secondary mb-6">
          Set the email domain that can access your private workspace.
        </p>

        {done ? (
          <div className="text-center py-6">
            <div className="text-sm font-semibold text-text-primary">All set!</div>
            <p className="text-xs text-text-muted">Redirecting to your dashboard…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-text-muted">Company email domain</label>
              <input
                type="text"
                value={companyDomain}
                onChange={(e) => setCompanyDomain(e.target.value)}
                placeholder="company.com"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-border-light text-sm"
                required
              />
              <p className="text-xs text-text-muted mt-1">Only emails ending in this domain will be approved.</p>
            </div>

            {error && <div className="text-xs text-red-500">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-button text-white font-semibold ${loading ? "bg-brand-300" : "bg-brand-600 hover:bg-brand-700"}`}
            >
              {loading ? "Saving..." : "Complete onboarding"}
            </button>
          </form>
        )}

        <div className="mt-4 text-xs text-text-muted">
          <Link className="text-brand-600" href="/provider">Skip for now</Link>
        </div>
      </div>
    </div>
  );
}
