import { useState, useEffect } from "react";
import Chart from "react-apexcharts";

const StatusChart = ({ data = [], title = "Status Distribution" }) => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        type: "donut",
        height: 350,
      },
      labels: [],
      colors: [],
      legend: {
        position: "bottom",
        horizontalAlign: "center",
      },
      plotOptions: {
        pie: {
          donut: {
            size: "60%",
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val.toFixed(1)}%`,
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  });

  useEffect(() => {
    if (!data || data.length === 0) return;

    const statusColors = {
      positive: "#10b981",
      neutral: "#3b82f6", 
      struggle: "#f59e0b",
      critical: "#ef4444",
      help: "#f97316",
      technical: "#7c3aed",
      special: "#6b7280",
};

const groupedData = data.reduce((acc, item) => {
      const status = item.chat_analysis_status;
      // Convert to lowercase for consistent comparison
      const normalizedStatus = status?.toLowerCase();
      
      const positiveStatuses = ["smooth_progress", "learning_effectively", "feature_exploring", "goal_achieved", "highly_engaged"];
      const neutralStatuses = ["building_actively", "iterating", "experimenting", "success_breakthrough"];
      const helpStatuses = ["asking_questions", "needs_guidance", "requesting_examples", "seeking_alternatives", "documentation_needed"];
      const struggleStatuses = ["stuck", "confused", "repeating_issues", "frustrated", "going_in_circles"];
      const criticalStatuses = ["abandonment_risk", "completely_lost", "angry", "giving_up"];
      const technicalStatuses = ["debugging", "troubleshooting_db", "performance_issues", "integration_problems", "ready_for_upgrade", "hitting_limits"];
      const specialStatuses = ["feature_request", "off_topic", "inactive", "testing_limits", "copy_pasting"];
      
      let category;
      if (positiveStatuses.includes(normalizedStatus)) category = "positive";
      else if (neutralStatuses.includes(normalizedStatus)) category = "neutral";
      else if (helpStatuses.includes(normalizedStatus)) category = "help";
      else if (struggleStatuses.includes(normalizedStatus)) category = "struggle";
      else if (criticalStatuses.includes(normalizedStatus)) category = "critical";
      else if (technicalStatuses.includes(normalizedStatus)) category = "technical";
      else if (specialStatuses.includes(normalizedStatus)) category = "special";
      else category = "neutral";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(groupedData).map(key => 
      key.charAt(0).toUpperCase() + key.slice(1)
    );
    const series = Object.values(groupedData);
    const colors = Object.keys(groupedData).map(key => statusColors[key]);

    setChartData({
      series,
      options: {
        ...chartData.options,
        labels,
        colors,
      },
    });
  }, [data]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      {chartData.series.length > 0 ? (
        <Chart
          options={chartData.options}
          series={chartData.series}
          type="donut"
          height={350}
        />
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <p>No data available for chart</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusChart;