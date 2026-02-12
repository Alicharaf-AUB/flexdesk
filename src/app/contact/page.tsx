"use client";

import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-blueprint">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-card border border-border-light p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <h1 className="text-3xl font-bold text-text-primary">Contact support</h1>
          <p className="text-text-secondary mt-2">Tell us what you need and we&apos;ll respond quickly.</p>

          {submitted ? (
            <div className="mt-6 bg-brand-50 border border-brand-100 rounded-2xl p-4 text-sm text-brand-700">
              Thanks! We&apos;ll get back to you within 24 hours.
            </div>
          ) : (
            <form
              className="mt-6 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setLoading(true);
                const formData = new FormData(e.currentTarget);
                const payload = {
                  name: String(formData.get("name") || ""),
                  email: String(formData.get("email") || ""),
                  role: String(formData.get("role") || ""),
                  topic: String(formData.get("topic") || "Support"),
                  message: String(formData.get("message") || ""),
                };
                try {
                  const res = await fetch("/api/support/requests", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                  if (!res.ok) throw new Error("Unable to submit request");
                  setSubmitted(true);
                  e.currentTarget.reset();
                } catch (err) {
                  setError((err as Error).message);
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div>
                <label className="text-xs font-semibold text-text-muted">Full name</label>
                <input name="name" className="mt-1 w-full px-3 py-2 rounded-lg border border-border-light" placeholder="Your name" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted">Email</label>
                <input name="email" className="mt-1 w-full px-3 py-2 rounded-lg border border-border-light" placeholder="you@email.com" type="email" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted">Role</label>
                <select name="role" className="mt-1 w-full px-3 py-2 rounded-lg border border-border-light">
                  <option value="">Select role</option>
                  <option value="booker">Booker</option>
                  <option value="micro_host">Office Host</option>
                  <option value="coworking_operator">Coworking Operator</option>
                  <option value="corporate_admin">Corporate Admin</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted">Topic</label>
                <select name="topic" className="mt-1 w-full px-3 py-2 rounded-lg border border-border-light">
                  <option>Booking issue</option>
                  <option>Payment & invoices</option>
                  <option>Host support</option>
                  <option>Account help</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted">Message</label>
                <textarea name="message" className="mt-1 w-full px-3 py-2 rounded-lg border border-border-light min-h-30" placeholder="How can we help?" />
              </div>
              {error && <div className="text-xs text-red-500">{error}</div>}
              <button className="w-full px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-button" disabled={loading}>
                {loading ? "Sending..." : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
