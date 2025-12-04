import React, { useEffect, useState } from "react";
import { EmailLeadsTable } from "./EmailLeadsTable";
import api from "@/axiosInstance";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import CsvUploader from "./CsvUploader";
import { toast } from "sonner";

interface LeadEmail {
  _id: string;
  email: string;
  provider: "Google" | "Microsoft" | "Other";
  securityGateway: string;
  status: "Not yet contacted" | "Contacted" | "Bounced" | "Replied";
}

export const CampaignLeads = ({
  campaignId,
  campaignName,
}: {
  campaignId: string;
  campaignName: string;
}) => {
  const [leadsData, setLeadsData] = useState<LeadEmail[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [provider, setProvider] = useState<LeadEmail["provider"]>("Google");
  const [verifyEmail, setVerifyEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGetData = async () => {
  try {
    const response = await api.get("/leads", {
      params: {
        campaign: campaignId   
      }
    });

    if (response.data.success) {
      setLeadsData(response.data.data);
    }
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
};


  useEffect(() => {
    handleGetData();
  }, []);

  const isValidEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const handleAddLead = async () => {
    if (!email) return;

    if (verifyEmail && !isValidEmail(email)) {
      alert("Invalid email format!");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/leads", {
        email,
        campaign: campaignId,
        securityGateway: "None",
        status: "Not yet contacted",
      });

      if (response.data.success) {
        setLeadsData((prev) => [...prev, response.data.data]);
        setShowDialog(false);
        setEmail("");
        setProvider("Google");
        setVerifyEmail(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add lead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6">
      {leadsData.length <= 0 && (
        <div className="flex justify-end gap-4">
          <Button onClick={() => setShowDialog(true)}>+ Add Leads</Button>
          <CsvUploader campaignId={campaignId} onSuccess={() => handleGetData()} />
        </div>
      )}

      {leadsData.length > 0 ? (
        <EmailLeadsTable
          onAddLead={() => setShowDialog(true)}
          refetchData={handleGetData}
          data={leadsData}
          campaignId={campaignId}
        />
      ) : (
        <p>No Leads added yet</p>
      )}

      {/* Add Lead Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>

          <div className="mt-2 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleAddLead} disabled={loading}>
              {loading ? "Adding..." : "Add Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
