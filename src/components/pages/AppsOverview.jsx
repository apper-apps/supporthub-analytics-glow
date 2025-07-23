import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import App from "@/App";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import DataTable from "@/components/organisms/DataTable";
import FilterBar from "@/components/molecules/FilterBar";
import StatusBadge from "@/components/molecules/StatusBadge";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import appService from "@/services/api/appService";
import userDetailsService from "@/services/api/userDetailsService";
const AppsOverview = () => {
const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dbFilter, setDbFilter] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [usersMap, setUsersMap] = useState({});
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [appDetails, setAppDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
const fetchApps = async () => {
    try {
      setLoading(true);
      setError("");
const data = await appService.getAll();
      setApps(data || []);
      setFilteredApps(data || []);
      
      // Fetch user details for all apps using user_id lookup field
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(app => app.user_id?.Id || app.user_id).filter(Boolean))];
        const users = await userDetailsService.getByIds(userIds);
        const userMap = {};
        users.forEach(user => {
          userMap[user.Id] = user;
        });
        setUsersMap(userMap);
      }
    } catch (err) {
      setError(err.message || "Failed to load apps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    let filtered = [...apps];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.app_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.app_category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

// Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(app => app.app_category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(app => app.last_chat_analysis_status === statusFilter);
    }

    // Apply DB filter
    if (dbFilter) {
      filtered = filtered.filter(app => 
        dbFilter === "connected" ? app.is_db_connected : !app.is_db_connected
      );
    }

    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        let aValue = a[sortColumn];
        let bValue = b[sortColumn];

        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (sortDirection === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    setFilteredApps(filtered);
  }, [apps, searchTerm, categoryFilter, statusFilter, dbFilter, sortColumn, sortDirection]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
};

  const handleRowClick = (app) => {
    navigate(`/apps/${app.Id}`);
  };

const handleViewDetails = async (app) => {
    setSelectedApp(app);
    setShowModal(true);
    setModalLoading(true);
    setModalError("");
    setAppDetails(null);
    setUserDetails(null);

    try {
      // Fetch app details and user details
      const [appData, userData] = await Promise.all([
        appService.getById(app.Id),
        userDetailsService.getById(app.UserId)
      ]);
      
      setAppDetails(appData);
      setUserDetails(userData);
    } catch (err) {
      setModalError(err.message || "Failed to load app details");
    } finally {
      setModalLoading(false);
    }
  };

const handleViewLogs = (app) => {
    navigate(`/logs?appId=${app.Id}`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApp(null);
    setAppDetails(null);
    setUserDetails(null);
    setModalError("");
};

const handleSalesStatusChange = async (appId, newStatus) => {
    try {
      await appService.update(appId, { sales_status: newStatus });
      setApps(prev => prev.map(app => 
        app.Id === appId ? { ...app, sales_status: newStatus } : app
      ));
      setFilteredApps(prev => prev.map(app => 
        app.Id === appId ? { ...app, sales_status: newStatus } : app
      ));
    } catch (err) {
      console.error('Failed to update sales status:', err);
    }
  };

  const getSalesStatusOptions = () => [
    { value: "Demo Scheduled", label: "Demo Scheduled" },
    { value: "Demo Completed", label: "Demo Completed" },
    { value: "Proposal Sent", label: "Proposal Sent" },
    { value: "Closed Won", label: "Closed Won" },
    { value: "Closed Lost", label: "Closed Lost" },
    { value: "Follow Up Schedule", label: "Follow Up Schedule" },
    { value: "No Contacted", label: "No Contacted" },
    { value: "Negotiating", label: "Negotiating" },
    { value: "Contract review", label: "Contract Review" }
  ];
  
const getUniqueCategories = () => {
    const categories = [...new Set(apps.map(app => app.app_category))];
    return categories.map(cat => ({ value: cat, label: cat }));
  };

  const getUniqueStatuses = () => {
    const statuses = [...new Set(apps.map(app => app.last_chat_analysis_status))];
    return statuses.map(status => ({ 
      value: status, 
      label: status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) 
    }));
  };
