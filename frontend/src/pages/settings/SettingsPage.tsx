import { useState } from "react";
import { BillingUsage } from "./components/billing-usage";
import { AccountSettings } from "./components/account-settings";
import { Preferences } from "./components/preferences";
import { Integrations } from "./components/integrations";
import { SideBar } from "@/components/SideBar";
import { Header } from "@/components/Header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function SettingsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen flex-col">
      {/* Header component with a toggle function */}
      <Header onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      {/* Main content area: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        <SideBar collapsed={isSidebarCollapsed} />

        <div className="flex-1 overflow-auto p-6">
          <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-7xl px-4 py-8">
              {/* Header */}
              <div className="mb-8">
                <h1 className="mb-2 text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">
                  Manage your account, billing, and preferences
                </p>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="billing" className="w-full">
                <TabsList className="mb-8 grid w-full grid-cols-4">
                  <TabsTrigger value="billing">Billing & Usage</TabsTrigger>
                  <TabsTrigger value="account">Account & Settings</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                  <TabsTrigger value="integrations">Integrations</TabsTrigger>
                </TabsList>

                {/* Content */}
                <TabsContent value="billing">
                  <BillingUsage />
                </TabsContent>
                <TabsContent value="account">
                  <AccountSettings />
                </TabsContent>
                <TabsContent value="preferences">
                  <Preferences />
                </TabsContent>
                <TabsContent value="integrations">
                  <Integrations />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
