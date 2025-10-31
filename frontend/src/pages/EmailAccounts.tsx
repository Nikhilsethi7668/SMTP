import React from "react";
import { Header } from "@/components/Header";
import { SideBar } from "@/components/SideBar";
import { EmailAccounts } from "@/components/EmailAccounts";
export default function () {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
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
          <EmailAccounts />
        </div>
      </div>
    </div>
  );
}
