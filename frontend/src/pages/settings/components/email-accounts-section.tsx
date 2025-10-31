import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { useState } from "react";

export function EmailAccountsSection() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Get Passwords */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Email accounts & Domains</h3>
          <Button variant="default">Get passwords</Button>
        </div>
        <div className="mb-6 flex gap-3 rounded-lg border border-primary/20 bg-primary/10 p-4">
          <Info className="h-4 w-4 text-primary" />
          <p className="text-sm text-primary">
            Updating the default password will cause auto-reconnect to not work
          </p>
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
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Your domain purchases will appear here</p>
        </div>
      </div>
    </div>
  );
}
