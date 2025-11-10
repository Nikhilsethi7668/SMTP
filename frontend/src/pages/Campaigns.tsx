import { CampaignsLayout } from '@/components/CampaignsLayout';
import { DashboardLayout } from '@/components/DashboardLayout';
import React from 'react';

// Main Dashboard component
export const Campaigns = () => {
  return (
    <DashboardLayout>
      <CampaignsLayout />
    </DashboardLayout>
  );
};

