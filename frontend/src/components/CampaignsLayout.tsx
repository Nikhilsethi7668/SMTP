import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Dropdown } from "./Dropdown";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Campaign, CampaignTable } from "./Campaigntable";
import api from "@/axiosInstance";
import { toast } from "sonner";
export const CampaignsLayout: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [search, setSearch] = useState<string>("");
  const [type, setType] = useState<string>("All Types");
  const [status, setStatus] = useState<string>("All Status");
  const [campaignsData, setCampaignsData] = useState([]);
  const [open, setOpen] = useState(false);

  const handleGetData = async () => {
    try {
      const response = await api.get("/campaigns");
      if (response.data.success) {
        setCampaignsData(response.data.campaigns);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error as string)
    }
  };
  useEffect(() => {
    handleGetData();
  }, []);

  const handleAction = (val: string, campaign: any) => {
    switch (val) {
      case "edit":
        console.log("edit called", campaign);
        setSelectedCampaign(campaign); 
        setOpen(true); 
        break;

      default:
        break;
    }
  };
  const handleSave = () => {
    console.log("Saving changes for:", selectedCampaign);
    setOpen(false);
  };
  return (
    <div>
      {/* Header */}
      <div className="text-2xl font-bold mb-4 border-b pb-2">
        <p>Campaigns</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        {/* Search Bar */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search campaigns..."
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primaryColor w-full md:w-64"
        />

        {/* Actions */}
        <div className="flex gap-4 items-center">
          {/* Import & Add New */}
          <div className="flex gap-4 md:gap-6 items-center">
            <Button
              onClick={() => navigate("/app/dashboard/campaigns/create")}
              className="bg-gradient-primary text-white"
            >
              + Add New
            </Button>
          </div>
        </div>
      </div>

      {/* Campaigns Table Placeholder */}
      <div className="p-4 text-center text-gray-500 rounded">
        {campaignsData.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Campaign Overview</CardTitle>
              <CardDescription>
                Manage and monitor all your email campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CampaignTable
                onAction={handleAction}
                campaigns={campaignsData.filter((c: any) =>
                  c.name.toLowerCase().includes(search.toLowerCase())
                )}
              />
            </CardContent>
          </Card>
        ) : (
          <p>No campaigns created yet</p>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>
              You are editing: <strong>{selectedCampaign?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          {/* Example Form Inputs */}
          <div className="space-y-4 mt-4">
            <label className="flex flex-col">
              <span className="text-sm font-medium">Campaign Name</span>
              <input
                type="text"
                className="border rounded-md p-2"
                value={selectedCampaign?.name || ""}
                onChange={(e) =>
                  setSelectedCampaign({
                    ...selectedCampaign,
                    name: e.target.value,
                  })
                }
              />
            </label>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
