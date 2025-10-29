
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface PlanCardProps {
  plan: {
    name: string
    icon: string
    price: number
    period: string
    features: string[]
  }
}

export function PlanCard({ plan }: PlanCardProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly")

  const annualPrice = Math.floor(plan.price * 12 * 0.9) // 10% discount for annual

  return (
    <div className="bg-card border border-border rounded-lg p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="text-4xl">{plan.icon}</div>
        <div>
          <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
          <p className="text-muted-foreground">Includes</p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="text-green-500 text-lg mt-0.5">✓</span>
            <span className="text-foreground">{feature}</span>
          </div>
        ))}
      </div>

      {/* Pricing and Action */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button variant="default">
          Update Plan
        </Button>

        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-foreground">
            ${billingPeriod === "monthly" ? plan.price : annualPrice}
            <span className="text-sm text-muted-foreground">/{billingPeriod === "monthly" ? "month" : "year"}</span>
          </span>

          <div className="flex gap-2 bg-muted rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                billingPeriod === "monthly" ? "bg-white text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annually")}
              className={`px-3 py-1 rounded font-medium transition-colors relative ${
                billingPeriod === "annually"
                  ? "bg-white text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annually
              {billingPeriod === "annually" && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded font-bold">
                  Save 10%
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
