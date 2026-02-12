import Link from "next/link";

const sections = [
  {
    title: "Overview",
    body: "We collect only the information needed to provide booking, hosting, and support services. This policy explains what we collect, how we use it, and your rights.",
  },
  {
    title: "Information we collect",
    body: "Account details (name, email), booking details, payment metadata, device and usage data, and verified identity information for applicable listings.",
  },
  {
    title: "How we use data",
    body: "To process bookings, enable hosting tools, prevent fraud, personalize search results, and deliver customer support.",
  },
  {
    title: "Sharing",
    body: "We share minimal booking information with hosts and do not sell personal data. Service providers only access data required to perform their services.",
  },
  {
    title: "Retention",
    body: "We retain data for as long as necessary to provide services or comply with legal obligations. You can request deletion at any time.",
  },
  {
    title: "Security",
    body: "We use encryption in transit, access controls, and regular audits to protect your data.",
  },
  {
    title: "Your choices",
    body: "Update your profile, request data export, or ask for deletion by contacting support.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-blueprint">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-card border border-border-light p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <h1 className="text-3xl font-bold text-text-primary">Privacy Policy</h1>
          <p className="text-sm text-text-secondary mt-2">
            Last updated: February 11, 2026
          </p>

          <div className="mt-6 space-y-6">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-bold text-text-primary">{section.title}</h2>
                <p className="text-sm text-text-secondary mt-2">{section.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-border-light pt-4 text-sm text-text-secondary">
            Questions? Reach us at support@flexdesk.com or visit the
            <Link href="/help" className="text-brand-600 font-semibold ml-1">Help Center</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
