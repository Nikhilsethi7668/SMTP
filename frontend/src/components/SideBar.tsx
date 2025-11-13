import {
  Home,
  Mail,
  Users,
  FileText,
  BarChart3,
  Inbox,
  LineChart,
  UserCog,
  Settings,
  Globe,
  Flame,
  CreditCard,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const navigationItems = [
  { name: "Dashboard", icon: Home, path: "/app/dashboard/accounts" },
  { name: "Campaigns", icon: Mail, path: "/app/dashboard/campaigns" },
  { name: "Email Accounts", icon: UserCog, path: "/app/email-accounts" },
  { name: "Warmup", icon: Flame, path: "/app/dashboard/email-warmup" },
  { name: "Prewarm Domains",icon:Globe,path:"/app/dashboard/purchased-domains"},
  { name: "UniBox", icon: Inbox, path: "/app/dashboard/unibox" },
  { name: "Analytics", icon: LineChart, path: "/app/analytics" },
  { name: "Domains", icon: Globe, path: "/app/domains" },
  { name: "CRM", icon: BarChart3, path: "/app/crm" },
  { name: "Credits", icon: CreditCard, path: "/app/dashboard/credits" },
  { name: "Settings", icon: Settings, path: "/app/dashboard/settings" },
];

interface SideBarProps {
  collapsed: boolean;
}

export const SideBar = ({ collapsed }: SideBarProps) => {
  return (
    <aside
      className={cn(
        "relative left-0 top-0 h-[calc(100vh-4rem)] border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <nav className="space-y-2 p-4">
        <TooltipProvider>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return collapsed ? (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-center rounded-lg p-3 transition-all duration-200",
                        "hover:bg-accent hover:text-accent-foreground",
                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <Icon
                        className={cn(
                          "h-5 w-5 transition-colors duration-200",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    )}
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-sm">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "border-l-4 border-primary bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span className="text-sm">{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </TooltipProvider>
      </nav>
    </aside>
  );
};
