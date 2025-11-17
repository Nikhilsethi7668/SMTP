import api from "@/axiosInstance";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const CreateCampaignForm: React.FC = () => {
  const navigate = useNavigate();
  const [campaignName, setCampaignName] = useState<string>("");

  const handleContinue = async () => {
    try {
      const response = await api.post("/campaigns", { name: campaignName });
      if (response.data.success) {
        toast.success(`Campaign Created: ${campaignName}`);
        navigate(
          `/dashboard/campaigns/details?campaignName=${encodeURIComponent(campaignName)}`
        ); // Navigate to campaign details page;
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const handleCancel = () => {
    setCampaignName("");
    navigate(-1);
  };

  return (
    <div className="flex h-screen w-screen flex-col">
      <AppHeader onClickAction={() => navigate(-1)} headings={"Back"} />
      <div className="mx-auto mt-16 max-w-md rounded-lg bg-white p-6">
        {/* Heading */}
        <h1 className="mb-1 text-2xl font-semibold text-gray-800">
          Let&apos;s create a new campaign
        </h1>
        <p className="mb-6 text-gray-500">What would you like to name it?</p>

        {/* Input */}
        <div className="mb-6">
          <label className="mb-2 block text-gray-700">Campaign Name</label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="My Campaign"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primaryColor"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button onClick={handleCancel} className="text-primary hover:underline">
            Cancel
          </button>
          <Button
            onClick={handleContinue}
            className="rounded-lg bg-gradient-primary px-6 py-3 text-white hover:bg-transparent"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};
