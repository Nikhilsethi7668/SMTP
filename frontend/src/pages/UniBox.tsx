import React from "react";
import { CampaignsLayout } from "@/components/CampaignsLayout";
import { Header } from "@/components/Header";
import { SideBar } from "@/components/SideBar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Inbox, Mail, Clock, FileText } from "lucide-react";

// Mock Campaign Data
const campaigns = [
  { id: "1", name: "My Campaign" },
  { id: "2", name: "Vivek campaign" },
  { id: "3", name: "Testing" },
];

const Unibox: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [selectedCampaign, setSelectedCampaign] = React.useState("All Campaigns");

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Header */}
      <Header onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SideBar collapsed={isSidebarCollapsed} />

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6 flex">
          {/* Left Column (Campaign list + More) */}
          <aside className="w-64 border-r bg-white rounded-lg shadow-sm flex flex-col">
            <div className="p-4 font-semibold text-lg border-b">
              All Campaigns
            </div>

            {/* Campaign List */}
            <div className="flex-1 overflow-y-auto">
              {campaigns.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCampaign(c.name)}
                  className={cn(
                    "w-full text-left px-4 py-2 hover:bg-gray-100 transition",
                    selectedCampaign === c.name &&
                      "bg-blue-50 text-blue-600 font-medium"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* More Section */}
            <div className="border-t p-3 space-y-1">
              <div className="text-sm font-medium text-gray-500 mb-1">More</div>

              <button
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md transition",
                  selectedCampaign === "Inbox" &&
                    "bg-blue-50 text-blue-600 font-medium"
                )}
                onClick={() => setSelectedCampaign("Inbox")}
              >
                <Inbox className="h-4 w-4" /> Inbox
              </button>

              <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md transition">
                <Mail className="h-4 w-4" /> Unread only
              </button>

              <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md transition">
                <Clock className="h-4 w-4" /> Reminders only
              </button>

              <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md transition">
                <FileText className="h-4 w-4" /> Scheduled emails
              </button>
            </div>
          </aside>

          {/* Right Column (Content View) */}
          <main className="flex-1 flex flex-col items-center justify-center">
            <Card className="max-w-md w-full bg-gray-50 shadow-none border-none text-center">
              <CardContent>
                <div className="flex flex-col items-center">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/748/748074.png"
                    alt="Empty"
                    className="w-32 h-32 opacity-40 mb-4"
                  />
                  <h2 className="text-lg font-semibold mb-1">
                    No emails found
                  </h2>
                  <button className="text-sm text-gray-500 border px-4 py-1 rounded-md mt-2 hover:bg-gray-100">
                    Load more
                  </button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Unibox;