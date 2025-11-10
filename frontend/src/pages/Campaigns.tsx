
import { CampaignsLayout } from "@/components/CampaignsLayout";
import { Header } from "@/components/Header";
import { SideBar } from "@/components/SideBar";
import React from "react";

// Main Dashboard component
export const Campaigns = () => {
  return (
    <DashboardLayout>
      <CampaignsLayout />
    </DashboardLayout>
  );
};
