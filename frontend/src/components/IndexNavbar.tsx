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
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const togglePopover = (menu: string) => {
    setOpenPopover((prev) => (prev === menu ? null : menu));
  };

  return (
    <header className=" fixed w-full border-b bg-white/80 backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            <Mail className="w-4 h-4" />
          </div>
          <span className="text-lg font-semibold text-slate-900">InboxMail</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-slate-700 text-sm relative">
          {/* Product Mega Menu */}
          <Popover open={openPopover === "product"} onOpenChange={() => {}}>
            <PopoverTrigger
              onMouseEnter={()=> togglePopover("product")}
              onClick={() => togglePopover("product")}
              className="flex items-center gap-1 font-medium hover:text-blue-600 cursor-pointer"
            >
              Product
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openPopover === "product" ? "rotate-180 text-blue-600" : ""
                }`}
              />
            </PopoverTrigger>

{openPopover === "product" && (
  <PopoverContent
    align="start"
    className="w-[900px] p-8 mt-4 shadow-xl bg-white rounded-2xl border flex justify-between gap-8"
  >
    {/* Column 1 */}
    <div className="flex-1">
      <h3 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
        ALL-IN-ONE EMAIL INFRASTRUCTURE
      </h3>
      <p className="text-sm text-slate-500 mb-5">
        Manage everything from DNS to analytics — built to scale your cold email outreach with precision.
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-slate-800">DNS Management</h4>
            <p className="text-sm text-slate-500">
              Configure and monitor SPF, DKIM, and DMARC for bulletproof deliverability.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-slate-800">Cold Mailing Engine</h4>
            <p className="text-sm text-slate-500">
              Send high-volume personalized emails that reach inboxes — not spam folders.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Column 2 */}
    <div className="flex-1">
      <h3 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
        SCALE OUTREACH FAST
      </h3>
      <p className="text-sm text-slate-500 mb-5">
        Automate your outreach with intelligent workflows that work 24/7.
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-slate-800">Fast Email Delivery</h4>
            <p className="text-sm text-slate-500">
              Optimized sending speed and IP rotation ensure top-tier deliverability.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <ShoppingBag className="w-5 h-5 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-slate-800">Instant Domain Purchase</h4>
            <p className="text-sm text-slate-500">
              Buy and warm up new domains directly from your dashboard — ready to send in minutes.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Column 3 */}
    <div className="flex-1">
      <h3 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
        DELIVER & TRACK PERFORMANCE
      </h3>
      <p className="text-sm text-slate-500 mb-5">
        Gain real-time insights on campaigns, domains, and IPs to refine strategy continuously.
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <BarChart2 className="w-5 h-5 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-slate-800">Campaign Analytics</h4>
            <p className="text-sm text-slate-500">
              Visualize open, click, and reply rates with detailed, actionable dashboards.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Server className="w-5 h-5 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-slate-800">Dedicated IPs</h4>
            <p className="text-sm text-slate-500">
              Protect your reputation with private IPs tailored for each campaign or sender.
            </p>
          </div>
        </div>
      </div>
    </div>
  </PopoverContent>
)}
          </Popover>


          <a href="#" className="hover:text-blue-600 font-medium">Pricing</a>

          <Popover open={openPopover === "toolbox"} onOpenChange={() => {}}>
            <PopoverTrigger
              onMouseEnter={()=> togglePopover("toolbox")}
              onClick={() => togglePopover("toolbox")}
              className="flex items-center gap-1 font-medium hover:text-blue-600 cursor-pointer"
            >
              Toolbox
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openPopover === "toolbox" ? "rotate-180 text-blue-600" : ""
                }`}
              />
            </PopoverTrigger>

            {openPopover === "toolbox" && (
  <PopoverContent
    align="start"
    className="w-[380px] p-6 mt-3 shadow-xl border bg-white rounded-2xl"
  >
    <h3 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
      TOOLS & AUTOMATION
    </h3>
    <p className="text-sm text-slate-500 mb-6">
      Everything you need to manage, automate, and scale your campaigns — all from one dashboard.
    </p>

    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <BarChart2 className="w-5 h-5 text-blue-600 mt-1" />
        <div>
          <h4 className="font-semibold text-slate-800">Campaign Analytics</h4>
          <p className="text-sm text-slate-500">
            Real-time tracking for opens, clicks, and replies with performance insights.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Clock className="w-5 h-5 text-blue-600 mt-1" />
        <div>
          <h4 className="font-semibold text-slate-800">Scheduled Campaigns</h4>
          <p className="text-sm text-slate-500">
            Automate send times and control delivery windows across accounts.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Layers className="w-5 h-5 text-blue-600 mt-1" />
        <div>
          <h4 className="font-semibold text-slate-800">Campaign Sequences</h4>
          <p className="text-sm text-slate-500">
            Build multistep sequences with conditional logic and auto follow-ups.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Globe className="w-5 h-5 text-blue-600 mt-1" />
        <div>
          <h4 className="font-semibold text-slate-800">Domain Integrations</h4>
          <p className="text-sm text-slate-500">
            Connect pre-warmed domains and manage DNS automatically for better deliverability.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Mail className="w-5 h-5 text-blue-600 mt-1" />
        <div>
          <h4 className="font-semibold text-slate-800">Email Account Integration</h4>
          <p className="text-sm text-slate-500">
            Seamless sync with Google Workspace, Microsoft 365, and custom IMAP accounts.
          </p>
        </div>
      </div>
    </div>
  </PopoverContent>
)}

          </Popover>

        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button onClick={()=> navigate("/auth?auth=login")} variant="ghost" className="text-slate-700 hover:text-blue-600">Log in</Button>
          <Button variant="outline">Get a demo</Button>
          <Button onClick={()=> navigate("/auth?auth=signup")} className="bg-blue-600 hover:bg-blue-700 text-white">Sign up for free</Button>
        </div>

        {/* Mobile Menu */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5 text-slate-700" />
        </Button>
      </div>
    </header>
  );
}
