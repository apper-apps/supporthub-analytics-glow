import { motion } from "framer-motion";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import StatusBadge from "@/components/molecules/StatusBadge";

const ActivityFeed = ({ activities = [] }) => {
  const getActivityIcon = (status) => {
    const positiveStatuses = ["smooth_progress", "learning_effectively", "feature_exploring", "goal_achieved", "highly_engaged"];
    const criticalStatuses = ["abandonment_risk", "completely_lost", "angry", "giving_up"];
    const helpStatuses = ["needs_guidance", "requesting_examples", "seeking_alternatives", "documentation_needed"];
    
    if (positiveStatuses.includes(status)) return "CheckCircle";
    if (criticalStatuses.includes(status)) return "AlertTriangle";
    if (helpStatuses.includes(status)) return "HelpCircle";
    return "MessageSquare";
  };

  const getActivityColor = (status) => {
    const positiveStatuses = ["smooth_progress", "learning_effectively", "feature_exploring", "goal_achieved", "highly_engaged"];
    const criticalStatuses = ["abandonment_risk", "completely_lost", "angry", "giving_up"];
    const helpStatuses = ["needs_guidance", "requesting_examples", "seeking_alternatives", "documentation_needed"];
    
    if (positiveStatuses.includes(status)) return "text-green-600";
    if (criticalStatuses.includes(status)) return "text-red-600";
    if (helpStatuses.includes(status)) return "text-orange-600";
    return "text-blue-600";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <ApperIcon name="Activity" size={20} className="text-gray-400" />
      </div>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <ApperIcon name="Clock" size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.slice(0, 6).map((activity, index) => (
            <motion.div
              key={activity.Id}
              className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className={`flex-shrink-0 ${getActivityColor(activity.chat_analysis_status)}`}>
                <ApperIcon name={getActivityIcon(activity.chat_analysis_status)} size={20} />
              </div>
              
              <div className="flex-1 min-w-0">
<div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.summary}
                  </p>
                  <span className="text-xs text-gray-500 ml-2">
                    {activity.created_at && !isNaN(new Date(activity.created_at)) 
                      ? format(new Date(activity.created_at), "HH:mm")
                      : "N/A"
                    }
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <StatusBadge status={activity.chat_analysis_status} type="chatAnalysis" />
                  {activity.sentiment_score && (
                    <span className="text-xs text-gray-500">
                      Sentiment: {activity.sentiment_score.toFixed(1)}
                    </span>
                  )}
                  {activity.frustration_level && (
                    <span className="text-xs text-gray-500">
                      Frustration: {activity.frustration_level}/5
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;