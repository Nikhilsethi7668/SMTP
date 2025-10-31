import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Plus } from "lucide-react";

const INTEGRATIONS = [
  {
    name: "Apollo",
    description: "Connect to sync your contacts and manage leads effortlessly.",
    icon: "⚡",
    connected: false,
  },
  {
    name: "Calendly",
    description: "Automate scheduling and notifications with Calendly.",
    icon: "📅",
    connected: false,
  },
];

export function Integrations() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);

  const toggleIntegration = (name: string) => {
    setIntegrations(
      integrations.map((int) => (int.name === name ? { ...int, connected: !int.connected } : int))
    );
  };

  return (
    <div className="space-y-6">
      {/* Sidebar */}
      <div className="flex gap-8">
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-2">
            <Button
              variant="default"
              className="w-full justify-start rounded-lg px-4 py-3 text-left font-medium"
            >
              Integrations
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start rounded-lg px-4 py-3 text-left font-medium text-foreground transition-colors hover:bg-muted"
            >
              Webhooks
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start rounded-lg px-4 py-3 text-left font-medium text-foreground transition-colors hover:bg-muted"
            >
              API Keys
            </Button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="mb-8">
            <h3 className="mb-2 text-2xl font-bold text-foreground">App Integrations</h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="flex flex-col justify-between rounded-lg border border-border p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-3xl">{integration.icon}</span>
                    <h4 className="text-lg font-semibold text-foreground">{integration.name}</h4>
                  </div>
                  <p className="text-muted-foreground">{integration.description}</p>
                </div>

                <div className="flex justify-between gap-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-lg px-4 py-3 text-left font-medium"
                  >
                    Manage
                  </Button>
                  <Button
                    variant="default"
                    className="w-full justify-start rounded-lg px-4 py-3 text-left font-medium"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add New
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
