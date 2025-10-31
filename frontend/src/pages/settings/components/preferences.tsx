import { Checkbox } from "@/components/ui/checkbox";
import { Toggle } from "@/components/ui/toggle";
import { useState } from "react";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function Preferences() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showAutoReplies, setShowAutoReplies] = useState(true);
  const [saveNonInstantly, setSaveNonInstantly] = useState(true);
  const [saveUndelivered, setSaveUndelivered] = useState(false);
  const [onlyShowNotification, setOnlyShowNotification] = useState(false);

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-6 text-lg font-semibold text-foreground">Email Notifications</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Billing Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified about billing changes</p>
            </div>
            <Checkbox
              defaultChecked={emailNotifications}
              onCheckedChange={(checked) => setEmailNotifications(checked as boolean)}
              className="h-5 w-5 cursor-pointer rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Usage Alerts</p>
              <p className="text-sm text-muted-foreground">Notify when usage reaches 80%</p>
            </div>
            <Checkbox
              defaultChecked={emailNotifications}
              onCheckedChange={(checked) => setEmailNotifications(checked as boolean)}
              className="h-5 w-5 cursor-pointer rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Marketing Emails</p>
              <p className="text-sm text-muted-foreground">Receive updates about new features</p>
            </div>
            <Checkbox
              defaultChecked={marketingEmails}
              onCheckedChange={(checked) => setMarketingEmails(checked as boolean)}
              className="h-5 w-5 cursor-pointer rounded"
            />
          </div>
        </div>
      </div>

      {/* Display Preferences */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-6 text-lg font-semibold text-foreground">Display Preferences</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Use dark theme</p>
            </div>
            <Checkbox
              defaultChecked={darkMode}
              onCheckedChange={(checked) => setDarkMode(checked as boolean)}
              className="h-5 w-5 cursor-pointer rounded"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Language</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="german">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Unibox Preferences */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-6 text-lg font-semibold text-foreground">Unibox</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-medium text-foreground">Show auto-replies in Unibox</p>
            <Switch
              defaultChecked={showAutoReplies}
              onCheckedChange={(checked) => setShowAutoReplies(checked as boolean)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground">Save non-Instantly emails in Unibox</p>
              <span className="rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                New
              </span>
            </div>
            <Switch
              defaultChecked={saveNonInstantly}
              onCheckedChange={(checked) => setSaveNonInstantly(checked as boolean)}
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="font-medium text-foreground">Save undelivered emails in Unibox</p>
            <Switch
              defaultChecked={saveUndelivered}
              onCheckedChange={(checked) => setSaveUndelivered(checked as boolean)}
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="font-medium text-foreground">Only show notification in CRM</p>
            <Switch
              defaultChecked={onlyShowNotification}
              onCheckedChange={(checked) => setOnlyShowNotification(checked as boolean)}
            />
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-6 text-lg font-semibold text-foreground">Privacy</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Analytics</p>
              <p className="text-sm text-muted-foreground">Help us improve by sharing usage data</p>
            </div>
            <Checkbox defaultChecked className="h-5 w-5 cursor-pointer rounded" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Data Retention</p>
              <p className="text-sm text-muted-foreground">Keep my data for 90 days</p>
            </div>
            <Checkbox className="h-5 w-5 cursor-pointer rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
