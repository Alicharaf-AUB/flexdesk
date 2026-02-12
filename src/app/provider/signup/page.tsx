"use client";

import { useState } from "react";
import Link from "next/link";

export default function ProviderSignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "coworking_operator", accountType: "coworking_operator" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
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
        <h1 className="text-xl font-bold text-text-primary mb-2">Create operator account</h1>
        <p className="text-sm text-text-secondary mb-6">Set up your coworking space.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border-light"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border-light"
          />
          <input
            type="password"
            placeholder="Password (8+ chars)"
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
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="text-xs text-text-muted mt-4">
          Already an operator? <Link className="text-brand-600" href="/provider/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}