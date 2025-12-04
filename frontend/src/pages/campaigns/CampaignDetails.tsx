import { AppHeader } from "@/components/AppHeader";
import { SideBar } from "@/components/SideBar";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Tab Components
import { Campaign, CampaignAnalytics } from "@/components/CampaignAnalytics";
import { CampaignLeads } from "@/components/CampaignLeads";
import { CampaignSequences } from "@/components/CampaignSequences";
import api from "@/axiosInstance";
import ScheduleManager from "@/components/ScheduleManager";
import CampaignSettings from "@/components/CampaignSettings";
import { toast } from "sonner";
import { campaignApi } from "@/services/campaignApi";

export const CampaignDetails = () => {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const [isCampaignPause, setIsCampaignPause] = useState(false);
  const prefilledCampaignName = query.get("campaignName") || "";
  const prefilledCampaignId = query.get("campaignId") || "";
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // --- Tabs ---
  const tabs = [
    { key: "analytics", label: "Analytics" },
    { key: "leads", label: "Leads" },
    { key: "sequences", label: "Sequences" },
    { key: "schedules", label: "Schedules" },
    { key: "options", label: "Options" },
  ];
  const [activeTab, setActiveTab] = useState("analytics");
  const [CampaignDetails, setCampaignDetails] = useState<Campaign>({
    _id: "",
    name: prefilledCampaignName,
    status: "draft",
    metrics_sent: 0,
    metrics_delivered: 0,
    metrics_opened: 0,
    metrics_clicked: 0,
    metrics_bounced: 0,
    metrics_complaints: 0,
    updatedAt: new Date().toISOString(),
  });
  const handleGetAnalyticsData = async (id: string) => {
    try {
      const response = await api.get(`campaigns/${id}`);
      if (response.data.success) {
        setCampaignDetails(response.data.data);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
  const updateCampaignStatus = async () => {
  if (!prefilledCampaignId) return;

  try {
    const newStatus = isCampaignPause ? "running" : "paused";

    const res = await campaignApi.updateCampaignStatus(prefilledCampaignId, newStatus);

    if (res.success) {
      setIsCampaignPause(!isCampaignPause);

      setCampaignDetails((prev) => ({
        ...prev,
        status: newStatus,
      }));

      toast.success(`Campaign ${newStatus === "paused" ? "paused" : "resumed"} successfully`);
    }
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Failed to update status");
  }
};

  const renderTabContent = () => {
    switch (activeTab) {
      case "analytics":
        return (
          <CampaignAnalytics
            campaign={
              CampaignDetails || {
                _id: "",
                name: prefilledCampaignName,
                status: "draft",
                metrics_sent: 0,
                metrics_delivered: 0,
                metrics_opened: 0,
                metrics_clicked: 0,
                metrics_bounced: 0,
                metrics_complaints: 0,
                updatedAt: new Date().toISOString(),
              }
            }
            onPause={() => console.log("pause")}
            onResume={() => console.log("RESUME")}
          />
        );
      case "leads":
        return (
          <CampaignLeads campaignId={prefilledCampaignId} campaignName={prefilledCampaignName} />
        );
      case "sequences":
        return <CampaignSequences campaignId={prefilledCampaignId} />;
      case "schedules":
        return <ScheduleManager campaignId={prefilledCampaignId} />;
      case "options":
        return <CampaignSettings campaignId={prefilledCampaignId} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (prefilledCampaignId) {
      handleGetAnalyticsData(prefilledCampaignId);
    }
  }, [prefilledCampaignId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AppHeader onClickAction={() => navigate(-1)} headings={prefilledCampaignName} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SideBar collapsed={isSidebarCollapsed} />

        {/* Main Content */}
        <div className="flex flex-1 flex-col p-6">
          {/* Tabs */}
          <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-2">
            <div className="flex gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-2 text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? "text-black-600 border-black-600 border-b-2"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Pause/Play Button */}
           <Button
  variant="outline"
  onClick={updateCampaignStatus}
  className="flex items-center gap-2"
>
  {isCampaignPause ? (
    <>
      <Play className="h-4 w-4" /> Resume
    </>
  ) : (
    <>
      <Pause className="h-4 w-4" /> Pause
    </>
  )}
</Button>

          </div>

          {/* Tab Content */}
          <div className="flex-1">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};
