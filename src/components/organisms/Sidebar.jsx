import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import { AuthContext } from '../../App';

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

const navigation = [
    { name: "Dashboard", href: "/", icon: "BarChart3" },
    { name: "Apps Overview", href: "/apps", icon: "Grid3X3" },
    { name: "Users", href: "/users", icon: "Users" },
    { name: "AI Logs", href: "/logs", icon: "FileText" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center px-6 py-6 border-b border-gray-200">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-2">
          <ApperIcon name="Headphones" size={24} className="text-white" />
        </div>
        <div className="ml-3">
          <h1 className="text-xl font-bold text-gray-900">SupportHub</h1>
          <p className="text-sm text-gray-500">Analytics</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <ApperIcon name={item.icon} size={20} className="mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
{/* Footer */}
<div className="p-4 border-t border-gray-200">
        <LogoutButton />
      </div>
    </div>
  );

  const LogoutButton = () => {
    const { logout } = React.useContext(AuthContext) || {};
    
    const handleLogout = () => {
      if (logout) {
        logout();
      }
    };
    
    return (
      <button
        onClick={handleLogout}
        className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
      >
        <ApperIcon name="LogOut" size={16} className="mr-3" />
        Sign Out
      </button>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-white rounded-lg p-2 shadow-md border border-gray-200"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <ApperIcon name={isMobileOpen ? "X" : "Menu"} size={20} />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              className="lg:hidden fixed inset-y-0 left-0 w-64 z-50"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;