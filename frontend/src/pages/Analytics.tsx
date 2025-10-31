import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Info,
  Share2,
  Settings,
  TrendingUp,
  Mail,
  MousePointer,
  Reply,
  Target,
} from "lucide-react";
import { Header } from "@/components/Header";
import { SideBar } from "@/components/SideBar";
import api from "@/axiosInstance";
import { toast } from "sonner";

interface Campaign {
  _id: string;
  name: string;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: any;
  trend: string;
  trendUp: boolean;
  accentColor: string;
  tooltip: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  accentColor,
  tooltip,
}: StatCardProps) => {
  return (
    <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg">
      <div className={`absolute top-0 left-0 w-full h-1 ${accentColor}`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className={`p-2 rounded-lg ${accentColor} bg-opacity-10`}>
          <Icon
            className="h-4 w-4"
            style={{
              color: `hsl(var(--${accentColor
                .replace("bg-", "")
                .replace("/10", "")}))`,
            }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <p
          className={`text-xs flex items-center gap-1 mt-2 ${
            trendUp ? "text-success" : "text-destructive"
          }`}
        >
          <TrendingUp className={`h-3 w-3 ${trendUp ? "" : "rotate-180"}`} />
          {trend} from last period
        </p>
      </CardContent>
    </Card>
  );
};

export default function Analytics() {
  const [selectedCampaign, setSelectedCampaign] = useState("all");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  // 🔹 Fetch campaigns dynamically from API
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await api.get("/campaigns/names");
        const allOption = { _id: "all", name: "All Campaigns" };
        setCampaigns([allOption, ...res.data.campaigns]);
      } catch (err) {
        toast.error(err?.response?.data?.message);
      }
    };
    fetchCampaigns();
  }, []);

  // 🔹 Fetch metrics dynamically based on selected campaign
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let res: any;
        if (selectedCampaign === "all") {
          res = await api.get("/campaigns/metrics/all");
        } else {
          res = await api.get("/campaigns/metrics", {
            params: { campaignId: selectedCampaign },
          });
        }
        setMetrics(res.data.data);
      } catch (error) {
        toast.error(error?.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCampaign]);

  // 🔹 Prepare dynamic stats (fallback to 0 if metrics not loaded)
  const stats = [
    {
      title: "Total Sent",
      value: metrics?.sent?.toLocaleString() ?? "0",
      icon: Mail,
      trend: metrics?.sentChange ? `${metrics.sentChange}%` : "+0%",
      trendUp: metrics?.sentChange >= 0,
      accentColor: "bg-info/10",
      tooltip: "Total number of emails sent across all campaigns",
    },
    {
      title: "Open Rate",
      value: metrics?.openRate ? `${metrics.openRate.toFixed(1)}%` : "0%",
      icon: MousePointer,
      trend: metrics?.openRateChange ? `${metrics.openRateChange}%` : "+0%",
      trendUp: metrics?.openRateChange >= 0,
      accentColor: "bg-success/10",
      tooltip: "Percentage of recipients who opened your emails",
    },
    {
      title: "Click Rate",
      value: metrics?.clickRate ? `${metrics.clickRate.toFixed(1)}%` : "0%",
      icon: Target,
      trend: metrics?.clickRateChange ? `${metrics.clickRateChange}%` : "+0%",
      trendUp: metrics?.clickRateChange >= 0,
      accentColor: "bg-warning/10",
      tooltip: "Percentage of recipients who clicked links in your emails",
    },
    {
      title: "Reply Rate",
      value: metrics?.replyRate ? `${metrics.replyRate.toFixed(1)}%` : "0%",
      icon: Reply,
      trend: metrics?.replyRateChange ? `${metrics.replyRateChange}%` : "-0%",
      trendUp: metrics?.replyRateChange >= 0,
      accentColor: "bg-accent/10",
      tooltip: "Percentage of recipients who replied to your emails",
    },
    {
      title: "Opportunities",
      value: metrics?.opportunities?.toLocaleString() ?? "0",
      icon: TrendingUp,
      trend: metrics?.opportunitiesChange
        ? `${metrics.opportunitiesChange}%`
        : "+0%",
      trendUp: metrics?.opportunitiesChange >= 0,
      accentColor: "bg-primary/10",
      tooltip: "Number of qualified opportunities generated from campaigns",
    },
  ];

  // 🔹 Dynamic activity data (for chart)
  const activityData =
    metrics?.activity?.map((a: any) => ({
      date: a.date,
      sent: a.sent,
      opens: a.opens,
      clicks: a.clicks,
      replies: a.replies,
    })) ?? [];

  return (
    <div className="max-h-screen overflow-hidden">
      <Header
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex flex-1 overflow-hidden">
        <SideBar collapsed={isSidebarCollapsed} />

        <div className="flex-1 overflow-scroll p-6 h-screen">
          <div className="flex-1 h-[120vh]">
            {/* Header with Campaign Filter */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Analytics Dashboard{" "}
                  {selectedCampaign !== "all" && (
                    <span>
                      {" - "}
                      {campaigns.find((c) => c._id === selectedCampaign)
                        ?.name || ""}
                    </span>
                  )}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track your email campaign performance
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Select
                  value={selectedCampaign}
                  onValueChange={setSelectedCampaign}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => toast.info("Feature coming soon")}
                  variant="outline"
                  size="icon"
                >
                  <Share2 className="h-4 w-4" />
                </Button>

                <Button
                  onClick={() => toast.info("Feature coming soon")}
                  variant="outline"
                  size="icon"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            {/* Activity Chart */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">
                  Email Activity Over Time
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track sends, opens, clicks, and replies
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={activityData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Line
                      type="monotone"
                      dataKey="sent"
                      stroke="hsl(var(--info))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--info))" }}
                      name="Sent"
                    />
                    <Line
                      type="monotone"
                      dataKey="opens"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--success))" }}
                      name="Opens"
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="hsl(var(--warning))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--warning))" }}
                      name="Clicks"
                    />
                    <Line
                      type="monotone"
                      dataKey="replies"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                      name="Replies"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
