"use client";

import { useState } from "react";
import Link from "next/link";

export default function ProviderLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      const role = data.user?.role;
      if (role !== "COWORKING_OPERATOR" && role !== "CORPORATE_ADMIN" && role !== "MICRO_HOST") {
        throw new Error("Not an operator account");
      }
      window.location.href = "/provider";
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blueprint flex items-center justify-center px-4">
      <div className="bg-white rounded-card border border-border-light p-8 w-full max-w-md" style={{ boxShadow: "var(--shadow-card)" }}>
        <h1 className="text-xl font-bold text-text-primary mb-2">Operator login</h1>
        <p className="text-sm text-text-secondary mb-6">Manage your coworking space.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border-light"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border-light"
          />
          {error && <div className="text-xs text-red-500">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-button text-white font-semibold ${loading ? "bg-brand-300" : "bg-brand-600 hover:bg-brand-700"}`}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="text-xs text-text-muted mt-4">
          No operator account? <Link className="text-brand-600" href="/provider/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}