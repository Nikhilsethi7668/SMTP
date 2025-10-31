import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$49",
      period: "/month",
      features: [
        "50,000 emails/month",
        "1 dedicated IP",
        "5 email accounts",
        "Basic analytics",
        "Email support",
        "Connect 2 domains",
      ],
      button: "Start Free Trial",
      highlight: false,
    },
    {
      name: "Professional",
      price: "$199",
      period: "/month",
      features: [
        "500,000 emails/month",
        "5 dedicated IPs",
        "25 email accounts",
        "Advanced analytics",
        "Priority support",
        "Connect unlimited domains",
        "A/B testing",
        "API access",
        "Custom warmup schedules",
      ],
      button: "Start Free Trial",
      highlight: true,
      tag: "Most Popular",
    },
    {
      name: "Enterprise",
      price: "$999",
      period: "/month",
      features: [
        "Unlimited emails",
        "Unlimited dedicated IPs",
        "Unlimited email accounts",
        "Custom analytics",
        "24/7 phone support",
        "White-label solution",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
      ],
      button: "Contact Sales",
      highlight: false,
    },
  ];

  return (
    <section className="bg-white py-16 text-center">
      <h2 className="mb-2 text-3xl font-bold">Simple, Transparent Pricing</h2>
      <p className="mb-12 text-gray-500">
        Start free for 14 days. No credit card required. Cancel anytime.
      </p>

      <div className="mx-auto flex max-w-5xl flex-col items-stretch justify-center gap-6 md:flex-row">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`flex flex-1 flex-col justify-between rounded-xl border ${
              plan.highlight
                ? "scale-105 border-blue-700 bg-blue-600 text-white shadow-lg"
                : "border-gray-200 bg-white text-gray-800"
            } transition-transform`}
          >
            <CardHeader className="relative">
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-blue-900">
                  MOST POPULAR
                </span>
              )}
              <CardTitle
                className={`mb-1 text-xl font-semibold ${
                  plan.highlight ? "text-white" : "text-gray-900"
                }`}
              >
                {plan.name}
              </CardTitle>
              <p className="text-4xl font-bold">
                {plan.price}
                <span className="text-base font-normal">{plan.period}</span>
              </p>
            </CardHeader>

            <CardContent className="flex flex-col gap-2 px-6 pb-6 text-left">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Check className={`h-4 w-4 ${plan.highlight ? "text-white" : "text-blue-600"}`} />
                  <span className={`text-sm ${plan.highlight ? "text-blue-50" : "text-gray-700"}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </CardContent>

            <div className="px-6 pb-6">
              <Button
                variant={plan.highlight ? "secondary" : "default"}
                className={`w-full font-medium ${
                  plan.highlight
                    ? "bg-white text-blue-700 hover:bg-gray-100"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {plan.button}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
