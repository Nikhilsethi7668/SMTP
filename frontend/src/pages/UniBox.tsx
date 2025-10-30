import React from "react";
import { CampaignsLayout } from "@/components/CampaignsLayout";
import { Header } from "@/components/Header";
import { SideBar } from "@/components/SideBar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Inbox, Mail, Clock, FileText, Search } from "lucide-react";
import api from "@/axiosInstance";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

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
  const [showUnread, setShowUnread] = React.useState(false);
  const [selectedEmail, setSelectedEmail] = React.useState<IncomingEmail | null>(null);
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
          // Fetch all emails
          const response = await api.get(`/incoming-emails?showUnread=${showUnread}&${selectedCampaign==="All Campaigns" ? '' : `campaign=${selectedCampaign}`}`);
          if (response.data.success) {
            setIncomingEmails(response.data.data);
          }
      } catch (error) {
        console.error("Error fetching incoming emails:", error);
        setIncomingEmails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomingEmails();
  }, [selectedCampaign, campaigns, showUnread]);

  // Reset selected email when list changes
  React.useEffect(() => {
    if (incomingEmails.length > 0) {
      setSelectedEmail(incomingEmails[0]);
    } else {
      setSelectedEmail(null);
    }
  }, [incomingEmails]);

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
                  onClick={() => setSelectedCampaign(campaign._id)}
                  className={cn(
                    "w-full text-left px-4 py-2 hover:bg-gray-100 transition",
                    selectedCampaign === campaign._id &&
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

<div className="flex items-center justify-between gap-2">
<p>Unread</p><Switch defaultChecked={false} onCheckedChange={(checked) => setShowUnread(checked as boolean)} />

</div>
            </div>
          </aside>
          {/* left column second */}
        <aside className="w-64 border-r bg-white rounded-lg shadow-sm flex flex-col">
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-3">
        {/* Tabs */}
        <div className="flex pb-2 border-b mb-3 gap-3">
          <Button
          size="sm"
          variant={activeTab === "primary" ? "default" : "outline"}
            onClick={() => setActiveTab("primary")}
          >
            Primary
          </Button>
          <Button
          size="sm"
          variant={activeTab === "others" ? "default" : "outline"}
            onClick={() => setActiveTab("others")}
          >
            Others
          </Button>
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
            {incomingEmails.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-400">No emails</div>
            ) : (
              incomingEmails.map((email) => (
                <div
                  key={email._id}
                  onClick={() => setSelectedEmail(email)}
                  className={cn(
                    "relative pl-3 py-2 cursor-pointer border-l-2 transition",
                    selectedEmail?._id === email._id
                      ? "border-blue-600 bg-blue-50/40"
                      : "border-transparent hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <input type="checkbox" className="accent-blue-600" />
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {email.from}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                      {new Date(email.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm font-medium mt-1 truncate">{email.subject}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{email.body}</p>
                </div>
              ))
            )}
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
                        No email found
                      </h2>
                      <p className="text-sm text-gray-500">
                        Select a email to view its details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4">
                {!selectedEmail ? (
                  <div className="text-center text-sm text-gray-400">Select an email to view details</div>
                ) : (
                  <div className="max-w-4xl mx-auto space-y-3">
                    <Card className="transition-shadow">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-sm">From: {selectedEmail.from}</div>
                            <div className="text-sm text-gray-600">To: {selectedEmail.to}</div>
                          </div>
                          <div className="text-xs text-gray-400 whitespace-nowrap">
                            {new Date(selectedEmail.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="font-medium text-base">{selectedEmail.subject}</div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                          {selectedEmail.body}
                        </div>
                        <div className="pt-2">
                          <span className={cn(
                            "text-xs px-2 py-1 rounded",
                            selectedEmail.status === "received" && "bg-green-100 text-green-800",
                            selectedEmail.status === "processed" && "bg-blue-100 text-blue-800",
                            selectedEmail.status === "failed" && "bg-red-100 text-red-800"
                          )}>
                            {selectedEmail.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Unibox;