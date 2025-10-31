import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PlanCardProps {
  plan: {
    name: string;
    icon: string;
    price: number;
    period: string;
    features: string[];
  };
}

export function PlanCard({ plan }: PlanCardProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly");

  const annualPrice = Math.floor(plan.price * 12 * 0.9); // 10% discount for annual

  return (
    <div className="rounded-lg border border-border bg-card p-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="text-4xl">{plan.icon}</div>
        <div>
          <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
          <p className="text-muted-foreground">Includes</p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="mt-0.5 text-lg text-green-500">✓</span>
            <span className="text-foreground">{feature}</span>
          </div>
        ))}
      </div>

      {/* Pricing and Action */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <Button variant="default">Update Plan</Button>

        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-foreground">
            ${billingPeriod === "monthly" ? plan.price : annualPrice}
            <span className="text-sm text-muted-foreground">
              /{billingPeriod === "monthly" ? "month" : "year"}
            </span>
          </span>

          <div className="flex gap-2 rounded-lg bg-muted p-1">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`rounded px-3 py-1 font-medium transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-white text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annually")}
              className={`relative rounded px-3 py-1 font-medium transition-colors ${
                billingPeriod === "annually"
                  ? "bg-white text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annually
              {billingPeriod === "annually" && (
                <span className="absolute -right-2 -top-2 rounded bg-yellow-400 px-2 py-0.5 text-xs font-bold text-black">
                  Save 10%
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