const columns = [
    {
      key: "app_name",
      label: "App Name",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.canvas_app_id}</div>
        </div>
      )
    },
    {
      key: "user_id",
      label: "User",
      sortable: false,
      render: (value, row) => {
        const userId = value?.Id || value;
        const user = usersMap[userId];
        if (!user) {
          return <span className="text-gray-400 text-sm">Loading...</span>;
        }
return (
          <div>
            <div className="font-medium text-gray-900">{user.Name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
            <div className="mt-1">
              <Badge 
                variant={user.plan === "Pro" ? "default" : user.plan === "Enterprise" ? "default" : user.plan === "Basic" ? "secondary" : "outline"}
              >
                {user.plan}
              </Badge>
            </div>
          </div>
        );
      }
    },
    {
      key: "app_category",
      label: "Category",
      sortable: true,
      render: (value) => (
        <Badge variant="secondary">{value}</Badge>
      )
    },
    {
      key: "last_chat_analysis_status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <StatusBadge status={value} type="chatAnalysis" />
      )
    },
{
      key: "is_db_connected",
      label: "DB Connected",
      render: (value) => (
        <div className="flex items-center">
          <ApperIcon
            name={value ? "CheckCircle" : "XCircle"}
            size={16}
            className={value ? "text-green-500" : "text-red-500"}
          />
          <span className={`ml-2 text-sm ${value ? "text-green-600" : "text-red-600"}`}>
            {value ? "Connected" : "Disconnected"}
          </span>
        </div>
      )
    },
    {
      key: "total_messages",
      label: "Messages",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-gray-600">{value}</span>
      )
    },
    {
      key: "last_message_at",
      label: "Last Activity",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-500">
          {value ? format(new Date(value), "MMM dd, yyyy HH:mm") : "Never"}
        </span>
      )
    },
    {
key: "sales_status",
      label: "Sales Status",
      sortable: false,
      render: (value, row) => (
        <Select
          value={value || "No Contacted"}
          onChange={(e) => {
            const newValue = e.target.value;
            const currentValue = value || "No Contacted";
            if (newValue !== currentValue) {
              handleSalesStatusChange(row.Id, newValue);
            }
          }}
          onClick={(e) => {
            const clickedValue = e.target.value;
            const currentValue = value || "No Contacted";
            if (clickedValue === currentValue) {
              e.preventDefault();
            }
          }}
          className="min-w-[160px]"
        >
          {getSalesStatusOptions().map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      )
    }
  ];
const actions = [
    {
      icon: "FileText",
      onClick: handleViewLogs
    },
    {
      icon: "Eye",
      onClick: handleViewDetails
    }
  ];

  const filters = [
    {
      placeholder: "All Categories",
      value: categoryFilter,
      onChange: (e) => setCategoryFilter(e.target.value),
      options: getUniqueCategories()
    },
    {
      placeholder: "All Statuses",
      value: statusFilter,
      onChange: (e) => setStatusFilter(e.target.value),
      options: getUniqueStatuses()
    },
    {
      placeholder: "All DB Status",
      value: dbFilter,
      onChange: (e) => setDbFilter(e.target.value),
      options: [
        { value: "connected", label: "Connected" },
        { value: "disconnected", label: "Disconnected" }
      ]
    }
  ];

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={fetchApps} />;

