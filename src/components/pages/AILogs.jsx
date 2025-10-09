import "@/index.css";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import FilterBar from "@/components/molecules/FilterBar";
import StatusBadge from "@/components/molecules/StatusBadge";
import DataTable from "@/components/organisms/DataTable";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

const AILogs = () => {
  const [searchParams] = useSearchParams();
  const [logs, setLogs] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [appFilter, setAppFilter] = useState(searchParams.get("appId") || "");
  const [sortColumn, setSortColumn] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  
  // Pagination state
const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [dateMode, setDateMode] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch data with pagination and filters
// Fetch data with pagination and filters
  const fetchData = async () => {
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
      
      if (searchTerm) {
        whereConditions.push({
          "FieldName": "summary",
          "Operator": "Contains",
          "Values": [searchTerm]
        });
      }
      
      if (statusFilter) {
        whereConditions.push({
          "FieldName": "chat_analysis_status",
          "Operator": "EqualTo",
          "Values": [statusFilter]
        });
      }
      
      if (appFilter) {
        whereConditions.push({
          "FieldName": "app_id",
          "Operator": "EqualTo",
          "Values": [parseInt(appFilter)]
        });
      }

      // Add date range filters
      if (dateFrom) {
        whereConditions.push({
          "FieldName": "created_at",
          "Operator": "GreaterThanOrEqualTo",
          "Values": [dateFrom]
        });
      }

      if (dateTo) {
        whereConditions.push({
          "FieldName": "created_at",
          "Operator": "LessThanOrEqualTo",
          "Values": [dateTo]
        });
      }
      const params = {
        "fields": [
          { "field": { "Name": "summary" } },
          { "field": { "Name": "created_at" } },
          { "field": { "Name": "chat_analysis_status" } },
          { "field": { "Name": "sentiment_score" } },
          { "field": { "Name": "frustration_level" } },
          { "field": { "Name": "technical_complexity" } },
          { "field": { "Name": "model_used" } },
          { "field": { "Name": "app_id" } }
        ],
        "where": whereConditions,
        "orderBy": sortColumn ? [{
          "fieldName": sortColumn,
          "sorttype": sortDirection.toUpperCase()
        }] : [{ "fieldName": "created_at", "sorttype": "DESC" }],
        "pagingInfo": {
          "limit": itemsPerPage,
          "offset": (currentPage - 1) * itemsPerPage
        }
      };

const [logsResponse, appsResponse] = await Promise.all([
        apperClient.fetchRecords("app_ai_log", params),
        apperClient.fetchRecords("app", {
          "fields": [
            { "field": { "Name": "Name" } }
          ]
        })
      ]);
      
      if (!logsResponse.success) {
        throw new Error(logsResponse.message);
      }

      setLogs(logsResponse.data || []);
      setTotalItems(logsResponse.total || 0);
      setTotalPages(Math.ceil((logsResponse.total || 0) / itemsPerPage));
      
      if (appsResponse.success) {
        setApps(appsResponse.data || []);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch AI logs");
      console.error("Error fetching AI logs:", err);
    } finally {
      setLoading(false);
    }
  };

const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
    fetchData();
  };

const handleDateRangeChange = (from, to, month, week) => {
    setDateFrom(from);
    setDateTo(to);
    setSelectedMonth(month || '');
    setSelectedWeek(week || '');
    setCurrentPage(1); // Reset to first page when date range changes
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, statusFilter, appFilter, sortColumn, sortDirection, dateFrom, dateTo]);
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

  // Handle row click to open modal
  const handleRowClick = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedLog(null);
  };
  const getAppName = (appId) => {
    const app = apps.find(a => a.Id === appId);
    return app ? app.Name : `App ${appId}`;
  };

const getUniqueStatuses = () => {
    const statuses = [...new Set(logs.map(log => log.chat_analysis_status))];
    return statuses.map(status => ({ 
      value: status, 
      label: status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) 
    }));
  };

const getUniqueApps = () => {
    // Get unique app IDs from current logs
    const uniqueAppIds = [...new Set(logs.map(log => log.app_id?.Id || log.app_id).filter(Boolean))];
    // Filter apps to only show those that have AI logs
    return apps
      .filter(app => uniqueAppIds.includes(app.Id))
      .map(app => ({ value: app.Id.toString(), label: app.app_name }));
  };

