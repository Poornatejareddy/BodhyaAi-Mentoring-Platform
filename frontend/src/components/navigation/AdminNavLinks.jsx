import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    UserPlus,
    MessageSquare,
    Settings,
    Shield
} from 'lucide-react';

function AdminNavLinks({ isCollapsed }) {
    const baseLinkClass = "flex items-center p-3 rounded-lg transition-all duration-200 group relative";
    const activeLinkClass = "bg-blue-600 text-white shadow-md";
    const inactiveLinkClass = "text-gray-400 hover:bg-gray-800 hover:text-white";

    const links = [
        { to: "/dashboard/admin/overview", icon: LayoutDashboard, label: "Overview" },
        { to: "/dashboard/admin/users", icon: Users, label: "Manage Users" },
        { to: "/dashboard/admin/chat", icon: MessageSquare, label: "Messages" },
        { to: "/dashboard/admin/settings", icon: Settings, label: "Settings" },
    ];

    return (
        <div className="space-y-2 w-full">
            {links.map((link) => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                        `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass} ${isCollapsed ? 'justify-center' : ''}`
                    }
                    title={isCollapsed ? link.label : ""}
                >
                    <link.icon className={`w-5 h-5 flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''}`} />

                    {!isCollapsed && (
                        <span className="font-medium whitespace-nowrap transition-opacity duration-200">
                            {link.label}
                        </span>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-gray-700 shadow-xl">
                            {link.label}
                        </div>
                    )}
                </NavLink>
            ))}
        </div>
    );
}

export default AdminNavLinks;
