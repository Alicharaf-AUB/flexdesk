import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Flexible",
    price: "$5",
    cadence: "/hour",
    description: "Perfect for drop-in work sessions.",
    features: ["Instant booking", "Flexible cancellation", "Basic support"],
  },
  {
    name: "Pro",
    price: "$29",
    cadence: "/month",
    description: "For frequent bookers and teams.",
    features: ["Member pricing", "Priority support", "Team booking tools"],
  },
  {
    name: "Host",
    price: "10%",
    cadence: "host fee",
    description: "Built for operators and office hosts.",
    features: ["Desk map builder", "Booking approvals", "Revenue dashboard"],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-blueprint">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">Simple, transparent pricing</h1>
          <p className="text-text-secondary mt-2">Choose a plan that fits how you work or host.</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className="bg-white rounded-card border border-border-light p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <h2 className="text-lg font-bold text-text-primary">{plan.name}</h2>
              <p className="text-sm text-text-secondary mt-2">{plan.description}</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-3xl font-bold text-text-primary">{plan.price}</span>
                <span className="text-sm text-text-muted">{plan.cadence}</span>
              </div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-text-secondary">
                    <Check className="w-4 h-4 text-brand-600" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/search" className="mt-6 inline-flex items-center justify-center w-full px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-button">
                Get started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