const columns = [
    {
      key: "summary",
      label: "Summary",
      sortable: true,
      render: (value, row) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900 mb-1 line-clamp-2">{value}</div>
          <div className="text-xs text-gray-500">
            App: {row.app_id?.Name}
          </div>
        </div>
      )
    },
{
      key: "created_at",
      label: "Created At",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-500">
          {format(new Date(value), "MMM dd, yyyy HH:mm")}
        </span>
      )
    },
    {
      key: "chat_analysis_status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <StatusBadge status={value} type="chatAnalysis" />
      )
    },
{
      key: "sentiment_score",
      label: "Sentiment",
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          <span className={`font-mono text-sm ${
            value > 0.3 ? "text-green-600" : 
            value < -0.3 ? "text-red-600" : "text-gray-600"
          }`}>
            {value?.toFixed(2) || "N/A"}
          </span>
        </div>
      )
    },
    {
      key: "frustration_level",
      label: "Frustration",
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          <span className={`font-mono text-sm ${
            value >= 4 ? "text-red-600" : 
            value >= 3 ? "text-yellow-600" : "text-green-600"
          }`}>
            {value || 0}/5
          </span>
        </div>
      )
    },
    {
      key: "technical_complexity",
      label: "Complexity",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm text-gray-600">
          {value || 0}/5
        </span>
      )
    },
    {
      key: "model_used",
      label: "Model",
      sortable: true,
      render: (value) => (
        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-md">
          {value}
        </span>
      )
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
      placeholder: "All Apps",
      value: appFilter,
      onChange: (e) => setAppFilter(e.target.value),
      options: getUniqueApps()
    }
  ];

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={fetchData} />;

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
          searchPlaceholder="Search summaries, status..."
          filters={filters}
          showDateFilter={true}
          dateFrom={dateFrom}
dateTo={dateTo}
          dateMode={dateMode}
          onDateRangeChange={handleDateRangeChange}
          selectedMonth={selectedMonth}
          selectedWeek={selectedWeek}
          showExport={true}
          showRefresh={true}
          showSearchButton={true}
          onSearchClick={handleSearch}
          onRefresh={fetchData}
          onExport={() => {
            // Export functionality
            console.log("Export logs data");
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
          data={logs}
          loading={loading}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onRowClick={handleRowClick}
          emptyMessage="No AI logs found"
          emptyDescription="No logs match your current filters. Try adjusting your search criteria."
          // Pagination props
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </motion.div>

      {/* AI Log Detail Modal */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">AI Log Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Summary Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{selectedLog.summary}</p>
                </div>
              </div>

              {/* App Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">App Information</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="font-medium text-blue-900">App:</span>
                    <span className="ml-2 text-blue-700">
                      {getAppName(selectedLog.app_id?.Id || selectedLog.app_id)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Analysis Metrics */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Analysis Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Status */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500 mb-2">Status</div>
                    <StatusBadge status={selectedLog.chat_analysis_status} type="chatAnalysis" />
                  </div>

                  {/* Sentiment Score */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500 mb-2">Sentiment Score</div>
                    <div className="flex items-center">
                      <span className={`font-mono text-lg font-semibold ${
                        selectedLog.sentiment_score > 0.3 ? "text-green-600" : 
                        selectedLog.sentiment_score < -0.3 ? "text-red-600" : "text-gray-600"
                      }`}>
                        {selectedLog.sentiment_score?.toFixed(2) || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Frustration Level */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500 mb-2">Frustration Level</div>
                    <div className="flex items-center">
                      <span className={`font-mono text-lg font-semibold ${
                        selectedLog.frustration_level >= 4 ? "text-red-600" : 
                        selectedLog.frustration_level >= 3 ? "text-yellow-600" : "text-green-600"
                      }`}>
                        {selectedLog.frustration_level || 0}/5
                      </span>
                    </div>
                  </div>

                  {/* Technical Complexity */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500 mb-2">Technical Complexity</div>
                    <div className="flex items-center">
                      <span className="font-mono text-lg font-semibold text-gray-600">
                        {selectedLog.technical_complexity || 0}/5
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Technical Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Model Used */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500 mb-2">Model Used</div>
                    <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-md font-mono text-sm">
                      {selectedLog.model_used}
                    </span>
                  </div>

                  {/* Created At */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500 mb-2">Created At</div>
                    <span className="text-gray-700 font-medium">
                      {format(new Date(selectedLog.created_at), "MMM dd, yyyy 'at' HH:mm")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Information */}
              {selectedLog.error_message && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Error Information</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="font-medium text-red-800 mb-1">Error Message</div>
                        <p className="text-red-700">{selectedLog.error_message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AILogs;