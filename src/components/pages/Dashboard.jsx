import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardMetrics from "@/components/organisms/DashboardMetrics";
import ActivityFeed from "@/components/organisms/ActivityFeed";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import userDetailsService from "@/services/api/userDetailsService";
import appService from "@/services/api/appService";
import appAILogService from "@/services/api/appAILogService";

const Dashboard = () => {
const [users, setUsers] = useState([]);
  const [apps, setApps] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalApps, setTotalApps] = useState(0);
  const [criticalIssuesCount, setCriticalIssuesCount] = useState(0);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [usersResponse, appsResponse, criticalCount, logsData] = await Promise.all([
        userDetailsService.getAll(),
        appService.getAll(),
        appService.getCriticalIssuesCount(),
        appAILogService.getRecent(20)
      ]);
      
      // Handle enhanced service responses with data and total properties
      setUsers(usersResponse?.data || []);
      setApps(appsResponse?.data || []);
      setTotalUsers(usersResponse?.total || 0);
      setTotalApps(appsResponse?.total || 0);
      setCriticalIssuesCount(criticalCount);
      setLogs(logsData || []);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

const calculateMetrics = () => {
    return [
      {
        title: "Total Users",
        value: totalUsers, // Use total from API response instead of array length
        icon: "Users",
        color: "blue",
        change: "+12%",
        changeType: "positive",
        trend: "up"
      },
      {
        title: "Total Apps",
        value: totalApps, // Use total from API response instead of array length
        icon: "Grid3X3",
        color: "green",
        change: "+8%",
        changeType: "positive",
        trend: "up"
      },
      {
        title: "Critical Issues",
        value: criticalIssuesCount, // Use count from database aggregation
        icon: "AlertTriangle",
        color: "red",
        change: criticalIssuesCount > 0 ? "-5%" : "0%",
        changeType: criticalIssuesCount > 0 ? "negative" : "neutral",
        trend: criticalIssuesCount > 0 ? "down" : "neutral"
      }
    ];
  };

  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={fetchDashboardData} />;

  const metrics = calculateMetrics();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <DashboardMetrics metrics={metrics} />
      </motion.div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <ActivityFeed activities={logs} />
        </motion.div>

        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {/* Right column for additional dashboard widgets */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <div className="text-center py-8">
                <div className="text-gray-400 text-sm">Additional dashboard widgets can be added here</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;