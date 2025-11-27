import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Play, Pause, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { campaignApi } from "@/services/campaignApi";
import { toast } from "sonner";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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

interface CampaignTableProps {
  campaigns: Campaign[];
  onAction?: (action: string, campaign: Campaign) => void;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border border-muted-foreground/20",
  running: "bg-green-100 text-green-600 border border-green-300",
  paused: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  completed: "bg-blue-100 text-blue-600 border border-blue-300",
};

export const CampaignTable: React.FC<CampaignTableProps> = ({ campaigns }) => {
  const navigate = useNavigate();
  const [rows, setRows] = useState(campaigns);

  /* --------------------------------------------
      EDIT NAME DIALOG STATES
  ---------------------------------------------*/
  const [isEditing, setIsEditing] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  /* --------------------------------------------
      OPEN EDIT NAME (delay to avoid dropdown race)
      We delay opening the dialog slightly so the dropdown
      can finish its close animation and not interfere.
  ---------------------------------------------*/
  const openEditName = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setEditNameValue(campaign.name);

    // Small delay to let the dropdown fully close and avoid focus/race issues.
    // 80-150ms is fine; using 100ms to be safe.
    setTimeout(() => setIsEditing(true), 100);
  };

  /* --------------------------------------------
      SAVE UPDATED NAME
  ---------------------------------------------*/
  const saveEditedName = async () => {
    if (!selectedCampaign) return;

    const campaign = selectedCampaign;
    const newName = editNameValue.trim();
    if (!newName) return;

    try {
      await campaignApi.updateCampaign(campaign._id, { name: newName });

      setRows((prev) =>
        prev.map((row) =>
          row._id === campaign._id ? { ...row, name: newName } : row
        )
      );

      toast.success("Campaign name updated");
      setIsEditing(false);
      setSelectedCampaign(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update name");
    }
  };

  /* --------------------------------------------
      UPDATE STATUS (start/pause)
  ---------------------------------------------*/
  const handleStatusChange = async (campaign: Campaign) => {
    const newStatus = campaign.status === "running" ? "paused" : "running";

    try {
      await campaignApi.updateCampaignStatus(campaign._id, newStatus);

      setRows((prev) =>
        prev.map((row) =>
          row._id === campaign._id ? { ...row, status: newStatus } : row
        )
      );

      toast.success(
        newStatus === "running" ? "Campaign started" : "Campaign paused"
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  /* --------------------------------------------
      DELETE CAMPAIGN
  ---------------------------------------------*/
  const handleDelete = async (campaign: Campaign) => {
    if (!confirm(`Are you sure you want to delete "${campaign.name}"?`)) return;

    try {
      await campaignApi.deleteCampaign(campaign._id);

      setRows((prev) => prev.filter((row) => row._id !== campaign._id));

      toast.success("Campaign deleted successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete campaign");
    }
  };

  return (
    <>
      {/* Edit Name Dialog */}
      <Dialog
        open={isEditing}
        onOpenChange={(open) => {
          setIsEditing(open);
          if (!open) {
            // clear selected campaign when dialog closed
            setSelectedCampaign(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Campaign Name</DialogTitle>
          </DialogHeader>

          <Input
            value={editNameValue}
            onChange={(e) => setEditNameValue(e.target.value)}
            placeholder="Campaign Name"
            className="mt-4"
          />

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setSelectedCampaign(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveEditedName}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------- TABLE ------------------- */}

      <div className="w-full overflow-hidden rounded-lg border">
        <Table className="w-full [&_td]:text-left [&_th]:text-left">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Sent</TableHead>
              <TableHead className="font-semibold">Delivered</TableHead>
              <TableHead className="font-semibold">Open Rate</TableHead>
              <TableHead className="font-semibold">Click Rate</TableHead>
              <TableHead className="font-semibold">Bounce Rate</TableHead>
              <TableHead className="font-semibold">Complaint Rate</TableHead>
              <TableHead className="font-semibold">Last Updated</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((c) => {
              const sent = c.metrics_sent || 0;
              const delivered = c.metrics_delivered || 0;
              const opened = c.metrics_opened || 0;
              const clicked = c.metrics_clicked || 0;
              const bounced = c.metrics_bounced || 0;
              const complaints = c.metrics_complaints || 0;

              const openRate =
                delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : "0.0";
              const clickRate =
                delivered > 0 ? ((clicked / delivered) * 100).toFixed(1) : "0.0";
              const bounceRate =
                sent > 0 ? ((bounced / sent) * 100).toFixed(1) : "0.0";
              const complaintRate =
                delivered > 0
                  ? ((complaints / delivered) * 100).toFixed(1)
                  : "0.0";

              return (
                <TableRow
                  key={c._id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <TableCell
                    onClick={() =>
                      navigate(
                        `/dashboard/campaigns/details?campaignName=${encodeURIComponent(
                          c.name
                        )}&campaignId=${encodeURIComponent(c._id)}`
                      )
                    }
                    className="cursor-pointer font-medium"
                  >
                    {c.name}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColors[c.status || "draft"]}
                    >
                      {c.status?.charAt(0).toUpperCase() +
                        c.status?.slice(1) ||
                        "Draft"}
                    </Badge>
                  </TableCell>

                  <TableCell>{sent.toLocaleString()}</TableCell>
                  <TableCell>{delivered.toLocaleString()}</TableCell>
                  <TableCell>{openRate}%</TableCell>
                  <TableCell>{clickRate}%</TableCell>
                  <TableCell>{bounceRate}%</TableCell>
                  <TableCell>{complaintRate}%</TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {c.updatedAt ? new Date(c.updatedAt).toLocaleString() : "—"}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="start">
                        {/* EDIT NAME */}
                        <DropdownMenuItem onClick={() => openEditName(c)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit Name
                        </DropdownMenuItem>

                        {/* START / PAUSE */}
                        <DropdownMenuItem onClick={() => handleStatusChange(c)}>
                          {c.status === "running" ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" /> Pause
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" /> Start
                            </>
                          )}
                        </DropdownMenuItem>

                        {/* DELETE CAMPAIGN */}
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(c)}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
