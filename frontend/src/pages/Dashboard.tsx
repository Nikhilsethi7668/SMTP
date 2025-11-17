import { EmailAccounts } from "@/components/EmailAccounts";
import { Header } from "@/components/Header";
import { SideBar } from "@/components/SideBar";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Upload,
  BarChart2,
  Mail,
  Users,
  AlertTriangle,
  Search,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import api from "@/axiosInstance";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
export const Dashboard = () => {
  const user = useUserStore((state) => state.user);
  const primaryColor = "#2563eb"; // InboxMail blue
  const lightBlue = "#eff6ff";
  const accent = "#3b82f6";
  const navigate = useNavigate();
  const handleNavigation = (option: string, name: string = "", id: string = "") => {
    if (option === "create") navigate("/dashboard/campaigns/create");
    else if (option === "campaign") navigate("/dashboard/campaigns");
    else if (option === "detail")
      navigate(
        `/dashboard/campaigns/details?campaignName=${encodeURIComponent(name)}&campaignId=${encodeURIComponent(id)}`
      );
  };
  // State to control the sidebar's collapsed status
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const stats = [
    {
      title: "Total Sent",
      value: 0,
      sub: "+0.0% Engagement Rate",
      icon: <Mail className="h-5 w-5 text-blue-400" />,
    },
    {
      title: "Total Delivered",
      value: 0,
      sub: "0.0% Delivery Rate",
      icon: <Mail className="h-5 w-5 text-blue-400" />,
    },
    {
      title: "Total Leads",
      value: 0,
      sub: "Active Across Campaigns",
      icon: <Users className="h-5 w-5 text-blue-400" />,
    },
    {
      title: "Total Bounces",
      value: 0,
      sub: "0.0% Bounce Rate",
      icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
    },
  ];

  const quickActions = [
    {
      title: "New Campaign",
      desc: "Start a new email campaign",
      icon: <Plus className="h-5 w-5 text-blue-500" />,
      action: () => handleNavigation("create"),
    },
    {
      title: "Import Leads",
      desc: "Upload your contact list",
      icon: <Upload className="h-5 w-5 text-blue-500" />,
      action: () => handleNavigation("campaign"),
    },
    {
      title: "Manage Senders",
      desc: "Configure email accounts",
      icon: <Mail className="h-5 w-5 text-blue-500" />,
      action: () => toast.info("Under maintenance"),
    },
    {
      title: "View Analytics",
      desc: "Check campaign performance",
      icon: <BarChart2 className="h-5 w-5 text-blue-500" />,
      action: () => toast.info("Under maintenance"),
    },
  ];

  const activities = [
    {
      status: "success",
      message: 'Campaign "Welcome Series" completed successfully',
      time: "2 hours ago",
    },
    { status: "success", message: "500 new leads imported from CSV", time: "4 hours ago" },
    {
      status: "warning",
      message: 'Email sender "noreply@company.com" needs verification',
      time: "6 hours ago",
    },
    { status: "success", message: 'Campaign "Black Friday Sale" started', time: "1 day ago" },
  ];

  const systems = [
    { name: "Email Delivery", status: "Operational", color: "text-blue-500" },
    { name: "Lead Processing", status: "Operational", color: "text-blue-500" },
    { name: "DNS Verification", status: "Pending", color: "text-yellow-600" },
    { name: "Analytics", status: "Operational", color: "text-blue-500" },
  ];
  const [campaigns, setCampaigns] = useState([]);
  const handleGetData = async () => {
    try {
      const response = await api.get("/campaigns");
      if (response.data.success) {
        setCampaigns(response.data.campaigns);
        console.log(response.data.campaigns);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || (error as string));
    }
  };
  useEffect(() => {
    handleGetData();
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col">
      {/* Header component with a toggle function */}
      <Header onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      {/* Main content area: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        <SideBar collapsed={isSidebarCollapsed} />

        {/* Sidebar component */}

        {/* Content area: Contains EmailAccounts */}
        <div className="flex-1 overflow-auto p-6">
          <div className="min-h-screen space-y-8 p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Hi, {user?.full_name || "User"} 👋
                </h1>
                <p className="mt-1 text-gray-500">
                  Greetings on <span className="font-medium text-blue-600">InboxMail</span>!
                  Generate your
                  <Link to={"/dashboard/campaigns"} className="ml-1 text-blue-600 underline">
                    Email Campaign
                  </Link>{" "}
                  effortlessly with just a single click.
                </p>
              </div>
              <Button
                onClick={() => handleNavigation("create")}
                style={{ backgroundColor: primaryColor }}
                className="text-white hover:opacity-90"
              >
                Create New Campaign →
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((item, idx) => (
                <Card key={idx} className="border border-gray-100 shadow-sm">
                  <CardContent className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{item.title}</p>
                      <h2 className="mt-1 text-2xl font-bold">{item.value}</h2>
                      <p className="mt-1 text-xs text-gray-400">{item.sub}</p>
                    </div>
                    {item.icon}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Campaigns + Quick Actions */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle>Recent Campaigns</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {campaigns.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Sent</TableHead>
                          <TableHead>Delivered</TableHead>
                          <TableHead>Open Rate</TableHead>
                          <TableHead>Click Rate</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {campaigns.map((c, index) => (
                          <TableRow key={index}>
                            <TableCell
                              className="cursor-pointer font-medium text-blue-600 hover:underline"
                              onClick={() =>
                                navigate(
                                  `/dashboard/campaigns/details?campaignName=${encodeURIComponent(c.name)}&campaignId=${encodeURIComponent(c._id)}`
                                )
                              }
                            >
                              {c.name || "-"}
                            </TableCell>

                            <TableCell>
                              <span
                                className={`rounded-full px-2 py-1 text-xs ${
                                  c.status === "Active"
                                    ? "bg-green-100 text-green-700"
                                    : c.status === "Paused"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {c.status || "-"}
                              </span>
                            </TableCell>

                            <TableCell>{c.metrics_sent ?? "-"}</TableCell>
                            <TableCell>{c.metrics_delivered ?? "-"}</TableCell>
                            <TableCell>
                              {c.metrics_opened != null ? `${c.metrics_opened}%` : "-"}
                            </TableCell>
                            <TableCell>
                              {c.metrics_clicked != null ? `${c.metrics_clicked}%` : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center text-gray-500">
                      <p>No campaigns yet</p>
                      <Button
                        onClick={() => handleNavigation("create")}
                        style={{ backgroundColor: primaryColor }}
                        className="mt-4 text-white hover:opacity-90"
                      >
                        Create First Campaign
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {quickActions.map((action, idx) => (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key={idx}
                      onClick={action.action}
                      className="flex cursor-pointer flex-col gap-1 rounded-2xl bg-blue-50 p-4 transition hover:bg-blue-100"
                    >
                      <div className="flex items-center gap-2">
                        {action.icon}
                        <p className="text-sm font-semibold">{action.title}</p>
                      </div>
                      <p className="text-xs text-gray-500">{action.desc}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity + System Status */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activities.map((act, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span
                        className={`mt-2 h-2 w-2 rounded-full ${act.status === "warning" ? "bg-yellow-500" : "bg-blue-400"}`}
                      ></span>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{act.message}</p>
                        <p className="text-xs text-gray-400">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {systems.map((sys, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${sys.color === "text-yellow-600" ? "bg-yellow-600" : "bg-blue-400"}`}
                        ></span>
                        <p className="text-sm font-medium text-gray-700">{sys.name}</p>
                      </div>
                      <p className={`text-sm font-medium ${sys.color}`}>{sys.status}</p>
                    </div>
                  ))}

                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-gray-700">API Credits</p>
                    <Progress
                      value={75}
                      className="bg-gray-200"
                      style={{ accentColor: primaryColor }}
                    />
                    <p className="mt-1 text-right text-xs text-gray-400">2,450 remaining</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* All Email Performance */}
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Email Performance</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search" className="w-48 pl-8" />
                  </div>
                  <Button
                    style={{ backgroundColor: primaryColor }}
                    className="flex items-center gap-1 text-white hover:opacity-90"
                  >
                    <Download className="h-4 w-4" /> Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border-t border-gray-100">
                  <div className="py-10 text-center text-sm text-gray-500">
                    No campaigns found. Create your first campaign to see data here.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
