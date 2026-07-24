import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
} from 'lucide-react';

function AdminNavLinks({ isCollapsed }) {
  const baseLinkClass = "flex items-center p-3 rounded-lg transition-all duration-200 group relative font-medium text-sm";
  const activeLinkClass = "bg-[var(--sidebar-active)] text-[var(--sidebar-text-active)] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-[var(--brand)]";
  const inactiveLinkClass = "text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text-active)]";

  const links = [
    { to: "/dashboard/admin/overview", icon: LayoutDashboard, label: "Overview" },
    { to: "/dashboard/admin/users", icon: Users, label: "Manage Users" },
    { to: "/dashboard/admin/chat", icon: MessageSquare, label: "Messages" },
    { to: "/dashboard/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="space-y-1.5 w-full">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass} ${isCollapsed ? 'justify-center pl-3' : 'pl-4'}`
          }
          title={isCollapsed ? link.label : ""}
        >
          <link.icon className={`w-5 h-5 flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''}`} />

          {!isCollapsed && (
            <span className="whitespace-nowrap transition-opacity duration-200">
              {link.label}
            </span>
          )}

          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-[var(--surface)] text-[var(--ink)] text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-[var(--line)] shadow-xl transition-all duration-200">
              {link.label}
            </div>
          )}
        </NavLink>
      ))}
    </div>
  );
}

export default AdminNavLinks;