return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          searchPlaceholder="Search apps, categories..."
          filters={filters}
          showExport={true}
          showRefresh={true}
          onRefresh={fetchApps}
          onExport={() => {
            // Export functionality
            console.log("Export apps data");
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
<DataTable
          columns={columns}
          data={filteredApps}
          loading={loading}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onRowClick={handleRowClick}
          actions={actions}
          emptyMessage="No apps found"
          emptyDescription="No apps match your current filters. Try adjusting your search criteria."
        />
      </motion.div>

      {/* App Details Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={closeModal}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              closeModal();
            }
          }}
          tabIndex={-1}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
{/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                App Details - {selectedApp?.app_name}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="h-8 w-8 p-0"
              >
                <ApperIcon name="X" size={16} />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {modalLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : modalError ? (
                <div className="text-center py-12">
                  <ApperIcon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 mb-4">{modalError}</p>
                  <Button
                    onClick={() => handleViewDetails(selectedApp)}
                    variant="outline"
                  >
                    <ApperIcon name="RotateCcw" size={16} className="mr-2" />
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - App Information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">App Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">App ID</span>
                          <span className="text-sm font-mono text-gray-900">{selectedApp?.Id}</span>
                        </div>
                        
<div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">Category</span>
                          <Badge variant="secondary">{selectedApp?.app_category}</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">Canvas App ID</span>
                          <span className="text-sm font-mono text-gray-700">{selectedApp?.canvas_app_id}</span>
                        </div>
                        
<div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">Database Connection</span>
                          <div className="flex items-center">
                            <ApperIcon
                              name={selectedApp?.is_db_connected ? "CheckCircle" : "XCircle"}
                              size={16}
                              className={selectedApp?.is_db_connected ? "text-green-500" : "text-red-500"}
                            />
                            <span className={`ml-2 text-sm ${selectedApp?.is_db_connected ? "text-green-600" : "text-red-600"}`}>
                              {selectedApp?.is_db_connected ? "Connected" : "Disconnected"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Activity Section */}
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-4">Activity</h4>
                      <div className="space-y-4">
<div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <ApperIcon name="MessageSquare" size={16} className="text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-500">Total Messages</span>
                          </div>
                          <span className="text-sm font-mono text-gray-900">{selectedApp?.total_messages}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">Last Activity</span>
                          <span className="text-sm text-gray-700">
                            {selectedApp?.last_message_at ? format(new Date(selectedApp.last_message_at), "MMM dd, yyyy HH:mm") : "N/A"}
                          </span>
                        </div>
</div>
<div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">Chat Status</span>
                          <StatusBadge status={selectedApp?.last_chat_analysis_status} type="chatAnalysis" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">Last AI Scan</span>
                          <span className="text-sm text-gray-700">
                            {selectedApp?.last_ai_scan_date ? format(new Date(selectedApp.last_ai_scan_date), "MMM dd, yyyy") : "Never"}
                          </span>
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - User Information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                      <div className="space-y-4">
<div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <ApperIcon name="User" size={16} className="text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-500">Name</span>
                          </div>
                          <span className="text-sm text-gray-900">{userDetails?.Name || "Loading..."}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">Email</span>
                          <a
                            href={`mailto:${userDetails?.email}`}
                            className="text-sm text-primary-600 hover:text-primary-700 underline"
                          >
                            {userDetails?.email || "Loading..."}
                          </a>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">Plan</span>
                          <Badge 
                            variant={userDetails?.plan === "Pro" ? "default" : userDetails?.plan === "Basic" ? "secondary" : "outline"}
                          >
                            {userDetails?.plan || "Loading..."}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">Total Apps</span>
                          <span className="text-sm font-mono text-gray-900">{userDetails?.total_apps || "0"}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">Credits Used</span>
                          <span className="text-sm font-mono text-gray-900">{userDetails?.total_credits_used || "0"}</span>
                        </div>
                      </div>
                      </div>
                    </div>

                    {/* Timeline Section */}
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-4">Timeline</h4>
                      <div className="space-y-4">
<div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">Created</span>
                          <span className="text-sm text-gray-700">
                            {selectedApp?.created_at ? format(new Date(selectedApp.created_at), "MMM dd, yyyy") : "N/A"}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
<span className="text-sm font-medium text-gray-500">Sales Status</span>
                          <Badge 
                            variant={
                              selectedApp?.sales_status === "Demo Scheduled" ? "default" :
                              selectedApp?.sales_status === "Closed Won" ? "success" :
                              selectedApp?.sales_status === "Follow Up Schedule" ? "warning" : "secondary"
                            }
                          >
                            {selectedApp?.sales_status || "Unknown"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
</div>
  );
};

export default AppsOverview;