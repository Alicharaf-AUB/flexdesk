"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  MapPin,
  Calendar,
  CreditCard,
  Clock,
  MessageCircle,
  ChevronRight,
  Users,
  Briefcase,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

const roleGuides = [
  {
    id: "booker",
    label: "Booker",
    icon: <Users className="w-4 h-4" />,
    steps: [
      "Search for a desk by location and time",
      "Review amenities, house rules, and pricing",
      "Book instantly or request approval",
      "Check in with your code and enjoy",
    ],
    tips: ["Save favorites for quick rebooking", "Use filters to find quiet zones"],
  },
  {
    id: "micro-host",
    label: "Office Host",
    icon: <Briefcase className="w-4 h-4" />,
    steps: [
      "Complete host onboarding and verification",
      "Build your floor plan in the desk builder",
      "Set availability, rules, and pricing",
      "Approve requests and welcome guests",
    ],
    tips: ["Upload photos for higher trust", "Use zones to organize desks"],
  },
  {
    id: "operator",
    label: "Coworking Operator",
    icon: <Building2 className="w-4 h-4" />,
    steps: [
      "Create a listing and configure policies",
      "Design floors, zones, and amenities",
      "Review bookings and payments",
      "Optimize occupancy with insights",
    ],
    tips: ["Keep amenities updated", "Enable reviews for credibility"],
  },
  {
    id: "corporate",
    label: "Corporate Admin",
    icon: <ShieldCheck className="w-4 h-4" />,
    steps: [
      "Set a company email domain",
      "Invite employees to book desks",
      "Approve access requests",
      "Monitor workspace usage",
    ],
    tips: ["Use allowlists for sensitive teams", "Review support requests weekly"],
  },
];

const faqItems = [
  {
    question: "How do I reschedule a booking?",
    answer: "Open My Bookings, select the booking, and choose Edit. If the host allows changes, you can adjust time or date instantly.",
  },
  {
    question: "What happens if a host declines my request?",
    answer: "You will receive a notification and any pre-authorized charges will be released. You can book another desk immediately.",
  },
  {
    question: "How do payouts work for hosts?",
    answer: "Host payouts are released after the booking completes, minus the platform fee. View payout history in the host dashboard.",
  },
  {
    question: "Do I need ID verification?",
    answer: "Some listings require verification for safety. If required, you will be prompted to complete it before booking.",
  },
];

const supportTracks = [
  {
    id: "booking",
    title: "Booking & changes",
    icon: <Calendar className="w-5 h-5" />,
    steps: [
      "Choose a workspace and time",
      "Confirm details and pay if required",
      "Manage edits or cancellations in My Bookings",
    ],
    tips: ["Free cancellation within the host policy", "Instant confirmations for most listings"],
  },
  {
    id: "access",
    title: "Check-in & access",
    icon: <MapPin className="w-5 h-5" />,
    steps: [
      "Open your booking details",
      "Follow check-in instructions and codes",
      "Arrive on time and enjoy your desk",
    ],
    tips: ["Share the check-in code only with teammates", "Need help? Tap Contact Support"],
  },
  {
    id: "billing",
    title: "Billing & invoices",
    icon: <CreditCard className="w-5 h-5" />,
    steps: [
      "Review charges in your booking receipt",
      "Download invoice from My Bookings",
      "Contact support for adjustments",
    ],
    tips: ["Security deposits are released per policy", "Receipts include tax line items"],
  },
];

const quickActions = [
  { label: "Live chat", icon: <MessageCircle className="w-4 h-4" />, note: "Average reply: 2 min" },
  { label: "Callback", icon: <Clock className="w-4 h-4" />, note: "Mon–Sat, 9am–8pm" },
  { label: "Help desk", icon: <LifeBuoy className="w-4 h-4" />, note: "Browse guides" },
];

