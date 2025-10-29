import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CampaignSettings() {
  const [stopOnReply, setStopOnReply] = useState(true);
  const [openTracking, setOpenTracking] = useState(false);
  const [dailyLimit, setDailyLimit] = useState("30");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Accounts */}
      <div className="border rounded-xl p-6 bg-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
          <Label className="text-base font-medium">Accounts to use</Label>
          <a href="http://localhost:8080/app/dashboard/accounts/connect" className="text-blue-600 text-sm hover:underline">
            Connect new email account
          </a>
        </div>
        <p className="text-sm text-slate-500 mb-2">
          Select one or more accounts to send emails from
        </p>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gmail">Gmail Account</SelectItem>
            <SelectItem value="outlook">Outlook Account</SelectItem>
            <SelectItem value="custom">Custom SMTP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stop sending on reply */}
      <div className="border rounded-xl p-6 bg-white shadow-sm flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">Stop sending emails on reply</Label>
          <p className="text-sm text-slate-500">
            Stop sending emails to a lead if a response has been received
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={!stopOnReply ? "default" : "outline"}
            onClick={() => setStopOnReply(false)}
          >
            Disable
          </Button>
          <Button
            variant={stopOnReply ? "default" : "outline"}
            onClick={() => setStopOnReply(true)}
          >
            Enable
          </Button>
        </div>
      </div>

      {/* Open Tracking */}
      <div className="border rounded-xl p-6 bg-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
          <Label className="text-base font-medium">Open Tracking</Label>
          <div className="flex items-center gap-2">
            <Checkbox id="linkTracking" />
            <Label htmlFor="linkTracking" className="text-sm">
              Link tracking
            </Label>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-3">Track email opens</p>
        <div className="flex gap-2">
          <Button
            variant={!openTracking ? "default" : "outline"}
            onClick={() => setOpenTracking(false)}
          >
            Disable
          </Button>
          <Button
            variant={openTracking ? "default" : "outline"}
            onClick={() => setOpenTracking(true)}
          >
            Enable
          </Button>
        </div>
      </div>

      {/* Delivery Optimization */}
      <div className="border rounded-xl p-6 bg-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
          <Label className="text-base font-medium flex items-center gap-2">
            Delivery Optimization <Badge variant="secondary">Recommended</Badge>
          </Label>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Checkbox id="textOnly" />
              <Label htmlFor="textOnly" className="text-sm">
                Send emails as text-only (no HTML)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="firstOnly" />
              <Label htmlFor="firstOnly" className="text-sm flex items-center gap-1">
                Send first email as text-only
                <Badge className="bg-yellow-400 text-black">Pro</Badge>
              </Label>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-500">Disables open tracking</p>
      </div>

      {/* Daily Limit */}
      <div className="border rounded-xl p-6 bg-white shadow-sm">
        <Label className="text-base font-medium">Daily Limit</Label>
        <p className="text-sm text-slate-500 mb-3">
          Max number of emails to send per day for this campaign
        </p>
        <Input
          type="number"
          value={dailyLimit}
          onChange={(e) => setDailyLimit(e.target.value)}
          className="w-32"
        />
      </div>
    </div>
  );
}
