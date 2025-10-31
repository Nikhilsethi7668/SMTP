import { CampaignsLayout } from "@/components/CampaignsLayout";
import { Header } from "@/components/Header";
import { SideBar } from "@/components/SideBar";
import React from "react";

// Main Dashboard component
export const Campaigns = () => {
  // State to control the sidebar's collapsed status
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen w-screen flex-col">
      <Header onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      <div className="flex flex-1 overflow-hidden">
        <SideBar collapsed={isSidebarCollapsed} />

        <div className="flex-1 overflow-auto p-6">
          <CampaignsLayout />
        </div>
      </div>
    </div>
  );
};
