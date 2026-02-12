import Link from "next/link";

const posts = [
  {
    title: "Designing focus-friendly workdays",
    excerpt: "Simple routines to stay productive when you work by the hour.",
    date: "Feb 5, 2026",
  },
  {
    title: "How hosts create five-star desk experiences",
    excerpt: "What top-rated hosts do to make spaces feel welcoming.",
    date: "Jan 22, 2026",
  },
  {
    title: "The new hybrid office playbook",
    excerpt: "Flexible workspace trends teams love in 2026.",
    date: "Jan 8, 2026",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-blueprint">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-text-primary">FlexDesk Blog</h1>
        <p className="text-text-secondary mt-2">Guides, stories, and workspace tips.</p>

        <div className="mt-8 grid gap-4">
          {posts.map((post) => (
            <div key={post.title} className="bg-white rounded-card border border-border-light p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="text-xs text-text-muted">{post.date}</div>
              <h2 className="text-lg font-bold text-text-primary mt-2">{post.title}</h2>
              <p className="text-sm text-text-secondary mt-2">{post.excerpt}</p>
              <Link href="/help" className="text-xs font-semibold text-brand-600 mt-4 inline-flex items-center">
                Read more
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
