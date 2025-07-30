import React, { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { AuthContext } from "../../App";
import userDetailsService from "@/services/api/userDetailsService";
import ApperIcon from "@/components/ApperIcon";
import Signup from "@/components/pages/Signup";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);
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

  // Profile form data
const [formData, setFormData] = useState({
    Name: '',
    email: ''
  });

  // Pre-populate form with user data when modal opens
useEffect(() => {
    if (isProfileModalOpen && user) {
      setFormData({
        Name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.displayName || '',
        email: user.emailAddress || ''
      });
    }
  }, [isProfileModalOpen, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isProfileModalOpen) {
        setIsProfileModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileModalOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    if (logout) {
      await logout();
    }
  };

  const handleOpenProfile = () => {
    setIsOpen(false);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For demo purposes, using a mock ID. In real implementation, 
      // you would get the user's profile record ID from the database
      const profileId = 1; 
      
      const result = await userDetailsService.update(profileId, formData);
      
      if (result && result.length > 0) {
        toast.success('Profile updated successfully!');
        setIsProfileModalOpen(false);
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('An error occurred while updating your profile.');
    } finally {
      setLoading(false);
    }
  };


return (
    <>
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
              
              <div className="py-2">
                <button 
                  onClick={handleOpenProfile}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  <ApperIcon name="User" size={16} className="mr-3" />
                  My Profile
                </button>
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

      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseProfile}
          >
            <motion.div
              ref={modalRef}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-2">
                      <ApperIcon name="User" size={20} className="text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
                      <p className="text-sm text-gray-500">Manage your account information and preferences</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseProfile}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <ApperIcon name="X" size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
<div className="space-y-6">
                  <div>
                    <label htmlFor="Name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      id="Name"
                      name="Name"
                      type="text"
                      value={formData.Name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={loading}
                      onClick={handleCloseProfile}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="min-w-[120px]"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <ApperIcon name="Loader2" size={16} className="animate-spin mr-2" />
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <ApperIcon name="Save" size={16} className="mr-2" />
                          Save Changes
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserProfileDropdown;