import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface Campaign {
  _id: string;
  name: string;
  status?: "draft" | "running" | "paused" | "completed";
  metrics_sent?: number;
  metrics_delivered?: number;
  metrics_opened?: number;
  metrics_clicked?: number;
  metrics_bounced?: number;
  metrics_complaints?: number;
  updatedAt?: string;
}

interface CampaignAnalyticsProps {
  campaign: Campaign;
  onResume?: (id: string) => void;
  onPause?: (id: string) => void;
}

export const CampaignAnalytics: React.FC<CampaignAnalyticsProps> = ({
  campaign,
  onResume,
  onPause,
}) => {
  const {
    _id,
    status = "draft",
    metrics_sent = 0,
    metrics_delivered = 0,
    metrics_opened = 0,
    metrics_clicked = 0,
    metrics_bounced = 0,
    metrics_complaints = 0,
    updatedAt,
  } = campaign;

  const sentRate = metrics_sent ? ((metrics_delivered / metrics_sent) * 100).toFixed(1) : "0";
  const openRate = metrics_sent ? ((metrics_opened / metrics_sent) * 100).toFixed(1) : "0";
  const clickRate = metrics_sent ? ((metrics_clicked / metrics_sent) * 100).toFixed(1) : "0";
  const bounceRate = metrics_sent ? ((metrics_bounced / metrics_sent) * 100).toFixed(1) : "0";
  const complaintRate = metrics_sent ? ((metrics_complaints / metrics_sent) * 100).toFixed(1) : "0";

  const isPaused = status === "paused";
  const progressValue =
    status === "completed" ? 100 : metrics_sent ? (metrics_delivered / metrics_sent) * 100 : 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6 bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Analytics</h2>

        <div className="flex items-center gap-3">
          {isPaused ? (
            <Button onClick={() => onResume?.(_id)} variant="default">
              ▶ Resume campaign
            </Button>
          ) : (
            <Button onClick={() => onPause?.(_id)} variant="secondary">
              ❚❚ Pause campaign
            </Button>
          )}
        </div>
      </div>

      {/* Status + Progress */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Status:</span>
          <span
            className={cn(
              "px-2 py-1 text-xs rounded-md font-medium",
              status === "paused" && "bg-gray-200 text-gray-700",
              status === "running" && "bg-green-100 text-green-700",
              status === "draft" && "bg-yellow-100 text-yellow-700",
              status === "completed" && "bg-blue-100 text-blue-700"
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <Progress value={progressValue} className="w-40 h-2" />
        <span className="text-sm font-medium">{progressValue.toFixed(0)}%</span>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard title="Sent Rate" value={`${sentRate}%`} />
        <MetricCard title="Open Rate" value={`${openRate}%`} />
        <MetricCard title="Click Rate" value={`${clickRate}%`} />
        <MetricCard title="Bounce Rate" value={`${bounceRate}%`} />
        <MetricCard title="Complaint Rate" value={`${complaintRate}%`} />
      </div>

      {/* Placeholder for analytics table */}
      <div className="border rounded-lg p-6 text-sm text-gray-500 text-center">
        No data available for specified time
      </div>
    </div>
  );
};

const MetricCard = ({ title, value }: { title: string; value: string }) => (
  <Card className="shadow-none border">
    <CardContent className="p-4 flex flex-col items-center justify-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </CardContent>
  </Card>
);
