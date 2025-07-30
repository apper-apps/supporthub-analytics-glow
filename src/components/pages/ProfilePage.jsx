import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import userDetailsService from '@/services/api/userDetailsService';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
const [formData, setFormData] = useState({
    Name: '',
    email: ''
  });

  // Pre-populate form with user data
useEffect(() => {
    if (user) {
      setFormData({
        Name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.displayName || '',
        email: user.emailAddress || ''
      });
    }
  }, [user]);

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
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-2">
              <ApperIcon name="User" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-500">Manage your account information and preferences</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              
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

              <div>
              </div>
            </div>



            {/* Signup Dates */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Signup Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="platform_signup_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Signup Date
                  </label>
                  <Input
                    id="platform_signup_date"
                    name="platform_signup_date"
                    type="date"
                    value={formData.platform_signup_date}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="apper_signup_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Apper Signup Date
                  </label>
                  <Input
                    id="apper_signup_date"
                    name="apper_signup_date"
                    type="date"
                    value={formData.apper_signup_date}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                disabled={loading}
                onClick={() => window.history.back()}
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
      </div>
    </div>
  );
};

export default ProfilePage;