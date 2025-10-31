"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ChevronDown,
  Menu,
  Users,
  Phone,
  MessageSquare,
  Linkedin,
  RotateCcw,
  Flame,
  Globe,
  Mail,
  Zap,
  ShoppingBag,
  BarChart2,
  Server,
  Clock,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function IndexNavbar() {
  const navigate = useNavigate();
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth" });
  };
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const togglePopover = (menu: string) => {
    setOpenPopover((prev) => (prev === menu ? null : menu));
  };

  return (
    <header className="fixed z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-lg font-bold text-white">
            <Mail className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold text-slate-900">InboxMail</span>
        </div>

        {/* Desktop Nav */}
        <nav className="relative hidden items-center gap-6 text-sm text-slate-700 md:flex">
          {/* Product Mega Menu */}
          <Popover open={openPopover === "product"} onOpenChange={() => {}}>
            <PopoverTrigger
              onMouseEnter={() => togglePopover("product")}
              onClick={() => togglePopover("product")}
              className="flex cursor-pointer items-center gap-1 font-medium hover:text-blue-600"
            >
              Product
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  openPopover === "product" ? "rotate-180 text-blue-600" : ""
                }`}
              />
            </PopoverTrigger>

            {openPopover === "product" && (
              <PopoverContent
                align="start"
                className="mt-4 flex w-[900px] justify-between gap-8 rounded-2xl border bg-white p-8 shadow-xl"
              >
                {/* Column 1 */}
                <div className="flex-1">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    ALL-IN-ONE EMAIL INFRASTRUCTURE
                  </h3>
                  <p className="mb-5 text-sm text-slate-500">
                    Manage everything from DNS to analytics — built to scale your cold email
                    outreach with precision.
                  </p>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <Globe className="mt-1 h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-slate-800">DNS Management</h4>
                        <p className="text-sm text-slate-500">
                          Configure and monitor SPF, DKIM, and DMARC for bulletproof deliverability.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="mt-1 h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-slate-800">Cold Mailing Engine</h4>
                        <p className="text-sm text-slate-500">
                          Send high-volume personalized emails that reach inboxes — not spam
                          folders.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="flex-1">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    SCALE OUTREACH FAST
                  </h3>
                  <p className="mb-5 text-sm text-slate-500">
                    Automate your outreach with intelligent workflows that work 24/7.
                  </p>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <Zap className="mt-1 h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-slate-800">Fast Email Delivery</h4>
                        <p className="text-sm text-slate-500">
                          Optimized sending speed and IP rotation ensure top-tier deliverability.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <ShoppingBag className="mt-1 h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-slate-800">Instant Domain Purchase</h4>
                        <p className="text-sm text-slate-500">
                          Buy and warm up new domains directly from your dashboard — ready to send
                          in minutes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="flex-1">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    DELIVER & TRACK PERFORMANCE
                  </h3>
                  <p className="mb-5 text-sm text-slate-500">
                    Gain real-time insights on campaigns, domains, and IPs to refine strategy
                    continuously.
                  </p>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <BarChart2 className="mt-1 h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-slate-800">Campaign Analytics</h4>
                        <p className="text-sm text-slate-500">
                          Visualize open, click, and reply rates with detailed, actionable
                          dashboards.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Server className="mt-1 h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-slate-800">Dedicated IPs</h4>
                        <p className="text-sm text-slate-500">
                          Protect your reputation with private IPs tailored for each campaign or
                          sender.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            )}
          </Popover>

          <p
            onClick={() => scrollToSection("pricing")}
            className="cursor-pointer font-medium hover:text-blue-600"
          >
            Pricing
          </p>

          <Popover open={openPopover === "toolbox"} onOpenChange={() => {}}>
            <PopoverTrigger
              onMouseEnter={() => togglePopover("toolbox")}
              onClick={() => togglePopover("toolbox")}
              className="flex cursor-pointer items-center gap-1 font-medium hover:text-blue-600"
            >
              Toolbox
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  openPopover === "toolbox" ? "rotate-180 text-blue-600" : ""
                }`}
              />
            </PopoverTrigger>

            {openPopover === "toolbox" && (
              <PopoverContent
                align="start"
                className="mt-3 w-[380px] rounded-2xl border bg-white p-6 shadow-xl"
              >
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  TOOLS & AUTOMATION
                </h3>
                <p className="mb-6 text-sm text-slate-500">
                  Everything you need to manage, automate, and scale your campaigns — all from one
                  dashboard.
                </p>

                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <BarChart2 className="mt-1 h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Campaign Analytics</h4>
                      <p className="text-sm text-slate-500">
                        Real-time tracking for opens, clicks, and replies with performance insights.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="mt-1 h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Scheduled Campaigns</h4>
                      <p className="text-sm text-slate-500">
                        Automate send times and control delivery windows across accounts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Layers className="mt-1 h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Campaign Sequences</h4>
                      <p className="text-sm text-slate-500">
                        Build multistep sequences with conditional logic and auto follow-ups.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Globe className="mt-1 h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Domain Integrations</h4>
                      <p className="text-sm text-slate-500">
                        Connect pre-warmed domains and manage DNS automatically for better
                        deliverability.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="mt-1 h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Email Account Integration</h4>
                      <p className="text-sm text-slate-500">
                        Seamless sync with Google Workspace, Microsoft 365, and custom IMAP
                        accounts.
                      </p>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            )}
          </Popover>
        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Button
            onClick={() => navigate("/auth?auth=login")}
            variant="ghost"
            className="text-slate-700 hover:text-blue-600"
          >
            Log in
          </Button>
          <Button variant="outline">Get a demo</Button>
          <Button
            onClick={() => navigate("/auth?auth=signup")}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Sign up for free
          </Button>
        </div>

        {/* Mobile Menu */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5 text-slate-700" />
        </Button>
      </div>
    </header>
  );
}
