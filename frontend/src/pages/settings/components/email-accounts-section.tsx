
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Info } from "lucide-react"
import { useState } from "react"

export function EmailAccountsSection() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      {/* Get Passwords */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">Email accounts & Domains</h3>
          <Button variant="default">Get passwords</Button>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 flex gap-3">
          <Info className="h-4 w-4 text-primary" />
          <p className="text-sm text-primary">Updating the default password will cause auto-reconnect to not work</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Input
            type="text"
            placeholder="Search by domain"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Empty State */}
        <div className="text-center py-12">
          <p className="text-muted-foreground">Your domain purchases will appear here</p>
        </div>
      </div>
    </div>
  )
}
