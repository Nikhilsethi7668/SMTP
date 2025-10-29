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

export const CampaignDetails = () => {
    const campaigns = 
      {
        _id: "68fe46721bc24c007cda8e59",
        name: "Welcome Series",
        status: "running" as "running" | "draft" | "paused" | "completed",
        metrics_sent: 2000,
        metrics_delivered: 1800,
        metrics_opened: 900,
        metrics_clicked: 400,
        metrics_bounced: 50,
        metrics_complaints: 10,
        updatedAt: "2025-10-26T16:05:45.103Z",
      };
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
    { key: "schedules", label: "Schedules"},
    { key: "options", label: "Options" }
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
  })
  const handleGetAnalyticsData = async (id) => {
    try {
        const response = await api.get(`campaigns/${id}`);
        if(response.data.success){
            console.log(response)
            setCampaignDetails(response.data.data)
        }
    } catch (error) {
        console.log(error)
    }
  }
  const renderTabContent = () => {
    switch (activeTab) {
      case "analytics":
        return <CampaignAnalytics campaign={CampaignDetails || {
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
  }} onPause={()=> console.log("pause")} onResume={()=> console.log("RESUME")}  />;
      case "leads":
        return <CampaignLeads campaignId={prefilledCampaignId} campaignName={prefilledCampaignName} />;
      case "sequences":
        return <CampaignSequences />;
      case "schedules":
        return <ScheduleManager/>
      case "options":
        return <CampaignSettings/>
      default:
        return null;
    }
  };

useEffect(() => {
  if(prefilledCampaignId){
    handleGetAnalyticsData(prefilledCampaignId);
  }
}, [prefilledCampaignId])


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AppHeader onClickAction={() => navigate(-1)} headings={prefilledCampaignName} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SideBar collapsed={isSidebarCollapsed} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col p-6">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
            <div className="flex gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-2 text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? "text-black-600 border-b-2 border-black-600"
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
              onClick={() => setIsCampaignPause(!isCampaignPause)}
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
