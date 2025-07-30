import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import StatusBadge from '@/components/molecules/StatusBadge';
import Loading from '@/components/ui/Loading';

const AILogDetailModal = ({
  isOpen,
  onClose,
  log,
  loading,
  error
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'smooth_progress': 'bg-green-100 text-green-800',
      'needs_guidance': 'bg-yellow-100 text-yellow-800',
      'frustrated': 'bg-red-100 text-red-800',
      'building_actively': 'bg-blue-100 text-blue-800',
      'goal_achieved': 'bg-green-100 text-green-800',
      'abandonment_risk': 'bg-red-100 text-red-800',
      'learning_effectively': 'bg-green-100 text-green-800',
      'troubleshooting_db': 'bg-orange-100 text-orange-800',
      'feature_exploring': 'bg-purple-100 text-purple-800',
      'going_in_circles': 'bg-red-100 text-red-800',
      'requesting_examples': 'bg-blue-100 text-blue-800',
      'highly_engaged': 'bg-green-100 text-green-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSentimentColor = (score) => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFrustrationColor = (level) => {
    if (level <= 3) return 'text-green-600';
    if (level <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplexityColor = (level) => {
    if (level <= 3) return 'text-green-600';
    if (level <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      >
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Log Details</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {log && format(new Date(log.created_at), 'PPP p')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <ApperIcon name="X" size={20} />
              </Button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              {loading ? (
                <div className="p-12">
                  <Loading />
                </div>
              ) : error ? (
                <div className="p-6">
                  <div className="text-center py-8">
                    <ApperIcon name="AlertCircle" size={48} className="mx-auto text-red-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Log Details</h3>
                    <p className="text-gray-500">{error}</p>
                  </div>
                </div>
              ) : log ? (
                <div className="p-6 space-y-6">
                  {/* Summary Section */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{log.summary || 'No summary available'}</p>
                    </div>
                  </div>

                  {/* Status and Metrics */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Analysis Status</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Chat Status:</span>
                          <StatusBadge 
                            status={log.chat_analysis_status} 
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.chat_analysis_status)}`}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Model Used:</span>
                          <span className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                            {log.model_used || 'Not specified'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Metrics</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Sentiment Score:</span>
                          <span className={`text-sm font-semibold ${getSentimentColor(log.sentiment_score)}`}>
                            {log.sentiment_score ? (log.sentiment_score * 100).toFixed(1) + '%' : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Frustration Level:</span>
                          <span className={`text-sm font-semibold ${getFrustrationColor(log.frustration_level)}`}>
                            {log.frustration_level || 0}/10
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Technical Complexity:</span>
                          <span className={`text-sm font-semibold ${getComplexityColor(log.technical_complexity)}`}>
                            {log.technical_complexity || 0}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Error Message Section */}
                  {log.error_message && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                        <ApperIcon name="AlertTriangle" size={20} className="mr-2" />
                        Error Message
                      </h3>
                      <div className="bg-red-100 rounded p-3">
                        <pre className="text-sm text-red-800 whitespace-pre-wrap font-mono">
                          {log.error_message}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* App Information */}
                  {log.app_id && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Associated App</h3>
                      <div className="flex items-center space-x-3">
                        <ApperIcon name="Grid3X3" size={20} className="text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">
                            {log.app_id?.Name || `App ID: ${log.app_id?.Id || log.app_id}`}
                          </p>
                          <p className="text-sm text-blue-700">
                            ID: {log.app_id?.Id || log.app_id}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {log.Tags && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {log.Tags.split(',').map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Metadata</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Created:</span>
                        <p className="text-gray-600">
                          {format(new Date(log.CreatedOn || log.created_at), 'PPP p')}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Modified:</span>
                        <p className="text-gray-600">
                          {log.ModifiedOn ? format(new Date(log.ModifiedOn), 'PPP p') : 'Not modified'}
                        </p>
                      </div>
                      {log.CreatedBy && (
                        <div>
                          <span className="font-medium text-gray-700">Created By:</span>
                          <p className="text-gray-600">
                            {log.CreatedBy?.Name || log.CreatedBy}
                          </p>
                        </div>
                      )}
                      {log.Owner && (
                        <div>
                          <span className="font-medium text-gray-700">Owner:</span>
                          <p className="text-gray-600">
                            {log.Owner?.Name || log.Owner}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="text-center py-8">
                    <ApperIcon name="FileText" size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Log Data</h3>
                    <p className="text-gray-500">Unable to load log details.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  onClick={onClose}
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AILogDetailModal;