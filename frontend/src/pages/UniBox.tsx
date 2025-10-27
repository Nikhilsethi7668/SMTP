import React from "react";
import { CampaignsLayout } from "@/components/CampaignsLayout";
import { Header } from "@/components/Header";
import { SideBar } from "@/components/SideBar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Inbox, Mail, Clock, FileText } from "lucide-react";
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