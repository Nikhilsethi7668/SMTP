import { Header } from '@/components/Header';
import { SideBar } from '@/components/SideBar';
import React from 'react';

export const DashboardLayout = ({ children }) => {

  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  return (
    <div className="flex h-screen w-screen flex-col">
      {/* Header component with a toggle function */}
      <Header onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      <div className="flex flex-1 overflow-hidden">
        <SideBar collapsed={isSidebarCollapsed} />
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