export default function HelpPage() {
  const [activeTrack, setActiveTrack] = useState(supportTracks[0]);
  const [activeRole, setActiveRole] = useState(roleGuides[0]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      topic: String(formData.get("topic") || "Support"),
      message: String(formData.get("message") || ""),
      role: String(formData.get("role") || ""),
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
  };

  return (
    <div className="min-h-screen bg-blueprint">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold">
              <LifeBuoy className="w-4 h-4" />
              Support center
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mt-3">Guided help, step by step</h1>
            <p className="text-text-secondary mt-2 max-w-2xl">
              Pick your role to get a guided infographic and tailored FAQs. Submit a request and we&apos;ll log it for
              our admin team to review.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {quickActions.map((action) => (
                <div
                  key={action.label}
                  className="bg-white rounded-card border border-border-light p-4 flex flex-col gap-2"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                    {action.icon}
                    {action.label}
                  </div>
                  <p className="text-xs text-text-muted">{action.note}</p>
                  <button className="mt-auto text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                    Start <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-10 bg-white rounded-card border border-border-light p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <h2 className="text-lg font-bold text-text-primary">Role-based guided experience</h2>
              <p className="text-xs text-text-muted mt-1">Select a role to see the infographic steps.</p>

              <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr]">
                <div className="flex flex-col gap-2">
                  {roleGuides.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setActiveRole(role)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors border ${
                        activeRole.id === role.id
                          ? "bg-brand-600 text-white border-brand-600"
                          : "bg-surface-muted text-text-secondary border-border-light hover:bg-brand-50 hover:text-brand-700"
                      }`}
                    >
                      <span className={activeRole.id === role.id ? "text-white" : "text-brand-600"}>{role.icon}</span>
                      {role.label}
                    </button>
                  ))}
                </div>

                <div className="bg-surface-muted rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                    <span className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                      {activeRole.icon}
                    </span>
                    {activeRole.label}
                  </div>

                  <div className="mt-4 grid gap-3">
                    {activeRole.steps.map((step, index) => (
                      <div key={step} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-white border border-border-light flex items-center justify-center text-xs font-bold text-brand-600">
                          {index + 1}
                        </div>
                        <p className="text-sm text-text-secondary">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {activeRole.tips.map((tip) => (
                      <div key={tip} className="bg-white border border-border-light rounded-xl px-3 py-2 text-xs text-text-secondary">
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 bg-white rounded-card border border-border-light p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <h2 className="text-lg font-bold text-text-primary">Interactive support map</h2>
              <p className="text-xs text-text-muted mt-1">Pick a topic to see the step-by-step flow.</p>

              <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr]">
                <div className="flex flex-col gap-2">
                  {supportTracks.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => setActiveTrack(track)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors border ${
                        activeTrack.id === track.id
                          ? "bg-brand-600 text-white border-brand-600"
                          : "bg-surface-muted text-text-secondary border-border-light hover:bg-brand-50 hover:text-brand-700"
                      }`}
                    >
                      <span className={activeTrack.id === track.id ? "text-white" : "text-brand-600"}>{track.icon}</span>
                      {track.title}
                    </button>
                  ))}
                </div>

                <div className="bg-surface-muted rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                    <span className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                      {activeTrack.icon}
                    </span>
                    {activeTrack.title}
                  </div>

                  <div className="mt-4 grid gap-3">
                    {activeTrack.steps.map((step, index) => (
                      <div key={step} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-white border border-border-light flex items-center justify-center text-xs font-bold text-brand-600">
                          {index + 1}
                        </div>
                        <p className="text-sm text-text-secondary">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {activeTrack.tips.map((tip) => (
                      <div key={tip} className="bg-white border border-border-light rounded-xl px-3 py-2 text-xs text-text-secondary">
                        {tip}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/contact" className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-brand-600 rounded-button">
                      Contact support
                    </Link>
                    <Link href="/search" className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-brand-700 bg-brand-50 rounded-button">
                      Browse workspaces
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 bg-white rounded-card border border-border-light p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <h2 className="text-lg font-bold text-text-primary">FAQ</h2>
              <div className="mt-4 space-y-3">
                {faqItems.map((faq) => (
                  <button
                    key={faq.question}
                    onClick={() => setOpenFaq(openFaq === faq.question ? null : faq.question)}
                    className="w-full text-left bg-surface-muted rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center justify-between text-sm font-semibold text-text-primary">
                      {faq.question}
                      <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === faq.question ? "rotate-180" : ""}`} />
                    </div>
                    {openFaq === faq.question && (
                      <p className="text-xs text-text-secondary mt-2">{faq.answer}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 bg-white rounded-card border border-border-light p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <h2 className="text-lg font-bold text-text-primary">Submit a support request</h2>
              <p className="text-xs text-text-muted mt-1">Every request is logged for our admin team.</p>

              {submitted && (
                <div className="mt-4 bg-brand-50 border border-brand-100 rounded-xl px-3 py-2 text-xs text-brand-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Request received. We&apos;ll respond within 24 hours.
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
                <input name="name" placeholder="Full name" className="px-3 py-2 rounded-lg border border-border-light text-sm" />
                <input name="email" type="email" placeholder="Email" className="px-3 py-2 rounded-lg border border-border-light text-sm" />
                <select name="role" className="px-3 py-2 rounded-lg border border-border-light text-sm sm:col-span-2">
                  <option value="">Select role</option>
                  <option value="booker">Booker</option>
                  <option value="micro_host">Office Host</option>
                  <option value="coworking_operator">Coworking Operator</option>
                  <option value="corporate_admin">Corporate Admin</option>
                </select>
                <input name="topic" placeholder="Topic (e.g. Booking issue)" className="px-3 py-2 rounded-lg border border-border-light text-sm sm:col-span-2" />
                <textarea name="message" placeholder="Describe your issue" className="px-3 py-2 rounded-lg border border-border-light text-sm min-h-30 sm:col-span-2" />
                {error && <div className="text-xs text-red-500 sm:col-span-2">{error}</div>}
                <button
                  type="submit"
                  disabled={loading}
                  className="sm:col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-button"
                >
                  {loading ? "Submitting..." : "Submit request"}
                </button>
              </form>
            </div>
          </div>

          <aside className="w-full lg:w-80">
            <div className="bg-white rounded-card border border-border-light p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <h3 className="text-sm font-semibold text-text-primary">Support snapshot</h3>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Avg. response time", value: "2 min" },
                  { label: "Bookings resolved", value: "98%" },
                  { label: "Top-rated hosts", value: "4.8/5" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between text-xs text-text-secondary">
                    <span>{stat.label}</span>
                    <span className="font-semibold text-text-primary">{stat.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-surface-muted p-4 text-xs text-text-secondary">
                Need immediate help? Use live chat or email support@flexdesk.com.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
