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
import { MoreHorizontal, Play, Pause, Edit, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

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
  draft: "bg-muted text-muted-foreground",
  running: "bg-success/10 text-success border-success/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-info/10 text-info border-info/20",
};

export const CampaignTable: React.FC<CampaignTableProps> = ({ campaigns, onAction }) => {
  const navigate = useNavigate();
  return (
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
          {campaigns.map((c) => {
            const sent = c.metrics_sent || 0;
            const delivered = c.metrics_delivered || 0;
            const opened = c.metrics_opened || 0;
            const clicked = c.metrics_clicked || 0;
            const bounced = c.metrics_bounced || 0;
            const complaints = c.metrics_complaints || 0;

            const openRate = delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : "0.0";
            const clickRate = delivered > 0 ? ((clicked / delivered) * 100).toFixed(1) : "0.0";
            const bounceRate = sent > 0 ? ((bounced / sent) * 100).toFixed(1) : "0.0";
            const complaintRate =
              delivered > 0 ? ((complaints / delivered) * 100).toFixed(1) : "0.0";

            return (
              <TableRow key={c._id} className="transition-colors hover:bg-muted/30">
                <TableCell
                  onClick={() =>
                    navigate(
                      `/dashboard/campaigns/details?campaignName=${encodeURIComponent(c.name)}&campaignId=${encodeURIComponent(c._id)}`
                    )
                  }
                  className="cursor-pointer font-medium"
                >
                  {c.name}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[c.status || "draft"]}>
                    {c.status?.charAt(0).toUpperCase() + c.status?.slice(1) || "Draft"}
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
                      <DropdownMenuItem onClick={() => onAction?.("edit", c)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => onAction?.("duplicate", c)}>
                        <Copy className="mr-2 h-4 w-4" /> Duplicate
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => onAction?.(c.status === "running" ? "pause" : "start", c)}
                      >
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
