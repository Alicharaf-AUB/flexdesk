"use client";

import { useState } from "react";
import Link from "next/link";

export default function MicroHostOnboarding() {
  const [idVerified, setIdVerified] = useState(false);
  const [addressVerified, setAddressVerified] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptLiability, setAcceptLiability] = useState(false);
  const [acceptHouseRules, setAcceptHouseRules] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/micro-host", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idVerified, addressVerified, acceptTerms, acceptLiability, acceptHouseRules }),
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
        <h1 className="text-xl font-bold text-text-primary mb-2">Office desk host onboarding</h1>
        <p className="text-sm text-text-secondary mb-6">
          Verify your identity and accept the host terms to publish an office desk listing.
        </p>

        {done ? (
          <div className="text-center py-6">
            <div className="text-sm font-semibold text-text-primary">All set!</div>
            <p className="text-xs text-text-muted">Redirecting to your dashboard…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex items-start gap-2 text-xs font-semibold text-text-secondary">
              <input type="checkbox" checked={idVerified} onChange={(e) => setIdVerified(e.target.checked)} />
              I completed ID verification.
            </label>
            <label className="flex items-start gap-2 text-xs font-semibold text-text-secondary">
              <input type="checkbox" checked={addressVerified} onChange={(e) => setAddressVerified(e.target.checked)} />
              I verified my address.
            </label>
            <label className="flex items-start gap-2 text-xs font-semibold text-text-secondary">
              <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
              I accept the platform terms of use.
            </label>
            <label className="flex items-start gap-2 text-xs font-semibold text-text-secondary">
              <input type="checkbox" checked={acceptLiability} onChange={(e) => setAcceptLiability(e.target.checked)} />
              I acknowledge the liability disclaimer.
            </label>
            <label className="flex items-start gap-2 text-xs font-semibold text-text-secondary">
              <input type="checkbox" checked={acceptHouseRules} onChange={(e) => setAcceptHouseRules(e.target.checked)} />
              I will enforce house rules for renters.
            </label>

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
