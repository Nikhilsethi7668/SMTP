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
        const response = await api.get(
          `/incoming-emails?showUnread=${showUnread}&${selectedCampaign === "All Campaigns" ? "" : `campaign=${selectedCampaign}`}`
        );
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
    <div className="flex h-screen w-screen flex-col">
      {/* Header */}
      <Header onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SideBar collapsed={isSidebarCollapsed} />

        {/* Main Content */}
        <div className="flex flex-1 overflow-auto p-6">
          {/* Left Column (Campaign list + More) */}
          <aside className="flex w-64 flex-col rounded-lg border-r bg-white shadow-sm">
            <div className="border-b p-4 text-lg font-semibold">All Campaigns</div>

            {/* Campaign List */}
            <div className="flex-1 overflow-y-auto">
              <button
                onClick={() => setSelectedCampaign("All Campaigns")}
                className={cn(
                  "w-full px-4 py-2 text-left transition hover:bg-gray-100",
                  selectedCampaign === "All Campaigns" && "bg-blue-50 font-medium text-blue-600"
                )}
              >
                All Campaigns
              </button>
              {campaigns.map((campaign) => (
                <button
                  key={campaign._id}
                  onClick={() => setSelectedCampaign(campaign._id)}
                  className={cn(
                    "w-full px-4 py-2 text-left transition hover:bg-gray-100",
                    selectedCampaign === campaign._id && "bg-blue-50 font-medium text-blue-600"
                  )}
                >
                  {campaign.name}
                </button>
              ))}
            </div>

            {/* More Section */}
            <div className="space-y-1 border-t p-3">
              <div className="mb-1 text-sm font-medium text-gray-500">More</div>

              <div className="flex items-center justify-between gap-2">
                <p>Unread</p>
                <Switch
                  defaultChecked={false}
                  onCheckedChange={(checked) => setShowUnread(checked as boolean)}
                />
              </div>
            </div>
          </aside>
          {/* left column second */}
          <aside className="flex w-64 flex-col rounded-lg border-r bg-white shadow-sm">
            <div className="w-full rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
              {/* Tabs */}
              <div className="mb-3 flex gap-3 border-b pb-2">
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
                  className="w-full rounded-md border py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Mail list */}
              {activeTab === "primary" ? (
                <div>
                  {incomingEmails.length === 0 ? (
                    <div className="py-6 text-center text-sm text-gray-400">No emails</div>
                  ) : (
                    incomingEmails.map((email) => (
                      <div
                        key={email._id}
                        onClick={() => setSelectedEmail(email)}
                        className={cn(
                          "relative cursor-pointer border-l-2 py-2 pl-3 transition",
                          selectedEmail?._id === email._id
                            ? "border-blue-600 bg-blue-50/40"
                            : "border-transparent hover:bg-gray-50"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <input type="checkbox" className="accent-blue-600" />
                            <p className="truncate text-sm font-semibold text-gray-800">
                              {email.from}
                            </p>
                          </div>
                          <span className="flex-shrink-0 whitespace-nowrap text-xs text-gray-400">
                            {new Date(email.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-sm font-medium">{email.subject}</p>
                        <p className="mt-1 line-clamp-1 text-xs text-gray-500">{email.body}</p>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-gray-400">No emails in Others</div>
              )}

              {/* Load more */}
              <button className="mt-4 w-full cursor-not-allowed rounded-md bg-gray-100 py-2 text-sm text-gray-400">
                Load more
              </button>
            </div>
          </aside>

          {/* Right Column (Content View) */}
          <main className="flex flex-1 flex-col overflow-hidden">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : incomingEmails.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <Card className="w-full max-w-md border-none bg-gray-50 text-center shadow-none">
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/748/748074.png"
                        alt="Empty"
                        className="mb-4 h-32 w-32 opacity-40"
                      />
                      <h2 className="mb-1 text-lg font-semibold">No email found</h2>
                      <p className="text-sm text-gray-500">Select a email to view its details</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4">
                {!selectedEmail ? (
                  <div className="text-center text-sm text-gray-400">
                    Select an email to view details
                  </div>
                ) : (
                  <div className="mx-auto max-w-4xl space-y-3">
                    <Card className="transition-shadow">
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm font-semibold">From: {selectedEmail.from}</div>
                            <div className="text-sm text-gray-600">To: {selectedEmail.to}</div>
                          </div>
                          <div className="whitespace-nowrap text-xs text-gray-400">
                            {new Date(selectedEmail.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-base font-medium">{selectedEmail.subject}</div>
                        <div className="whitespace-pre-wrap break-words text-sm text-gray-700">
                          {selectedEmail.body}
                        </div>
                        <div className="pt-2">
                          <span
                            className={cn(
                              "rounded px-2 py-1 text-xs",
                              selectedEmail.status === "received" && "bg-green-100 text-green-800",
                              selectedEmail.status === "processed" && "bg-blue-100 text-blue-800",
                              selectedEmail.status === "failed" && "bg-red-100 text-red-800"
                            )}
                          >
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
