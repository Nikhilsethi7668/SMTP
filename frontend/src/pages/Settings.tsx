import { EmailAccounts } from '@/components/EmailAccounts';
import { Header } from '@/components/Header';
import { SideBar } from '@/components/SideBar';
import React from 'react';

// Main Dashboard component
export const Settings = () => {
  // State to control the sidebar's collapsed status
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  return (
    <div className="h-screen w-screen flex flex-col">
      
      {/* Header component with a toggle function */}
      <Header onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      {/* Main content area: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        <SideBar collapsed={isSidebarCollapsed} />
        
        {/* Sidebar component */}

        {/* Content area: Contains EmailAccounts */}
        <div className="flex-1 overflow-auto p-6">
            <p>Coming soon..</p>
        </div>
      </div>
    </div>
  );
};