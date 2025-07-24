import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import App from "@/App";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import StatusBadge from "@/components/molecules/StatusBadge";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import appService from "@/services/api/appService";
import salesCommentService from "@/services/api/salesCommentService";

const AppDetail = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Sales comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [currentSalesStatus, setCurrentSalesStatus] = useState("");
  
  // Comment modal state
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [commentForm, setCommentForm] = useState({
    comment: "",
    salesStatus: "demo_scheduled"
  });
  const fetchApp = async () => {
    try {
      setLoading(true);
      setError("");
      const id = parseInt(appId);
      if (isNaN(id)) {
        throw new Error("Invalid app ID");
      }
      const data = await appService.getById(id);
      if (!data) {
        throw new Error("App not found");
      }
      setApp(data);
    } catch (err) {
      setError(err.message || "Failed to load app details");
      toast.error(err.message || "Failed to load app details");
    } finally {
      setLoading(false);
    }
};

const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      setCommentsError("");
      const id = parseInt(appId);
      if (isNaN(id)) return;
      
      const data = await salesCommentService.getByAppId(id);
      setComments(data || []);
    } catch (err) {
      setCommentsError(err.message || "Failed to load comments");
    } finally {
      setCommentsLoading(false);
    }
  };

const handleUpdateSalesStatus = async (newStatus) => {
    try {
      const id = parseInt(appId);
      if (isNaN(id) || !newStatus) return;
      
      setCurrentSalesStatus(newStatus);
      
      // Update the app record with new sales status
      await appService.update(id, { sales_status: newStatus });
      
      // Update local app state to reflect the change
      setApp(prev => prev ? { ...prev, sales_status: newStatus } : null);
      
      toast.success("Sales status updated successfully");
    } catch (err) {
      // Revert local state on error
      setCurrentSalesStatus(app?.sales_status || "");
      toast.error(err.message || "Failed to update sales status");
    }
  };

