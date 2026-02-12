import Link from "next/link";
import { Sparkles, Users, ShieldCheck, Globe, ArrowRight } from "lucide-react";

const values = [
  {
    title: "Flexibility first",
    description: "Book on your schedule and pay only for the time you need.",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    title: "People-powered",
    description: "We match bookers and hosts to make every workspace feel local.",
    icon: <Users className="w-5 h-5" />,
  },
  {
    title: "Trust & safety",
    description: "Verified hosts, transparent policies, and dedicated support.",
    icon: <ShieldCheck className="w-5 h-5" />,
  },
  {
    title: "Global mindset",
    description: "Spaces for remote teams across cities and time zones.",
    icon: <Globe className="w-5 h-5" />,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-blueprint">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold">
            About FlexDesk
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mt-3">Workspaces that move with you</h1>
          <p className="text-text-secondary mt-3">
            FlexDesk connects people with inspiring workspaces by the hour. From quiet focus desks to bustling team hubs,
            we make it easy to find a place to do your best work—anywhere.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="bg-white rounded-card border border-border-light p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <h2 className="text-lg font-bold text-text-primary">Our story</h2>
            <p className="text-sm text-text-secondary mt-2">
              We started in 2024 to solve a simple problem: booking a desk should be as easy as ordering coffee. Today,
              we&apos;re helping companies and independent workers access flexible, premium spaces worldwide.
            </p>
          </div>
          <div className="bg-white rounded-card border border-border-light p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <h2 className="text-lg font-bold text-text-primary">Our mission</h2>
            <p className="text-sm text-text-secondary mt-2">
              Empower people to work wherever they thrive by making workspace access fast, transparent, and delightful.
            </p>
          </div>
          <div className="bg-white rounded-card border border-border-light p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <h2 className="text-lg font-bold text-text-primary">Our impact</h2>
            <p className="text-sm text-text-secondary mt-2">
              12,000+ desks booked monthly, 2,400+ verified hosts, and a 4.8/5 average satisfaction rating.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-text-primary">What we believe</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-card border border-border-light p-5 flex items-start gap-3"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  {value.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">{value.title}</h3>
                  <p className="text-xs text-text-secondary mt-1">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 bg-white rounded-card border border-border-light p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style={{ boxShadow: "var(--shadow-card)" }}>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Ready to find your next desk?</h3>
            <p className="text-sm text-text-secondary">Browse workspaces or become a host in minutes.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/search" className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-button">
              Find desks <ArrowRight className="w-3 h-3" />
            </Link>
            <Link href="/host" className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand-700 bg-brand-50 rounded-button">
              List your desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
