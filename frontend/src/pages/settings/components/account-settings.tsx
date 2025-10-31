import { Button } from "@/components/ui/button";
import { useState } from "react";

type AccountTab = "profile" | "lead-labels" | "agency" | "audit-logs";

export function AccountSettings() {
  const [activeTab, setActiveTab] = useState<AccountTab>("profile");

  const tabs: { id: AccountTab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "lead-labels", label: "Lead Labels" },
    { id: "agency", label: "Agency" },
    { id: "audit-logs", label: "Audit Logs" },
  ];

  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <nav className="space-y-2">
          {tabs.map((tab) => (
            <Button
              variant={activeTab === tab.id ? "default" : "ghost"}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full justify-start rounded-lg px-4 py-3 text-left font-medium transition-colors`}
            >
              {tab.label}
            </Button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTab === "profile" && <ProfileSection />}
        {activeTab === "lead-labels" && <LeadLabelsSection />}
        {activeTab === "agency" && <AgencySection />}
        {activeTab === "audit-logs" && <AuditLogsSection />}
      </div>
    </div>
  );
}

function ProfileSection() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-6 text-lg font-semibold text-foreground">Name</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">First</label>
            <input
              type="text"
              defaultValue="Nikhil"
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Last</label>
            <input
              type="text"
              defaultValue="Sethi"
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-6 text-lg font-semibold text-foreground">Email</h3>
        <input
          type="email"
          defaultValue="nikhilsethin494@gmail.com"
          className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Password</h3>
          <Button variant="outline">Update Password</Button>
        </div>
        <input
          type="password"
          defaultValue="••••••"
          disabled
          className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-foreground"
        />
      </div>
    </div>
  );
}

function LeadLabelsSection() {
  return (
    <div className="rounded-lg border border-border bg-card p-12 text-center">
      <div className="mb-6">
        <svg
          className="mx-auto h-32 w-32 text-muted-foreground opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.5a2 2 0 00-1 .268m-5 8h5m0 0H9m3 0h3"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">Lead Statuses</h3>
      <p className="mb-6 text-muted-foreground">No custom labels found</p>
      <Button variant="outline">+ Create New</Button>
    </div>
  );
}

function AgencySection() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              Domain
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </h3>
          </div>
          <Button variant="outline">Save</Button>
        </div>
        <input
          type="text"
          defaultValue="agency.mywebsite.com"
          className="mb-4 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground">
          Show setup guide
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">Logo</h3>
        <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
          <svg
            className="mx-auto mb-3 h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <p className="mb-1 font-medium text-foreground">Add a logo to your workspace</p>
          <button className="mx-auto mt-4 flex items-center gap-2 rounded-lg bg-muted px-4 py-2 font-medium text-foreground transition-colors hover:bg-muted/80">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Upload file
          </button>
        </div>
      </div>
    </div>
  );
}

function AuditLogsSection() {
  const logs = [
    {
      timestamp: "2025-10-29 23:46:53",
      type: "Login",
      ip: "106.219.173.245",
      campaignId: "-",
      listId: "-",
    },
    {
      timestamp: "2025-10-29 19:56:52",
      type: "Login",
      ip: "106.219.171.25",
      campaignId: "-",
      listId: "-",
    },
    {
      timestamp: "2025-10-29 18:42:53",
      type: "Login",
      ip: "203.192.255.46",
      campaignId: "-",
      listId: "-",
    },
    {
      timestamp: "2025-10-29 01:49:04",
      type: "Login",
      ip: "203.192.255.46",
      campaignId: "-",
      listId: "-",
    },
    {
      timestamp: "2025-10-28 21:34:09",
      type: "Login",
      ip: "106.219.174.14",
      campaignId: "-",
      listId: "-",
    },
    {
      timestamp: "2025-10-28 20:07:03",
      type: "Account delete",
      ip: "106.219.174.14",
      campaignId: "-",
      listId: "-",
    },
    {
      timestamp: "2025-10-28 20:02:11",
      type: "Login",
      ip: "106.219.174.14",
      campaignId: "-",
      listId: "-",
    },
    {
      timestamp: "2025-10-28 19:19:17",
      type: "Login",
      ip: "157.49.63.10",
      campaignId: "-",
      listId: "-",
    },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Audit Logs</h3>
        <div className="flex items-center gap-4">
          <select className="rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All activity types</option>
            <option>Login</option>
            <option>Account delete</option>
          </select>
          <button className="flex items-center gap-2 font-medium text-foreground hover:text-blue-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                TIMESTAMP
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                ACTIVITY TYPE
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                IP ADDRESS
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                CAMPAIGN ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                LIST ID
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx} className="border-b border-border transition-colors hover:bg-muted/50">
                <td className="px-4 py-3 text-sm text-foreground">{log.timestamp}</td>
                <td className="px-4 py-3 text-sm text-foreground">{log.type}</td>
                <td className="px-4 py-3 text-sm text-foreground">{log.ip}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{log.campaignId}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{log.listId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing 25 logs</span>
        <div className="flex gap-2">
          <button className="rounded border border-border px-3 py-1 transition-colors hover:bg-muted">
            ←
          </button>
          <button className="rounded border border-border px-3 py-1 transition-colors hover:bg-muted">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
