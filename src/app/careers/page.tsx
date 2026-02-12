import Link from "next/link";

const roles = [
  {
    title: "Product Designer",
    location: "Remote",
    summary: "Design intuitive booking and hosting journeys.",
  },
  {
    title: "Full-stack Engineer",
    location: "Remote",
    summary: "Build fast, reliable marketplace experiences.",
  },
  {
    title: "Community Manager",
    location: "Hybrid",
    summary: "Grow and support our host community.",
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-blueprint">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-text-primary">Careers at FlexDesk</h1>
        <p className="text-text-secondary mt-2">Help build the future of flexible work.</p>

        <div className="mt-8 grid gap-4">
          {roles.map((role) => (
            <div key={role.title} className="bg-white rounded-card border border-border-light p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <h2 className="text-lg font-bold text-text-primary">{role.title}</h2>
              <p className="text-sm text-text-muted mt-1">{role.location}</p>
              <p className="text-sm text-text-secondary mt-2">{role.summary}</p>
              <Link href="/contact" className="text-xs font-semibold text-brand-600 mt-4 inline-flex items-center">
                Apply now
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
