import Link from "next/link";

const cookieTypes = [
  {
    title: "Essential",
    description: "Required for authentication, security, and core functionality.",
  },
  {
    title: "Preferences",
    description: "Remember your location, filters, and UI preferences.",
  },
  {
    title: "Analytics",
    description: "Helps us understand how the product is used so we can improve it.",
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-blueprint">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-card border border-border-light p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <h1 className="text-3xl font-bold text-text-primary">Cookie Policy</h1>
          <p className="text-sm text-text-secondary mt-2">Last updated: February 11, 2026</p>

          <div className="mt-6 space-y-4">
            {cookieTypes.map((cookie) => (
              <div key={cookie.title}>
                <h2 className="text-lg font-bold text-text-primary">{cookie.title}</h2>
                <p className="text-sm text-text-secondary mt-2">{cookie.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-border-light pt-4 text-sm text-text-secondary">
            Learn more in our
            <Link href="/privacy" className="text-brand-600 font-semibold ml-1">Privacy Policy</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