const handleSaveComment = async () => {
    if (!commentForm.comment.trim()) return;
    
    try {
      setFormLoading(true);
      const id = parseInt(appId);
      if (isNaN(id)) return;

      const commentData = {
        app_id: id,
        comment: commentForm.comment.trim(),
        sales_status: commentForm.salesStatus,
        author_name: "Current User", // Replace with actual user
        author_avatar: "CU"
      };

      if (editingComment) {
        await salesCommentService.update(editingComment.Id, commentData);
        const updatedComment = await salesCommentService.getByAppId(id);
        setComments(updatedComment || []);
        toast.success("Comment updated successfully");
      } else {
const newComment = await salesCommentService.create(commentData);
        const updatedComments = await salesCommentService.getByAppId(id);
        setComments(updatedComments || []);
        toast.success("Comment added successfully");
      }

      handleCloseModal();
    } catch (err) {
      toast.error(err.message || "Failed to save comment");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditComment = (comment) => {
setEditingComment(comment);
    setCommentForm({
      comment: comment.comment,
      salesStatus: comment.sales_status
    });
    setShowCommentModal(true);
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
try {
      await salesCommentService.delete(commentId);
      const id = parseInt(appId);
      if (!isNaN(id)) {
        const updatedComments = await salesCommentService.getByAppId(id);
        setComments(updatedComments || []);
      }
      toast.success("Comment deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete comment");
    }
  };

  const handleCloseModal = () => {
    setShowCommentModal(false);
    setEditingComment(null);
    setCommentForm({
      comment: "",
      salesStatus: "demo_scheduled"
    });
  };

  useEffect(() => {
    fetchApp();
  }, [appId]);

useEffect(() => {
    if (app) {
      fetchComments();
      setCurrentSalesStatus(app.sales_status || "");
    }
  }, [app, appId]);

  const handleBack = () => {
    navigate("/apps");
  };

  const handleViewLogs = () => {
    navigate(`/logs?appId=${app.Id}`);
  };

  if (loading) return <Loading type="page" />;
  if (error) return <Error message={error} onRetry={fetchApp} />;
  if (!app) return <Error message="App not found" onRetry={fetchApp} />;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center space-x-2 text-sm text-gray-500"
      >
        <button
          onClick={handleBack}
          className="hover:text-gray-700 flex items-center space-x-1"
        >
          <ApperIcon name="ArrowLeft" size={16} />
          <span>Apps</span>
        </button>
<ApperIcon name="ChevronRight" size={16} />
        <span className="text-gray-900 font-medium">{app.app_name}</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-start justify-between">
<div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{app.app_name}</h1>
              <Badge variant="secondary">{app.app_category}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
<span className="font-medium text-gray-500">App ID:</span>
                <div className="font-mono text-gray-900">{app.canvas_app_id}</div>
              </div>
              <div>
                <span className="font-medium text-gray-500">Status:</span>
                <div className="mt-1">
                  <StatusBadge status={app.last_chat_analysis_status} type="chatAnalysis" />
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-500">Database:</span>
                <div className="flex items-center mt-1">
                  <ApperIcon
                    name={app.is_db_connected ? "CheckCircle" : "XCircle"}
                    size={16}
                    className={app.is_db_connected ? "text-green-500" : "text-red-500"}
                  />
                  <span className={`ml-2 ${app.is_db_connected ? "text-green-600" : "text-red-600"}`}>
                    {app.is_db_connected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleViewLogs}
              className="flex items-center space-x-2"
            >
              <ApperIcon name="FileText" size={16} />
              <span>View Logs</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <ApperIcon name="ArrowLeft" size={16} />
              <span>Back to Apps</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Details Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Activity Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ApperIcon name="BarChart3" size={20} className="mr-2" />
            Activity Statistics
          </h3>
<div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
              <span className="text-gray-600">Total Messages</span>
              <span className="font-mono font-semibold text-gray-900">
                {app.total_messages.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
              <span className="text-gray-600">Last Activity</span>
              <span className="text-gray-900">
                {format(new Date(app.last_message_at), "MMM dd, yyyy 'at' HH:mm")}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
              <span className="text-gray-600">Created</span>
              <span className="text-gray-900">
                {app.created_at ? format(new Date(app.created_at), "MMM dd, yyyy") : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Technical Info */}

        {/* Technical Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ApperIcon name="Settings" size={20} className="mr-2" />
            Technical Information
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
<span className="text-gray-600">App Category</span>
              <Badge variant="secondary">{app.app_category}</Badge>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
              <span className="text-gray-600">Analysis Status</span>
              <StatusBadge status={app.last_chat_analysis_status} type="chatAnalysis" />
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
              <span className="text-gray-600">Database Connection</span>
              <div className="flex items-center">
                <ApperIcon
                  name={app.is_db_connected ? "CheckCircle" : "XCircle"}
                  size={16}
                  className={app.is_db_connected ? "text-green-500" : "text-red-500"}
                />
                <span className={`ml-2 ${app.is_db_connected ? "text-green-600" : "text-red-600"}`}>
                  {app.is_db_connected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ApperIcon name="Zap" size={20} className="mr-2" />
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleViewLogs}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="FileText" size={16} />
            <span>View Activity Logs</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.info("Feature coming soon")}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Download" size={16} />
            <span>Export Data</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.info("Feature coming soon")}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="RefreshCw" size={16} />
            <span>Refresh Analysis</span>
          </Button>
</div>
      </motion.div>

      {/* Sales Comments & Status Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ApperIcon name="MessageSquare" size={20} className="mr-2" />
            Sales Comments & Status
          </h3>
          <div className="flex items-center space-x-3">
            {currentSalesStatus && (
              <StatusBadge status={currentSalesStatus} type="sales" />
            )}
            <Button
              onClick={() => setShowCommentModal(true)}
              size="sm"
              className="flex items-center space-x-2"
            >
              <ApperIcon name="Plus" size={16} />
              <span>Add Comment</span>
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Update Sales Status
          </label>
          <Select
            value={currentSalesStatus}
            onChange={(e) => handleUpdateSalesStatus(e.target.value)}
            className="w-64"
          >
            <option value="">Select status...</option>
            <option value="demo_scheduled">Demo Scheduled</option>
            <option value="demo_completed">Demo Completed</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="closed_won">Closed Won</option>
            <option value="closed_lost">Closed Lost</option>
            <option value="follow_up_required">Follow Up Required</option>
          </Select>
        </div>

        {commentsLoading ? (
          <Loading type="card" />
        ) : commentsError ? (
          <Error message={commentsError} onRetry={fetchComments} showRetry={true} />
        ) : (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              Comments ({comments.length})
            </h4>
            
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ApperIcon name="MessageSquare" size={48} className="mx-auto mb-3 opacity-50" />
                <p>No comments yet. Add the first comment to track sales progress.</p>
              </div>
            ) : (
<div className="space-y-4">
                {comments
                  .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt))
                  .map((comment) => (
                    <div
                      key={comment.Id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {comment.author_avatar}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {comment.author_name}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <StatusBadge status={comment.sales_status} type="sales" />
                              <span>•</span>
                              <span>{format(new Date(comment.created_at), "MMM dd, yyyy 'at' h:mm a")}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <ApperIcon name="Edit2" size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.Id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <ApperIcon name="Trash2" size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700">{comment.comment}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-lg"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingComment ? "Edit Comment" : "Add New Comment"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {formLoading ? (
                <Loading type="modal" />
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sales Status
                    </label>
                    <Select
                      value={commentForm.salesStatus}
                      onChange={(e) => setCommentForm(prev => ({ ...prev, salesStatus: e.target.value }))}
                    >
                      <option value="demo_scheduled">Demo Scheduled</option>
                      <option value="demo_completed">Demo Completed</option>
                      <option value="proposal_sent">Proposal Sent</option>
                      <option value="closed_won">Closed Won</option>
                      <option value="closed_lost">Closed Lost</option>
                      <option value="follow_up_required">Follow Up Required</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comment <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={commentForm.comment}
                      onChange={(e) => setCommentForm(prev => ({ ...prev, comment: e.target.value }))}
                      className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      placeholder="Enter your comment about the sales progress..."
                    />
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={handleCloseModal}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveComment}
                disabled={formLoading || !commentForm.comment.trim()}
              >
                {formLoading ? (
                  <>
                    <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Save" size={16} className="mr-2" />
                    {editingComment ? "Update" : "Add"} Comment
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AppDetail;