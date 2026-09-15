import {
  BarChart3,
  Box,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { useUIStore } from "../store/useUIStore";

const Sidebar = () => {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  const getNavLinkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    `flex items-center gap-3 rounded-md p-3 text-sm font-medium transition-colors ${
      isActive
        ? "bg-gray-100 text-gray-900"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  return (
    <aside
      className={`border-r bg-white transition-all duration-200 ${
        sidebarOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="flex items-center justify-end border-b p-3">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={
            sidebarOpen ? "Collapse sidebar" : "Expand sidebar"
          }
          className="rounded-md border p-2 transition-colors hover:bg-gray-50"
        >
          {sidebarOpen ? (
            <ChevronLeft size={18} />
          ) : (
            <ChevronRight size={18} />
          )}
        </button>
      </div>

      <nav className="space-y-2 p-3" aria-label="Main navigation">
        <NavLink to="/dashboard" className={getNavLinkClass}>
          <BarChart3 size={20} />
          {sidebarOpen && <span>Dashboard</span>}
        </NavLink>

        <NavLink to="/products" className={getNavLinkClass}>
          <Box size={20} />
          {sidebarOpen && <span>Products</span>}
        </NavLink>

        <NavLink to="/sales" className={getNavLinkClass}>
          <ShoppingCart size={20} />
          {sidebarOpen && <span>Sales</span>}
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;