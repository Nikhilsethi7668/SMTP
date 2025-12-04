import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import api from "@/axiosInstance";
import { toast } from "sonner";
import { campaignApi } from "@/services/campaignApi";

export default function CampaignSettings({ campaignId }: { campaignId: string }) {
  /* -------------------------------
        STATE
  ------------------------------- */
  const [stopOnReply, setStopOnReply] = useState(false);
  const [openTracking, setOpenTracking] = useState(false);
  const [sendTextOnly, setSendTextOnly] = useState(false);
  const [firstEmailTextOnly, setFirstEmailTextOnly] = useState(false);
  const [dailyLimit, setDailyLimit] = useState<string>("30");
  const [fromEmail, setFromEmail] = useState<string[]>([]);

  const [emailsData, setEmailsData] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /* -------------------------------
        LOAD CAMPAIGN SETTINGS
  ------------------------------- */
  const loadCampaignSettings = async () => {
    try {
      const res = await campaignApi.getCampaignById(campaignId);
      if (res.success && res.campaign) {
        const c = res.campaign;

        setStopOnReply(c.stop_on_reply || false);
        setOpenTracking(c.open_tracking || false);
        setSendTextOnly(c.send_text_only || false);
        setFirstEmailTextOnly(c.first_email_text_only || false);
        setDailyLimit(c.daily_limit?.toString() || "30");
        setFromEmail(c.from_email || []);
      }
    } catch (error: any) {
      toast.error("Failed to load campaign settings");
    }
  };

  useEffect(() => {
    loadCampaignSettings();
  }, [campaignId]);

  /* -------------------------------
        LOAD EMAIL ACCOUNTS
  ------------------------------- */
  const extractDomainProviderEmails = (accounts: any[]): string[] => {
    return accounts
      .filter((acc) => acc.provider === "domain")
      .map((acc) => acc.email)
      .filter((email) => !!email);
  };

  const handleGetEmailAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/accounts");
      if (res.data.success) {
        const emails = extractDomainProviderEmails(res.data.data);
        setEmailsData(emails);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------
        SAVE SETTINGS
  ------------------------------- */
  const saveSettings = async () => {
    try {
      const payload = {
        stop_on_reply: stopOnReply,
        open_tracking: openTracking,
        send_text_only: sendTextOnly,
        first_email_text_only: firstEmailTextOnly,
        daily_limit: Number(dailyLimit),
        from_email: fromEmail, // ARRAY
      };

      await campaignApi.updateCampaignSettings(campaignId, payload);

      toast.success("Campaign settings updated");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update settings");
    }
  };

  /* -------------------------------
        UI COMPONENT
  ------------------------------- */
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* -------------------- From Emails (Selected Accounts) -------------------- */}
<div className="rounded-xl border bg-white p-6 shadow-sm">
  <Label className="text-base font-medium">From Emails (Selected)</Label>
  <p className="mb-3 text-sm text-slate-500">
    These emails will be used as sender identities for this campaign.
  </p>

  {/* Show selected emails */}
  <div className="flex flex-wrap gap-2 mb-3">
    {fromEmail.length === 0 && (
      <p className="text-sm text-slate-400">No emails selected yet</p>
    )}

    {fromEmail.map((email) => (
      <div
        key={email}
        className="flex items-center gap-2 bg-slate-100 border rounded-lg px-3 py-1"
      >
        <span className="text-sm">{email}</span>

        <Button
          size="sm"
          variant="ghost"
          className="text-red-600 hover:text-red-700"
          onClick={() =>
            setFromEmail((prev) => prev.filter((item) => item !== email))
          }
        >
          ×
        </Button>
      </div>
    ))}
  </div>

  {/* Add new email
  <Select
    onOpenChange={(open) => open && !emailsData.length && handleGetEmailAccounts()}
    onValueChange={(value) =>
      setFromEmail((prev) => (prev.includes(value) ? prev : [...prev, value]))
    }
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Add email..." />
    </SelectTrigger>

    <SelectContent>
      {emailsData.length === 0 && (
        <div className="px-2 py-1 text-sm text-slate-400">Loading...</div>
      )}

      {emailsData.map((email) => (
        <SelectItem key={email} value={email}>
          {email}
        </SelectItem>
      ))}
    </SelectContent>
  </Select> */}
</div>

      {/* -------------------- Accounts -------------------- */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between">
          <Label className="text-base font-medium">Accounts to use</Label>
          <a
            href="/dashboard/accounts/connect"
            className="text-sm text-blue-600 hover:underline"
          >
            Connect new email account
          </a>
        </div>

        <p className="mb-2 text-sm text-slate-500">
          Select accounts for sending emails (domain provider only)
        </p>

        <Select
          onOpenChange={(open) => open && !emailsData.length && handleGetEmailAccounts()}
          onValueChange={(value) => setFromEmail([value])}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select email account..." />
          </SelectTrigger>

          <SelectContent>
            {emailsData.length === 0 && <p className="p-2 text-sm">Loading...</p>}
            {emailsData.map((email) => (
              <SelectItem key={email} value={email}>
                {email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* -------------------- Stop Sending On Reply -------------------- */}
      <div className="flex items-center justify-between rounded-xl border bg-white p-6 shadow-sm">
        <div>
          <Label className="text-base font-medium">Stop sending emails on reply</Label>
          <p className="text-sm text-slate-500">
            Automatically stop emailing a lead if they reply
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant={!stopOnReply ? "default" : "outline"} onClick={() => setStopOnReply(false)}>
            Disable
          </Button>
          <Button variant={stopOnReply ? "default" : "outline"} onClick={() => setStopOnReply(true)}>
            Enable
          </Button>
        </div>
      </div>

      {/* -------------------- Open Tracking -------------------- */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <Label className="text-base font-medium">Open Tracking</Label>
        <p className="text-sm text-slate-500">Track email opens</p>

        <div className="mt-3 flex gap-2">
          <Button variant={!openTracking ? "default" : "outline"} onClick={() => setOpenTracking(false)}>
            Disable
          </Button>
          <Button variant={openTracking ? "default" : "outline"} onClick={() => setOpenTracking(true)}>
            Enable
          </Button>
        </div>
      </div>

      {/* -------------------- Delivery Optimization -------------------- */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <Label className="flex items-center gap-2 text-base font-medium">
          Delivery Optimization <Badge variant="secondary">Recommended</Badge>
        </Label>

        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={sendTextOnly}
              onCheckedChange={(v) => setSendTextOnly(Boolean(v))}
            />
            <Label className="text-sm">Send emails as text only</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={firstEmailTextOnly}
              onCheckedChange={(v) => setFirstEmailTextOnly(Boolean(v))}
            />
            <Label className="text-sm">Send first email as text only</Label>
            <Badge className="bg-yellow-400 text-black">Pro</Badge>
          </div>
        </div>
      </div>

      {/* -------------------- Daily Limit -------------------- */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <Label className="text-base font-medium">Daily Limit</Label>
        <p className="mb-3 text-sm text-slate-500">
          Max number of emails to send per day
        </p>

        <Input
          type="number"
          value={dailyLimit}
          onChange={(e) => setDailyLimit(e.target.value)}
          className="w-32"
        />
      </div>

      {/* -------------------- Save Button -------------------- */}
      <div className="flex justify-end">
        <Button className="px-8" onClick={saveSettings}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
