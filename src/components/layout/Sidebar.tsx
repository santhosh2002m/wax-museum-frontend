import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Ticket, History, Award, LogOut, Menu, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const navigationItems = [
  {
    title: "Tickets",
    href: "/dashboard",
    icon: Ticket,
    description: "Manage museum tickets",
  },
  {
    title: "History",
    href: "/dashboard/history",
    icon: History,
    description: "View transaction history",
  },
  {
    title: "Guide Score",
    href: "/dashboard/guide-score",
    icon: Award,
    description: "Monitor guide performance",
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar = ({ isCollapsed, onToggleCollapse }: SidebarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Logged out successfully",
      description: "You have been signed out of your account",
    });
    navigate("/");
  };

  return (
    <div
      className={`bg-sidebar border-r border-sidebar-border glass-card transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } h-screen flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-primary animate-glow-pulse" />
              <div>
                <h1 className="text-xl font-bold neon-text-primary">
                  Wax Museum
                </h1>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground p-2"
          >
            {isCollapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  end={item.href === "/dashboard"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 group hover-glow ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground neon-glow-primary shadow-lg"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`
                  }
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${
                      isCollapsed ? "mx-auto" : ""
                    }`}
                  />
                  {!isCollapsed && (
                    <div className="animate-slide-in-left">
                      <span className="font-medium">{item.title}</span>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={`w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-300 ${
            isCollapsed ? "px-3" : ""
          }`}
        >
          <LogOut className={`w-5 h-5 ${isCollapsed ? "mx-auto" : ""}`} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
