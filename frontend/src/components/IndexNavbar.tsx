"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ChevronDown,
  Mail,
  Menu,
  Users,
  Phone,
  MessageSquare,
  Linkedin,
  RotateCcw,
  Flame,
  Zap,
} from "lucide-react";

export default function IndexNavbar() {
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
          <span className="text-lg font-semibold text-slate-900">MailFlow</span>
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
                  <h3 className="text-xs font-semibold text-slate-500 mb-3">
                    FIND QUALIFIED LEADS
                  </h3>
                  <p className="text-sm text-slate-500 mb-5">
                    Get a list of high-potential leads with verified emails, phone numbers, and relevant details.
                  </p>
                  <div className="flex flex-col gap-3">
                    <a href="#" className="flex items-center gap-2 hover:text-blue-600">
                      <Users className="w-4 h-4 text-slate-500" />
                      600M+ lead database
                    </a>
                    <a href="#" className="flex items-center gap-2 hover:text-blue-600">
                      <Mail className="w-4 h-4 text-slate-500" />
                      Email finder & verifier
                    </a>
                    <a href="#" className="flex items-center gap-2 hover:text-blue-600">
                      <Phone className="w-4 h-4 text-slate-500" />
                      Phone number finder
                    </a>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-slate-500 mb-3">
                    AUTOMATE MULTICHANNEL SEQUENCES
                  </h3>
                  <p className="text-sm text-slate-500 mb-5">
                    Run personalized outreach across email, LinkedIn, or phone from one spot.
                  </p>
                  <div className="flex flex-col gap-3">
                    <a href="#" className="flex items-center gap-2 hover:text-blue-600">
                      <MessageSquare className="w-4 h-4 text-slate-500" />
                      Multichannel sequences
                    </a>
                    <a href="#" className="flex items-center gap-2 hover:text-blue-600">
                      <Linkedin className="w-4 h-4 text-slate-500" />
                      LinkedIn prospecting
                    </a>
                    <a href="#" className="flex items-center gap-2 hover:text-blue-600">
                      <Phone className="w-4 h-4 text-slate-500" />
                      In-app calling
                    </a>
                    <a href="#" className="flex items-center gap-2 hover:text-blue-600">
                      <Zap className="w-4 h-4 text-slate-500" />
                      AI-powered personalization
                    </a>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-slate-500 mb-3">LAND IN INBOXES</h3>
                  <p className="text-sm text-slate-500 mb-5">
                    Make sure your outreach gets delivered where it matters, out of the spam folder.
                  </p>
                  <div className="flex flex-col gap-3 mb-4">
                    <a href="#" className="flex items-center gap-2 hover:text-blue-600">
                      <RotateCcw className="w-4 h-4 text-slate-500" />
                      Inbox rotation
                    </a>
                    <a href="#" className="flex items-center gap-2 hover:text-blue-600">
                      <Flame className="w-4 h-4 text-slate-500" />
                      Warm-up & deliverability booster
                    </a>
                  </div>
                  <div className="bg-[#f3f4ff] p-4 rounded-xl shadow-inner flex flex-col items-start justify-center">
                    <p className="text-sm font-medium text-slate-800 mb-1">
                      Integrate your stack to MailFlow
                    </p>
                    <p className="text-xs text-slate-500 mb-3">
                      Run your entire pipeline in one spot
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5">
                      Check integrations
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            )}
          </Popover>

          {/* Roles */}
          <Popover open={openPopover === "roles"} onOpenChange={() => {}}>
            <PopoverTrigger
              onMouseEnter={()=> togglePopover("roles")}
              onClick={() => togglePopover("roles")}
              className="flex items-center gap-1 font-medium hover:text-blue-600 cursor-pointer"
            >
              Roles
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openPopover === "roles" ? "rotate-180 text-blue-600" : ""
                }`}
              />
            </PopoverTrigger>

            {openPopover === "roles" && (
              <PopoverContent
                align="start"
                className="w-[250px] p-4 mt-2 shadow-lg border bg-white rounded-xl"
              >
                <div className="flex flex-col gap-3">
                  <a href="#" className="hover:text-blue-600">Sales Teams</a>
                  <a href="#" className="hover:text-blue-600">Founders</a>
                  <a href="#" className="hover:text-blue-600">Recruiters</a>
                  <a href="#" className="hover:text-blue-600">Agencies</a>
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
                className="w-[250px] p-4 mt-2 shadow-lg border bg-white rounded-xl"
              >
                <div className="flex flex-col gap-3">
                  <a href="#" className="hover:text-blue-600">Email Finder</a>
                  <a href="#" className="hover:text-blue-600">Cold Email Templates</a>
                  <a href="#" className="hover:text-blue-600">Deliverability Checker</a>
                </div>
              </PopoverContent>
            )}
          </Popover>

          {/* <a href="#" className="text-blue-600 font-medium">We are hiring!</a> */}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" className="text-slate-700 hover:text-blue-600">Log in</Button>
          <Button variant="outline">Get a demo</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Sign up for free</Button>
        </div>

        {/* Mobile Menu */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5 text-slate-700" />
        </Button>
      </div>
    </header>
  );
}
