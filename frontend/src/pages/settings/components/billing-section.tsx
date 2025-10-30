import { Button } from "@/components/ui/button"
import { PlanCard } from "./plan-card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

type BillingTab = "email-outreach" | "instantly-credits"

const PLANS_DATA = {
  "email-outreach": {
    name: "Growth",
    icon: "⚡",
    price: 37,
    period: "month",
    currentUsage: { used: 6, total: 1000, label: "Uploaded Contacts" },
    billingInfo: "Billed Monthly",
    renewDate: "Renews Nov 25, 2025",
    features: [
      "150 Instantly credits monthly",
      "Database of 450M+ B2B Leads",
      "13 Filters including keywords",
      "Waterfall Work Email Enrichment",
      "Instantly Web Researcher Agent",
      "Access to 5 Major LLMs",
      "AI Email Writer Agent",
      "Use your own LLM API key",
      "100+ Community AI Templates",
      "Full profile enrichment",
      "Job posting, News, Technology enrichment",
      "Export to major CRMs",
    ],
  },
  "instantly-credits": {
    name: "Nano Credits",
    icon: "⚡",
    price: 9,
    period: "month",
    currentUsage: { used: 200, total: 100, label: "Credits Remaining" },
    billingInfo: "Billed Monthly",
    renewDate: "Renews Nov 25, 2025",
    features: [
      "150 Instantly credits monthly",
      "Database of 450M+ B2B Leads",
      "13 Filters including keywords",
      "Waterfall Work Email Enrichment",
      "Instantly Web Researcher Agent",
      "Access to 5 Major LLMs",
      "AI Email Writer Agent",
      "Use your own LLM API key",
      "100+ Community AI Templates",
      "Full profile enrichment",
      "Job posting, News, Technology enrichment",
      "Export to major CRMs",
    ],
  },
}

export function BillingSection() {
  return (
    <Tabs defaultValue="email-outreach" className="space-y-8">
      {/* Tab Navigation */}
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="email-outreach">Email Outreach</TabsTrigger>
        <TabsTrigger value="instantly-credits">Instantly Credits</TabsTrigger>
      </TabsList>

      {/* Email Outreach Tab Content */}
      <TabsContent value="email-outreach" className="space-y-8">
        <BillingTabContent planKey="email-outreach" />
      </TabsContent>

      {/* Instantly Credits Tab Content */}
      <TabsContent value="instantly-credits" className="space-y-8">
        <BillingTabContent planKey="instantly-credits" />
      </TabsContent>
    </Tabs>
  )
}

function BillingTabContent({ planKey }: { planKey: BillingTab }) {
  const currentPlan = PLANS_DATA[planKey]

  return (
    <>
      {/* Current Plan Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Current Plan</h3>

        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{currentPlan.icon}</div>
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="text-2xl font-bold text-foreground">{currentPlan.name}</p>
              <p className="text-lg font-semibold text-foreground mt-1">
                ${currentPlan.price}
                <span className="text-sm text-muted-foreground">/{currentPlan.period}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{currentPlan.currentUsage.label}</p>
            <p className="text-2xl font-bold text-foreground">
              {currentPlan.currentUsage.used} / {currentPlan.currentUsage.total}
            </p>
            <p className="text-xs text-muted-foreground mt-2">{currentPlan.billingInfo}</p>
            <p className="text-xs text-muted-foreground">{currentPlan.renewDate}</p>
          </div>
        </div>

        {/* Usage Bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div
            className="bg-primary h-2 rounded-full"
            style={{
              width: `${Math.min((currentPlan.currentUsage.used / currentPlan.currentUsage.total) * 100, 100)}%`,
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="default" className="justify-start text-left px-4 py-3 rounded-lg font-medium">
            Upgrade to annual
            <span className="ml-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded font-semibold">Save 20%</span>
          </Button>
        </div>
      </div>

      {/* Increase Plan Limits */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Increase outreach plan limits</h3>
        <Progress
          value={30}
          className="w-full h-2 bg-muted rounded-lg"
        />
        <p className="text-sm text-muted-foreground mt-2">You have 30% of your monthly credits remaining</p>
      </div>

      {/* Plan Card */}
      <PlanCard plan={currentPlan} />
    </>
  )
}
