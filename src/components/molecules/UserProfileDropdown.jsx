import { useState, useRef, useEffect, useContext } from "react";
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import { AuthContext } from '../../App';

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { logout } = useContext(AuthContext);
  const { user, isAuthenticated } = useSelector((state) => state.user);

  // Default user data if not authenticated
  const displayUser = isAuthenticated && user ? {
    name: user.firstName ? `${user.firstName} ${user.lastName}` : user.name || "Support Agent",
    email: user.emailAddress || user.email || "agent@supporthub.com"
  } : {
    name: "Support Agent",
    email: "agent@supporthub.com"
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    if (logout) {
      await logout();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-full h-8 w-8 flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {displayUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">{displayUser.name}</p>
          <p className="text-xs text-gray-500">{displayUser.email}</p>
        </div>
        <ApperIcon 
          name="ChevronDown" 
          size={16} 
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
<div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{displayUser.name}</p>
              <p className="text-sm text-gray-500">{displayUser.email}</p>
              <p className="text-xs text-gray-400 mt-1">Support Team</p>
            </div>
            
            <div className="border-t border-gray-100 pt-2">
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <ApperIcon name="LogOut" size={16} className="mr-3" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfileDropdown;