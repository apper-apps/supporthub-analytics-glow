import { motion } from "framer-motion";
import MetricCard from "@/components/molecules/MetricCard";

const DashboardMetrics = ({ metrics }) => {
const defaultMetrics = [
    { title: "Total Users", value: 0, icon: "Users", color: "blue", change: "0%", changeType: "neutral" },
    { title: "Total Apps", value: 0, icon: "Grid3X3", color: "green", change: "0%", changeType: "neutral" },
    { title: "Critical Issues", value: 0, icon: "AlertTriangle", color: "red", change: "0%", changeType: "neutral" },
    { title: "Active Sessions", value: 0, icon: "Activity", color: "purple", change: "0%", changeType: "neutral" },
  ];

  const displayMetrics = metrics || defaultMetrics;

  return (
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {displayMetrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <MetricCard
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
            change={metric.change}
            changeType={metric.changeType}
            trend={metric.trend}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardMetrics;