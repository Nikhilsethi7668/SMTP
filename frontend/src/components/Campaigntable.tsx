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

interface Campaign {
  id: string;
  name: string;
  status: "draft" | "running" | "paused" | "completed";
  sent: number;
  total: number;
  openRate: number;
  clickRate: number;
  lastSent: string;
}

const campaigns: Campaign[] = [
  {
    id: "1",
    name: "Welcome Series",
    status: "running",
    sent: 1250,
    total: 2000,
    openRate: 68.5,
    clickRate: 24.3,
    lastSent: "2 hours ago",
  },
  {
    id: "2",
    name: "Product Launch 2024",
    status: "running",
    sent: 3420,
    total: 5000,
    openRate: 71.2,
    clickRate: 31.8,
    lastSent: "5 hours ago",
  },
  {
    id: "3",
    name: "Monthly Newsletter",
    status: "completed",
    sent: 8900,
    total: 8900,
    openRate: 55.3,
    clickRate: 18.7,
    lastSent: "Yesterday",
  },
  {
    id: "4",
    name: "Re-engagement Campaign",
    status: "paused",
    sent: 567,
    total: 1200,
    openRate: 42.1,
    clickRate: 12.4,
    lastSent: "3 days ago",
  },
  {
    id: "5",
    name: "Summer Sale Promo",
    status: "draft",
    sent: 0,
    total: 3500,
    openRate: 0,
    clickRate: 0,
    lastSent: "Not sent",
  },
];

const statusColors = {
  draft: "bg-muted text-muted-foreground",
  running: "bg-success/10 text-success border-success/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-info/10 text-info border-info/20",
};

export const CampaignTable = () => {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Force all text to be left-aligned */}
      <Table className="[&_th]:text-left [&_td]:text-left">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Campaign Name</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Progress</TableHead>
            <TableHead className="font-semibold">Open Rate</TableHead>
            <TableHead className="font-semibold">Click Rate</TableHead>
            <TableHead className="font-semibold">Last Sent</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow
              key={campaign.id}
              className="hover:bg-muted/30 transition-colors"
            >
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={statusColors[campaign.status]}
                >
                  {campaign.status.charAt(0).toUpperCase() +
                    campaign.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {campaign.sent.toLocaleString()} /{" "}
                    {campaign.total.toLocaleString()}
                  </span>
                </div>
              </TableCell>
              <TableCell className="font-medium">{campaign.openRate}%</TableCell>
              <TableCell className="font-medium">{campaign.clickRate}%</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {campaign.lastSent}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {campaign.status === "running" ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
