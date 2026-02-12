import Link from "next/link";

const sections = [
  {
    title: "Using FlexDesk",
    body: "By using FlexDesk, you agree to follow host rules, maintain respectful behavior, and provide accurate booking details.",
  },
  {
    title: "Bookings & cancellations",
    body: "Bookings are confirmed once accepted by the host or instantly for eligible listings. Cancellation policies are shown at checkout.",
  },
  {
    title: "Payments",
    body: "Payments are processed securely. Security deposits, where applicable, are released according to the host policy.",
  },
  {
    title: "Host responsibilities",
    body: "Hosts must provide safe, accurate listings and respond to booking requests in a timely manner.",
  },
  {
    title: "Account security",
    body: "Keep your account credentials safe. FlexDesk is not responsible for unauthorized account access.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-blueprint">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-card border border-border-light p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <h1 className="text-3xl font-bold text-text-primary">Terms of Service</h1>
          <p className="text-sm text-text-secondary mt-2">Last updated: February 11, 2026</p>

          <div className="mt-6 space-y-6">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-bold text-text-primary">{section.title}</h2>
                <p className="text-sm text-text-secondary mt-2">{section.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-border-light pt-4 text-sm text-text-secondary">
            Need more info? Visit the
            <Link href="/help" className="text-brand-600 font-semibold ml-1">Help Center</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
