import { useState } from "react";
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
// Sample data for the chart
const activityData = [
  { date: "Jan 1", sent: 4000, opens: 2400, clicks: 1200, replies: 400 },
  { date: "Jan 8", sent: 3000, opens: 1398, clicks: 800, replies: 300 },
  { date: "Jan 15", sent: 2000, opens: 9800, clicks: 1500, replies: 600 },
  { date: "Jan 22", sent: 2780, opens: 3908, clicks: 1800, replies: 700 },
  { date: "Jan 29", sent: 1890, opens: 4800, clicks: 2000, replies: 850 },
  { date: "Feb 5", sent: 2390, opens: 3800, clicks: 1900, replies: 900 },
  { date: "Feb 12", sent: 3490, opens: 4300, clicks: 2200, replies: 1000 },
];

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
  const [timeRange, setTimeRange] = useState("7d");

  const stats = [
    {
      title: "Total Sent",
      value: "24,589",
      icon: Mail,
      trend: "+12.5%",
      trendUp: true,
      accentColor: "bg-info/10",
      tooltip: "Total number of emails sent across all campaigns",
    },
    {
      title: "Open Rate",
      value: "68.4%",
      icon: MousePointer,
      trend: "+4.2%",
      trendUp: true,
      accentColor: "bg-success/10",
      tooltip: "Percentage of recipients who opened your emails",
    },
    {
      title: "Click Rate",
      value: "42.1%",
      icon: Target,
      trend: "+2.8%",
      trendUp: true,
      accentColor: "bg-warning/10",
      tooltip: "Percentage of recipients who clicked links in your emails",
    },
    {
      title: "Reply Rate",
      value: "18.3%",
      icon: Reply,
      trend: "-1.2%",
      trendUp: false,
      accentColor: "bg-accent/10",
      tooltip: "Percentage of recipients who replied to your emails",
    },
    {
      title: "Opportunities",
      value: "1,247",
      icon: TrendingUp,
      trend: "+8.7%",
      trendUp: true,
      accentColor: "bg-primary/10",
      tooltip: "Number of qualified opportunities generated from campaigns",
    },
  ];
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  return (
    <div className="max-h-screen overflow-hidden">
      <Header
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex flex-1 overflow-hidden">
        <SideBar collapsed={isSidebarCollapsed} />

        {/* Sidebar component */}

        {/* Content area: Contains EmailAccounts */}
        <div className="flex-1 overflow-scroll p-6 h-screen">
          <div className="flex-1 h-[120vh]">
            {/* Header with filters */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Analytics Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track your email campaign performance
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>

                <Button variant="outline" size="icon">
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
                    <Legend
                      wrapperStyle={{
                        paddingTop: "20px",
                      }}
                    />
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
