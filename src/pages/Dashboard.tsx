import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      <main className="flex-1 overflow-auto bg-gradient-background">
        <div className="p-6 space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
