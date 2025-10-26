import { Home, Mail, Users, FileText, BarChart3, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Accounts", icon: Home, path: "/app/dashboard/accounts" },
  { name: "Campaigns", icon: Mail, path: "/app/dashboard/campaigns" },
  { name: "Contacts", icon: Users, path: "/app/dashboard/contacts" },
  { name: "Templates", icon: FileText, path: "/app/dashboard/templates" },
  { name: "Analytics", icon: BarChart3, path: "/app/analytics" },
  { name: "UniBox", icon: Mail, path: "/app/dashboard/unibox" },
  { name: "Settings", icon: Settings, path: "/app/dashboard/settings" },
  
];

interface SideBarProps {
  collapsed: boolean;
}

export const SideBar = ({ collapsed }: SideBarProps) => {
  return (
    <aside
      className={cn(
        "relative left-0 top-0 h-[calc(100vh-4rem)] bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-primary/10 text-primary font-medium border-l-4 border-primary",
                collapsed && "justify-center"
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
