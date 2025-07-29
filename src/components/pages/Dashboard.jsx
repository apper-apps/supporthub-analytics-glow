import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardMetrics from "@/components/organisms/DashboardMetrics";
import ActivityFeed from "@/components/organisms/ActivityFeed";
import StatusChart from "@/components/organisms/StatusChart";
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
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [usersResponse, appsResponse, logsData] = await Promise.all([
        userDetailsService.getAll(),
        appService.getAll(),
        appAILogService.getRecent(20)
      ]);
      
      // Handle enhanced service responses with data and total properties
      setUsers(usersResponse?.data || []);
      setApps(appsResponse?.data || []);
      setTotalUsers(usersResponse?.total || 0);
      setTotalApps(appsResponse?.total || 0);
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
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <StatusChart data={logs} title="Chat Analysis Status" />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;