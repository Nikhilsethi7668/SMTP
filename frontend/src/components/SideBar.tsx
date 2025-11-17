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
  ShoppingCart,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useUserStore } from "@/store/useUserStore";

const allNavigationItems = [
  { name: "Dashboard", icon: Home, path: "/dashboard/accounts" },
  { name: "Campaigns", icon: Mail, path: "/dashboard/campaigns" },
  { name: "Email Accounts", icon: UserCog, path: "/dashboard/email-accounts" },
  { name: "Warmup", icon: Flame, path: "/dashboard/email-warmup" },
  { name: "Prewarm Domains", icon: Globe, path: "/dashboard/purchased-domains" },
  { name: "Purchase Domain", icon: ShoppingCart, path: "/dashboard/purchase-domain" },
  { name: "UniBox", icon: Inbox, path: "/dashboard/unibox" },
  { name: "Analytics", icon: LineChart, path: "/dashboard/analytics" },
  { name: "Domains", icon: Globe, path: "/dashboard/domains" },
  { name: "CRM", icon: BarChart3, path: "/dashboard/crm" },
  { name: "Credits", icon: CreditCard, path: "/dashboard/credits" },
  { name: "Settings", icon: Settings, path: "/dashboard/settings" },
];

// Admin-only navigation items
const adminNavigationItems = [
  { name: "Dashboard", icon: Home, path: "/dashboard/accounts" },
  { name: "Prewarm Domains", icon: Globe, path: "/dashboard/purchased-domains" },
  { name: "Purchase Domain", icon: ShoppingCart, path: "/dashboard/purchase-domain" },
];

interface SideBarProps {
  collapsed: boolean;
}

export const SideBar = ({ collapsed }: SideBarProps) => {
  const user = useUserStore((state) => state.user);
  const isAdmin = user?.role === "admin";
  
  // Filter navigation items based on user role
  const navigationItems = isAdmin ? adminNavigationItems : allNavigationItems;

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
