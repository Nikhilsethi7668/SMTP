import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/axiosInstance";
import { Pause, Play, Trash2, CheckCircle2, XCircle, Clock } from "lucide-react";

interface WarmupSettings {
  dailyEmailLimit: number;
  replyRate: number;
  openRate: number;
  startDate: string;
  duration: number;
}

interface WarmupStats {
  emailsSent: number;
  emailsReceived: number;
  repliesReceived: number;
  opensReceived: number;
  lastActivity: string;
}

interface EmailWarmup {
  _id: string;
  userId: string;
  emailAccountId: {
    _id: string;
    email: string;
    provider: string;
    isPrimary: boolean;
  };
  email: string;
  status: "pending" | "active" | "paused" | "completed" | "failed";
  warmupSettings: WarmupSettings;
  stats: WarmupStats;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  active: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  paused: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
  completed: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  failed: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  active: <Play className="h-3 w-3" />,
  paused: <Pause className="h-3 w-3" />,
  completed: <CheckCircle2 className="h-3 w-3" />,
  failed: <XCircle className="h-3 w-3" />,
};

export const EmailWarmupPage = () => {
  const [warmups, setWarmups] = useState<EmailWarmup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWarmups = async () => {
    try {
      setLoading(true);
      const response = await api.get("/warmup");
      if (response.data.success) {
        setWarmups(response.data.data);
      } else {
        console.error("Failed to fetch warmups:", response.data.message);
        setWarmups([]);
      }
    } catch (error) {
      console.error("Error fetching warmups:", error);
      setWarmups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (warmupId: string, newStatus: string) => {
    try {
      const response = await api.patch(`/warmup/${warmupId}/status`, { status: newStatus });
      if (response.data.success) {
        alert(`Warmup ${newStatus} successfully`);
        await fetchWarmups();
      } else {
        alert("Failed to update warmup status");
      }
    } catch (error) {
      console.error("Error updating warmup status:", error);
      alert("Failed to update warmup status");
    }
  };

  const handleDelete = async (warmupId: string) => {
    if (!confirm("Are you sure you want to delete this warmup?")) {
      return;
    }
    try {
      const response = await api.delete(`/warmup/${warmupId}`);
      if (response.data.success) {
        alert("Warmup deleted successfully");
        await fetchWarmups();
      } else {
        alert("Failed to delete warmup");
      }
    } catch (error) {
      console.error("Error deleting warmup:", error);
      alert("Failed to delete warmup");
    }
  };

  useEffect(() => {
    fetchWarmups();
  }, []);

  return (
    <DashboardLayout>
    <div className="p-6">
      <div className="text-2xl font-bold mb-4 border-b pb-2">
        <p>Email Warmup</p>
      </div>
      <div className="mb-4">
        <p className="text-gray-500">
          Manage your email warmup campaigns to improve deliverability and sender reputation
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading warmups...</p>
        </div>
      ) : warmups.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table className="[&_th]:text-left [&_td]:text-left min-w-full">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Daily Limit</TableHead>
                <TableHead className="font-semibold">Emails Sent</TableHead>
                <TableHead className="font-semibold">Replies</TableHead>
                <TableHead className="font-semibold">Opens</TableHead>
                <TableHead className="font-semibold">Duration</TableHead>
                <TableHead className="font-semibold">Started</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warmups.map((warmup) => {
                const statusStyle = statusColors[warmup.status] || statusColors.pending;
                const daysRemaining = Math.max(
                  0,
                  warmup.warmupSettings.duration -
                    Math.floor(
                      (new Date().getTime() - new Date(warmup.warmupSettings.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                );
                return (
                  <TableRow
                    key={warmup._id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium">{warmup.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} flex items-center gap-1 w-fit`}
                      >
                        {statusIcons[warmup.status]}
                        {warmup.status.charAt(0).toUpperCase() + warmup.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{warmup.warmupSettings.dailyEmailLimit} emails/day</TableCell>
                    <TableCell>{warmup.stats.emailsSent}</TableCell>
                    <TableCell>{warmup.stats.repliesReceived}</TableCell>
                    <TableCell>{warmup.stats.opensReceived}</TableCell>
                    <TableCell>
                      {daysRemaining > 0 ? `${daysRemaining} days left` : "Completed"}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(warmup.warmupSettings.startDate).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      {warmup.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(warmup._id, "paused")}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      {warmup.status === "paused" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(warmup._id, "active")}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </Button>
                      )}
                      {warmup.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(warmup._id, "active")}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(warmup._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-auto">
          <img
            className="max-w-md"
            src="https://app.instantly.ai/_next/static/images/pixeltrue-welcome_compressed-de11c441d5eab8a212aff473eef7558c.svg"
            alt="No warmups"
          />
          <p className="mt-4 text-gray-500">No warmup campaigns found</p>
          <p className="text-sm text-gray-400 mt-2">
            Start a warmup campaign from the Email Accounts page
          </p>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
};


