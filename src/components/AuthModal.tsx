"use client";

import { useState } from "react";
import { X, Mail, Lock, User, ArrowRight, MapPin } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<"booker" | "coworking_operator" | "micro_host" | "corporate_admin">("booker");
  const [companyDomain, setCompanyDomain] = useState("");
  const [success, setSuccess] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (forgotPassword) {
      setResetSent(true);
      setTimeout(() => {
        setResetSent(false);
        setForgotPassword(false);
      }, 2000);
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = tab === "login"
        ? { email, password }
        : { email, password, name, accountType, companyDomain: companyDomain || undefined };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to authenticate");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        window.dispatchEvent(new Event("auth:changed"));
        if (tab === "signup") {
          if (accountType === "coworking_operator") {
            window.location.href = "/provider";
            return;
          }
          if (accountType === "corporate_admin") {
            window.location.href = "/onboarding/corporate-admin";
            return;
          }
          if (accountType === "micro_host") {
            window.location.href = "/onboarding/micro-host";
            return;
          }
        }
        onClose();
      }, 1200);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden animate-fade-in-up"
        style={{ boxShadow: "var(--shadow-elevated)" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl hover:bg-surface-muted flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4 text-text-secondary" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-text-primary tracking-tight">
              Flex<span className="text-brand-600">Desk</span>
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-surface-muted rounded-xl p-1 mb-6">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                tab === "login"
                  ? "bg-white text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                tab === "signup"
                  ? "bg-white text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Sign up
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                {tab === "login" ? "Welcome back!" : "Account created!"}
              </h3>
              <p className="text-sm text-text-secondary mt-1">Redirecting...</p>
            </div>
          ) : resetSent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-brand-600" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Check your email</h3>
              <p className="text-sm text-text-secondary mt-1">We sent a reset link to <strong>{email || "your email"}</strong></p>
            </div>
          ) : forgotPassword ? (
            <form onSubmit={handleSubmit}>
              <button type="button" onClick={() => setForgotPassword(false)} className="text-xs font-medium text-brand-600 hover:text-brand-700 mb-4 flex items-center gap-1">
                <ArrowRight className="w-3 h-3 rotate-180" /> Back to login
              </button>
              <h2 className="text-xl font-bold text-text-primary mb-1">Reset password</h2>
              <p className="text-sm text-text-secondary mb-6">Enter your email and we&apos;ll send you a reset link.</p>
              <div className="relative mb-5">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted" />
                <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-(--radius-input) border border-border-light bg-white text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all" />
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-button btn-press transition-colors" style={{ boxShadow: "var(--shadow-button)" }}>
                Send reset link <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-bold text-text-primary mb-1">
                {tab === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-sm text-text-secondary mb-6">
                {tab === "login"
                  ? "Log in to book your next desk."
                  : "Join thousands of people finding their perfect workspace."}
              </p>

              <div className="space-y-3">
                {tab === "signup" && (
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-(--radius-input) border border-border-light bg-white text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-(--radius-input) border border-border-light bg-white text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-(--radius-input) border border-border-light bg-white text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
                  />
                </div>

                {tab === "signup" && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-text-primary mb-2">I want to:</p>
                    <div className="grid gap-2">
                      {[
                        { id: "booker", label: "Book a desk" },
                        { id: "coworking_operator", label: "Manage a coworking space" },
                        { id: "corporate_admin", label: "Manage a corporate workspace" },
                        { id: "micro_host", label: "Rent a desk in my office" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setAccountType(opt.id as typeof accountType)}
                          className={`w-full text-left px-3 py-2 rounded-(--radius-input) border text-xs font-semibold transition-colors ${
                            accountType === opt.id
                              ? "border-brand-500 bg-brand-50 text-brand-700"
                              : "border-border-light text-text-secondary hover:bg-surface-muted"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {accountType === "corporate_admin" && (
                      <div className="mt-3">
                        <label className="text-xs font-semibold text-text-muted">Company email domain</label>
                        <input
                          type="text"
                          placeholder="company.com"
                          value={companyDomain}
                          onChange={(e) => setCompanyDomain(e.target.value)}
                          className="mt-1 w-full px-3 py-2 rounded-(--radius-input) border border-border-light bg-white text-sm text-text-primary"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {tab === "login" && !forgotPassword && (
                <div className="flex justify-end mt-2">
                  <button type="button" onClick={() => setForgotPassword(true)} className="text-xs font-medium text-brand-600 hover:text-brand-700">
                    Forgot password?
                  </button>
                </div>
              )}

              {formError && (
                <div className="text-xs text-red-500 mt-2">{formError}</div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`flex items-center justify-center gap-2 w-full py-3 mt-5 text-white font-bold rounded-button btn-press transition-colors ${
                  submitting ? "bg-brand-300 cursor-not-allowed" : "bg-brand-600 hover:bg-brand-700"
                }`}
                style={{ boxShadow: "var(--shadow-button)" }}
              >
                {submitting ? "Please wait..." : tab === "login" ? "Log in" : "Create account"}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-light" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-text-muted">or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-button border border-border-light hover:bg-surface-muted transition-colors text-sm font-medium text-text-primary"
                >
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/api/auth/github";
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-button border border-border-light hover:bg-surface-muted transition-colors text-sm font-medium text-text-primary"
                >
                  <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  GitHub
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="px-8 py-4 bg-surface-muted border-t border-border-light">
          <p className="text-xs text-text-muted text-center">
            By continuing, you agree to FlexDesk&apos;s Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
