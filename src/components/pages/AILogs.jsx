import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import DataTable from "@/components/organisms/DataTable";
import FilterBar from "@/components/molecules/FilterBar";
import StatusBadge from "@/components/molecules/StatusBadge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import appAILogService from "@/services/api/appAILogService";
import appService from "@/services/api/appService";

const AILogs = () => {
  const [searchParams] = useSearchParams();
  const [logs, setLogs] = useState([]);
  const [apps, setApps] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [appFilter, setAppFilter] = useState(searchParams.get("appId") || "");
  const [sortColumn, setSortColumn] = useState("CreatedAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [logsData, appsData] = await Promise.all([
        appAILogService.getAll(),
        appService.getAll()
      ]);
      setLogs(logsData || []);
      setApps(appsData || []);
    } catch (err) {
      setError(err.message || "Failed to load AI logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...logs];

    // Apply search filter
if (searchTerm) {
      filtered = filtered.filter(log =>
        log.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.chat_analysis_status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

// Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(log => log.chat_analysis_status === statusFilter);
    }

    // Apply app filter
    if (appFilter) {
      const appId = parseInt(appFilter);
      filtered = filtered.filter(log => log.app_id?.Id === appId || log.app_id === appId);
    }

    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
let aValue = a[sortColumn];
        let bValue = b[sortColumn];

        if (sortColumn === "created_at") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else if (typeof aValue === "string") {
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

    setFilteredLogs(filtered);
  }, [logs, searchTerm, statusFilter, appFilter, sortColumn, sortDirection]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
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
          data={filteredLogs}
          loading={loading}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          emptyMessage="No AI logs found"
          emptyDescription="No logs match your current filters. Try adjusting your search criteria."
        />
      </motion.div>
    </div>
  );
};

export default AILogs;