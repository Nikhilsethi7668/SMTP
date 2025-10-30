import { useState } from "react"
import { BillingSection } from "./billing-section"
import { PaymentSection } from "./payment-section"
import { InvoicesSection } from "./invoices-section"
import { EmailAccountsSection } from "./email-accounts-section"
import { Button } from "@/components/ui/button"

type BillingSubTab = "billing" | "payment" | "invoices" | "email"

export function BillingUsage() {
  const [activeSubTab, setActiveSubTab] = useState<BillingSubTab>("billing")

  const subTabs: { id: BillingSubTab; label: string }[] = [
    { id: "billing", label: "Billing" },
    { id: "payment", label: "Payment & Invoices" },
    { id: "email", label: "Email accounts & Domains" },
  ]

  return (
    <div className="space-y-6">
      {/* Left sidebar with sub-navigation */}
      <div className="flex gap-8">
        <div className="w-48 space-y-2">
          {subTabs.map((tab) => (
            <Button
              variant={activeSubTab === tab.id ? "default" : "ghost"}
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`w-full text-left px-3 py-3 justify-start rounded-lg font-medium transition-colors`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1">
          {activeSubTab === "billing" && <BillingSection />}
          {activeSubTab === "payment" && <PaymentSection />}
          {activeSubTab === "invoices" && <InvoicesSection />}
          {activeSubTab === "email" && <EmailAccountsSection />}
        </div>
      </div>
    </div>
  )
}
