import Badge from "@/components/atoms/Badge";

const StatusBadge = ({ status, type = "default" }) => {
  const getStatusConfig = (status, type) => {
    if (type === "chatAnalysis") {
      const positiveStatuses = ["smooth_progress", "learning_effectively", "feature_exploring", "goal_achieved", "highly_engaged"];
      const neutralStatuses = ["building_actively", "iterating", "experimenting", "asking_questions"];
      const struggleStatuses = ["stuck", "confused", "repeating_issues", "frustrated", "going_in_circles"];
      const criticalStatuses = ["abandonment_risk", "completely_lost", "angry", "giving_up"];
      const helpStatuses = ["needs_guidance", "requesting_examples", "seeking_alternatives", "documentation_needed"];
      const technicalStatuses = ["debugging", "troubleshooting_db", "performance_issues", "integration_problems"];
      const specialStatuses = ["off_topic", "inactive", "testing_limits", "copy_pasting"];
      
      if (positiveStatuses.includes(status)) {
        return { variant: "positive", label: status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) };
      } else if (neutralStatuses.includes(status)) {
        return { variant: "neutral", label: status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) };
      } else if (struggleStatuses.includes(status)) {
        return { variant: "struggle", label: status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) };
      } else if (criticalStatuses.includes(status)) {
        return { variant: "critical", label: status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) };
      } else if (helpStatuses.includes(status)) {
        return { variant: "help", label: status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) };
      } else if (technicalStatuses.includes(status)) {
        return { variant: "technical", label: status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) };
} else if (specialStatuses.includes(status)) {
        return { variant: "special", label: status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) };
      }
    }
    
    if (type === "sales") {
      switch (status) {
        case "demo_scheduled":
          return { variant: "info", label: "Demo Scheduled" };
        case "demo_completed":
          return { variant: "primary", label: "Demo Completed" };
        case "proposal_sent":
          return { variant: "warning", label: "Proposal Sent" };
        case "closed_won":
          return { variant: "success", label: "Closed Won" };
        case "closed_lost":
          return { variant: "danger", label: "Closed Lost" };
        case "follow_up_required":
          return { variant: "neutral", label: "Follow Up Required" };
        default:
          return { variant: "default", label: status || "Unknown" };
      }
    }
    
    // Default status handling
    switch (status?.toLowerCase()) {
      case "active":
      case "connected":
      case "online":
        return { variant: "success", label: status };
      case "inactive":
      case "disconnected":
      case "offline":
        return { variant: "danger", label: status };
      case "pending":
      case "processing":
        return { variant: "warning", label: status };
      case "pro":
      case "premium":
        return { variant: "primary", label: status };
      case "free":
      case "basic":
        return { variant: "secondary", label: status };
      default:
        return { variant: "default", label: status || "Unknown" };
    }
  };

  const { variant, label } = getStatusConfig(status, type);

  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  );
};

export default StatusBadge;