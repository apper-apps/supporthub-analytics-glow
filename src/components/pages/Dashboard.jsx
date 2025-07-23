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
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [usersData, appsData, logsData] = await Promise.all([
        userDetailsService.getAll(),
        appService.getAll(),
        appAILogService.getRecent(20)
      ]);
      
      setUsers(usersData || []);
      setApps(appsData || []);
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
const criticalStatuses = ["abandonment_risk", "completely_lost", "angry", "giving_up"];
    const criticalIssues = logs.filter(log => criticalStatuses.includes(log.chat_analysis_status)).length;
    const activeSessions = apps.filter(app => {
      const lastMessage = new Date(app.last_message_at);
      const now = new Date();
      const hoursDiff = (now - lastMessage) / (1000 * 60 * 60);
      return hoursDiff < 24;
    }).length;

    return [
      {
        title: "Total Users",
        value: users.length,
        icon: "Users",
        color: "blue",
        change: "+12%",
        changeType: "positive",
        trend: "up"
      },
      {
        title: "Total Apps",
        value: apps.length,
        icon: "Grid3X3",
        color: "green",
        change: "+8%",
        changeType: "positive",
        trend: "up"
      },
      {
        title: "Critical Issues",
        value: criticalIssues,
        icon: "AlertTriangle",
        color: "red",
        change: criticalIssues > 0 ? "-5%" : "0%",
        changeType: criticalIssues > 0 ? "negative" : "neutral",
        trend: criticalIssues > 0 ? "down" : "neutral"
      },
      {
        title: "Active Sessions",
        value: activeSessions,
        icon: "Activity",
        color: "purple",
        change: "+15%",
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