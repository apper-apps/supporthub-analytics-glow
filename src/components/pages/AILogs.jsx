import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import AILogDetailModal from '@/components/organisms/AILogDetailModal'
import AppAILogService from '@/services/api/appAILogService'
const appAILogService = new AppAILogService()
import { toast } from 'react-toastify'
import FilterBar from '@/components/molecules/FilterBar'
import StatusBadge from '@/components/molecules/StatusBadge'
import DataTable from '@/components/organisms/DataTable'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'

function AILogs() {
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
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal state
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

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
            { "field": { "Name": "app_name" } }
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

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, statusFilter, appFilter, sortColumn, sortDirection]);

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

  const openModal = async (log) => {
    try {
      setSelectedLogId(log.Id);
      setModalOpen(true);
      setModalLoading(true);
      setModalError(null);

      const detailedLog = await appAILogService.getById(log.Id);
      if (detailedLog) {
        setSelectedLog(detailedLog);
      } else {
        setModalError('Log details not found');
      }
    } catch (error) {
      console.error('Error fetching log details:', error);
      setModalError('Failed to load log details');
      toast.error('Failed to load log details');
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedLogId(null);
    setSelectedLog(null);
    setModalError(null);
    setModalLoading(false);
  };

const getAppName = (appId) => {
    const app = apps.find(a => a.Id === appId);
    return app ? app.app_name : `App ${appId}`;
  };

const getUniqueStatuses = () => {
    const statuses = [...new Set(logs.map(log => log.chat_analysis_status))];
    return statuses.map(status => ({ 
      value: status, 
      label: status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) 
    }));
  };

const getUniqueApps = () => {
    return apps.map(app => ({ value: app.Id.toString(), label: app.app_name }));
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
            App: {getAppName(row.app_id?.Id || row.app_id)}
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
          onRowClick={openModal}
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
      <AILogDetailModal
        isOpen={modalOpen}
        onClose={closeModal}
        log={selectedLog}
        loading={modalLoading}
        error={modalError}
      />
    </div>
  );
};

export default AILogs;