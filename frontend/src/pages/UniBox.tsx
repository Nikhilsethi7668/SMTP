import React from "react";
import { CampaignsLayout } from "@/components/CampaignsLayout";
import { Header } from "@/components/Header";
import { SideBar } from "@/components/SideBar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Inbox, Mail, Clock, FileText, Search } from "lucide-react";
import api from "@/axiosInstance";

interface Campaign {
  _id: string;
  name: string;
}

interface IncomingEmail {
  _id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  createdAt: string;
  status: string;
}

const Unibox: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [selectedCampaign, setSelectedCampaign] = React.useState<string | null>("All Campaigns");
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [incomingEmails, setIncomingEmails] = React.useState<IncomingEmail[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Fetch campaigns on mount
  React.useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await api.get("/campaigns/names");
        if (response.data.success) {
          setCampaigns(response.data.campaigns);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };
    fetchCampaigns();
  }, []);

  // Fetch inbox emails when campaign is selected
  React.useEffect(() => {
    if (!selectedCampaign) return;

    const fetchIncomingEmails = async () => {
      setLoading(true);
      try {
        if (selectedCampaign === "All Campaigns" || selectedCampaign === "Inbox") {
          // Fetch all emails
          const response = await api.get("/incoming-emails");
          if (response.data.success) {
            setIncomingEmails(response.data.data);
          }
        } else {
          // Fetch emails for specific campaign
          const campaign = campaigns.find(c => c.name === selectedCampaign);
          if (campaign && campaigns.length > 0) {
            const response = await api.get(`/incoming-emails/campaign/${campaign._id}`);
            if (response.data.success) {
              setIncomingEmails(response.data.data);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching incoming emails:", error);
        setIncomingEmails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomingEmails();
  }, [selectedCampaign, campaigns]);

  const [activeTab, setActiveTab] = React.useState<"primary" | "others">("primary");

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
              <button
                onClick={() => setSelectedCampaign("All Campaigns")}
                className={cn(
                  "w-full text-left px-4 py-2 hover:bg-gray-100 transition",
                  selectedCampaign === "All Campaigns" &&
                    "bg-blue-50 text-blue-600 font-medium"
                )}
              >
                All Campaigns
              </button>
              {campaigns.map((campaign) => (
                <button
                  key={campaign._id}
                  onClick={() => setSelectedCampaign(campaign.name)}
                  className={cn(
                    "w-full text-left px-4 py-2 hover:bg-gray-100 transition",
                    selectedCampaign === campaign.name &&
                      "bg-blue-50 text-blue-600 font-medium"
                  )}
                >
                  {campaign.name}
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
          {/* left column second */}
        <aside className="w-64 border-r bg-white rounded-lg shadow-sm flex flex-col">
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-3">
        {/* Tabs */}
        <div className="flex border-b mb-3">
          <button
            onClick={() => setActiveTab("primary")}
            className={`px-3 pb-2 text-sm font-semibold transition-colors ${
              activeTab === "primary"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-600"
            }`}
          >
            Primary
          </button>
          <button
            onClick={() => setActiveTab("others")}
            className={`px-3 pb-2 text-sm font-semibold transition-colors ${
              activeTab === "others"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-600"
            }`}
          >
            Others
          </button>
        </div>

        {/* Search box */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search mail"
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Mail list */}
        {activeTab === "primary" ? (
          <div>
            {/* Primary mails */}
            <div className="relative border-l-2 border-blue-600 pl-3 py-2">
              <div className="grid items-start justify-between">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="accent-blue-600" />
                  <p className="text-sm font-semibold text-gray-800">
                    support@instantly.ai
                  </p>
                </div>
                <span className="text-xs text-gray-400">Oct 29, 2025</span>
              </div>

              <p className="text-sm font-medium mt-1">
                Instantly Demo Email <span>🚀</span>
              </p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                This is a demo email just to show you how incoming replies will
                appear in the Unibox!...
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-gray-400">
            No emails in Others
          </div>
        )}

        {/* Load more */}
        <button className="w-full mt-4 bg-gray-100 text-gray-400 text-sm py-2 rounded-md cursor-not-allowed">
          Load more
        </button>
      </div>
    </aside>

          {/* Right Column (Content View) */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : incomingEmails.length === 0 ? (
              <div className="flex items-center justify-center h-full">
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
                      <p className="text-sm text-gray-500">
                        Select a campaign to view its inbox
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-4xl mx-auto space-y-3">
                  {incomingEmails.map((email) => (
                    <Card key={email._id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{email.from}</div>
                            <div className="text-sm text-gray-600">{email.to}</div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(email.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="font-medium mb-1">{email.subject}</div>
                        <div className="text-sm text-gray-600 line-clamp-2">
                          {email.body}
                        </div>
                        <div className="mt-2">
                          <span className={cn(
                            "text-xs px-2 py-1 rounded",
                            email.status === "received" && "bg-green-100 text-green-800",
                            email.status === "processed" && "bg-blue-100 text-blue-800",
                            email.status === "failed" && "bg-red-100 text-red-800"
                          )}>
                            {email.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Unibox;