import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import DateRangeFilter from "@/components/atoms/DateRangeFilter";
import "@/index.css";
import userDetailsService from "@/services/api/userDetailsService";
import appService from "@/services/api/appService";
import ApperIcon from "@/components/ApperIcon";
import FilterBar from "@/components/molecules/FilterBar";
import StatusBadge from "@/components/molecules/StatusBadge";
import DataTable from "@/components/organisms/DataTable";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
const AppsOverview = () => {
const navigate = useNavigate();
const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
const [dbFilter, setDbFilter] = useState("");
  const [dateFilterMode, setDateFilterMode] = useState("custom");
  const [dateFrom, setDateFrom] = useState(null);
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [usersMap, setUsersMap] = useState({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [appDetails, setAppDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

// Fetch apps data with pagination and filters
const fetchApps = async () => {
    setLoading(true);
    setError("");
    
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Build where conditions based on filters
const whereConditions = [];

      // Date range filter
if (dateFrom) {
        whereConditions.push({
          FieldName: "last_message_at",
          Operator: "GreaterThanOrEqualTo",
          Values: [dateFrom + "T00:00:00"],
          Include: true
        });
        whereConditions.push({
          FieldName: "last_message_at",
          Operator: "LessThanOrEqualTo",
          Values: [dateFrom + "T23:59:59"],
          Include: true
        });
      }
      
      // Enhanced search: search by app name OR user email
      // For email search, we need to first find users with matching emails, then search apps by those user IDs
      let userIdsFromEmailSearch = [];
      
      if (searchTerm) {
        // Check if searchTerm contains '@' to determine if it might be an email search
        if (searchTerm.includes('@')) {
          try {
            // First, search for users with matching emails
            const userSearchResponse = await userDetailsService.searchByEmail(searchTerm);
            if (userSearchResponse && userSearchResponse.length > 0) {
              userIdsFromEmailSearch = userSearchResponse.map(user => user.Id);
              console.log('ids :', userIdsFromEmailSearch);
            }
          } catch (emailSearchError) {
            console.warn("Email search failed, proceeding with app name search only:", emailSearchError);
          }
        }
      }
      
      const searchGroups = [];
      if (searchTerm) {
        const searchSubGroups = [];
        if (userIdsFromEmailSearch.length > 0) {
          searchSubGroups.push({
            "conditions": [
              {
                "fieldName": "user_id",
                "operator": "ExactMatch",
                "values": userIdsFromEmailSearch
              }
            ],
            "operator": "AND"
          });
        } else {
          searchSubGroups.push({
              "conditions": [
                {
                  "fieldName": "app_name",
                  "operator": "Contains",
                  "values": [searchTerm]
                }
              ],
              "operator": "AND"
            })
        }
        // const searchSubGroups = [
        //   {
        //     "conditions": [
        //       {
        //         "fieldName": "app_name",
        //         "operator": "Contains",
        //         "values": [searchTerm]
        //       }
        //     ],
        //     "operator": "AND"
        //   }
        // ];
        
        // If we found users from email search, add them to the search
        // if (userIdsFromEmailSearch.length > 0) {
        //   searchSubGroups.push({
        //     "conditions": [
        //       {
        //         "fieldName": "user_id",
        //         "operator": "ExactMatch",
        //         "values": userIdsFromEmailSearch
        //       }
        //     ],
        //     "operator": "AND"
        //   });
        // }
        
        searchGroups.push({
          "operator": "OR",
          "subGroups": searchSubGroups
        });
      }
      
      
      if (statusFilter) {
        whereConditions.push({
          "FieldName": "last_chat_analysis_status",
          "Operator": "EqualTo",
          "Values": [statusFilter]
        });
      }
      
      if (dbFilter) {
        whereConditions.push({
          "FieldName": "is_db_connected",
          "Operator": "EqualTo",
          "Values": [dbFilter === "connected"]
        });
      }

      const params = {
        "fields": [
          { "field": { "Name": "app_name" } },
          { "field": { "Name": "app_category" } },
          { "field": { "Name": "is_db_connected" } },
          { "field": { "Name": "total_messages" } },
          { "field": { "Name": "last_message_at" } },
          { "field": { "Name": "last_chat_analysis_status" } },
          { "field": { "Name": "created_at" } },
          { "field": { "Name": "sales_status" } },
          { "field": { "Name": "user_id" } }
        ],
        "where": whereConditions,
"where": whereConditions.length > 0 ? whereConditions : undefined,
        "whereGroups": searchGroups,
        "orderBy": sortColumn ? [{
          "fieldName": sortColumn,
          "sorttype": sortDirection.toUpperCase()
        }] : [{ "fieldName": "created_at", "sorttype": "DESC" }],
        "pagingInfo": {
          "limit": itemsPerPage,
          "offset": (currentPage - 1) * itemsPerPage
        }
      };

      const response = await apperClient.fetchRecords("app", params);
      console.log('response in search :', response);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      setApps(response.data || []);
      setTotalItems(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));

      // Fetch user details for lookup fields
      if (response.data && response.data.length > 0) {
        const userIds = [...new Set(response.data.map(app => app.user_id?.Id || app.user_id).filter(Boolean))];
        if (userIds.length > 0) {
          const usersResponse = await userDetailsService.getByIds(userIds);
          const userMap = {};
          usersResponse.forEach(user => {
            userMap[user.Id] = user;
          });
          setUsersMap(userMap);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to fetch apps");
      console.error("Error fetching apps:", err);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    fetchApps();
}, [currentPage, itemsPerPage, statusFilter, dbFilter, sortColumn, sortDirection, dateFrom]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
};
const handleSearch = () => {
    fetchApps();
  };

const handleDateChange = (date) => {
    setDateFrom(date);
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
        userDetailsService.getById(app.user_id?.Id || app.user_id)
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
  

const getUniqueStatuses = () => {
    // Return all possible status values from the database schema for last_chat_analysis_status
    // This ensures all options are available even when filters are applied
    const allStatuses = [
      "SMOOTH_PROGRESS",
      "LEARNING_EFFECTIVELY",
      "FEATURE_EXPLORING",
      "GOAL_ACHIEVED",
      "HIGHLY_ENGAGED",
      "BUILDING_ACTIVELY",
      "ITERATING",
      "EXPERIMENTING",
      "SUCCESS_BREAKTHROUGH",
      "ASKING_QUESTIONS",
      "NEEDS_GUIDANCE",
      "REQUESTING_EXAMPLES",
      "SEEKING_ALTERNATIVES",
      "DOCUMENTATION_NEEDED",
      "STUCK",
      "CONFUSED",
      "REPEATING_ISSUES",
      "FRUSTRATED",
      "GOING_IN_CIRCLES",
      "ABANDONMENT_RISK",
      "COMPLETELY_LOST",
      "ANGRY",
      "GIVING_UP",
      "DEBUGGING",
      "TROUBLESHOOTING_DB",
      "PERFORMANCE_ISSUES",
      "INTEGRATION_PROBLEMS",
      "READY_FOR_UPGRADE",
      "HITTING_LIMITS",
      "FEATURE_REQUEST",
      "OFF_TOPIC",
      "INACTIVE",
      "TESTING_LIMITS",
      "COPY_PASTING"
    ];
    
    return allStatuses.map(status => ({ 
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
          searchPlaceholder="Search apps..."
          filters={filters}
          showExport={true}
          showRefresh={true}
          showSearchButton={true}
          onSearchClick={handleSearch}
          onRefresh={fetchApps}
          onExport={() => {
            // Export functionality
            console.log("Export apps data");
          }}
        >
<DateRangeFilter onChange={handleDateChange} dateFrom={dateFrom} />
        </FilterBar>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
<DataTable
          columns={columns}
          data={apps}
          loading={loading}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onRowClick={handleRowClick}
          actions={actions}
          emptyMessage="No apps found"
          emptyDescription="No apps match your current filters. Try adjusting your search criteria."
          // Pagination props
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
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