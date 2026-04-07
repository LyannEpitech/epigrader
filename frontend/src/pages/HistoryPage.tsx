import { useHistory } from '../hooks/useHistory';
import { useNotification } from '../contexts/NotificationContext';
import { exportPdf } from '../services/history';
import { analysisApi } from '../services/analysis';
import { AnalysisJob, AnalyzedCriterion } from '../types/analysis';
import { useState } from 'react';
import { History, Download, RefreshCw, Loader2, ExternalLink, Clock, CheckCircle, XCircle, Sparkles, FileText, ChevronRight } from 'lucide-react';

export const HistoryPage = () => {
  const { history, isLoading, error, refresh } = useHistory();
  const { success, error: showError } = useNotification();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<AnalysisJob | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleViewDetails = async (jobId: string) => {
    setLoadingDetails(true);
    setSelectedJob(jobId);
    try {
      const details = await analysisApi.getJobStatus(jobId);
      setJobDetails(details);
    } catch (err) {
      showError('Failed to load job details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleExport = (job: { jobId: string }) => {
    if (jobDetails && selectedJob === job.jobId) {
      exportPdf(jobDetails);
      success('Report exported successfully!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-600 bg-emerald-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'error':
        return XCircle;
      case 'processing':
        return Clock;
      default:
        return Clock;
    }
  };

  const formatRepoUrl = (url: string) => {
    const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
    return match ? match[1] : url;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-8 h-8 text-[#ff6b35]" />
              <div>
                <h1 className="text-3xl font-bold">Analysis History</h1>
                <p className="text-white/80">View past analyses and export reports</p>
              </div>
            </div>
            <button
              onClick={refresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              Refresh
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* History List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#1e3a5f]/10 rounded-lg">
                  <FileText className="w-5 h-5 text-[#1e3a5f]" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Analyses</h2>
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-gray-400 text-center py-12">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No analyses yet</p>
                  <p className="text-sm mt-1">Go to Analyze to start one</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {history.map((job) => {
                    const StatusIcon = getStatusIcon(job.status);
                    return (
                      <div
                        key={job.jobId}
                        onClick={() => handleViewDetails(job.jobId)}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedJob === job.jobId
                            ? 'bg-[#1e3a5f]/5 border-l-4 border-[#1e3a5f]'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <StatusIcon className={`w-5 h-5 ${
                              job.status === 'completed' ? 'text-emerald-500' :
                              job.status === 'error' ? 'text-red-500' :
                              'text-blue-500'
                            }`} />
                            <div>
                              <p className="font-medium text-[#1e3a5f]">
                                {formatRepoUrl(job.repoUrl)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(job.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              job.status
                            )}`}
                          >
                            {job.status}
                          </span>
                        </div>
                        {job.totalScore !== undefined && (
                          <div className="mt-2 ml-8 text-sm">
                            <span className="text-gray-500">Score:</span>{' '}
                            <span className="font-semibold text-gray-900">
                              {job.totalScore} / {job.maxScore}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Details</h2>
            </div>

            {!selectedJob && (
              <div className="text-gray-400 text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select an analysis to view details</p>
              </div>
            )}

            {loadingDetails && (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
              </div>
            )}

            {jobDetails && !loadingDetails && (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      jobDetails.status
                    )}`}
                  >
                    {jobDetails.status}
                  </span>
                </div>

                {jobDetails.result && (
                  <>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl">
                      <span className="font-medium text-emerald-900">Total Score</span>
                      <span className="text-3xl font-bold text-emerald-600">
                        {jobDetails.result.totalScore} <span className="text-lg text-emerald-400">/</span> {jobDetails.result.maxScore}
                      </span>
                    </div>

                    <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">{jobDetails.result.globalComment}</p>

                    <div className="border-t pt-4">
                      <h3 className="font-medium text-gray-900 mb-3">Criteria</h3>
                      <div className="space-y-2">
                        {jobDetails.result.criteria.map((c: AnalyzedCriterion) => (
                          <div
                            key={c.id}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                          >
                            <div className="flex items-center gap-2">
                              {c.status === 'passed' ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              ) : c.status === 'failed' ? (
                                <XCircle className="w-4 h-4 text-red-500" />
                              ) : (
                                <Clock className="w-4 h-4 text-amber-500" />
                              )}
                              <span className="text-sm">{c.name}</span>
                            </div>
                            <span
                              className={`font-medium text-sm ${
                                c.status === 'passed'
                                  ? 'text-emerald-600'
                                  : c.status === 'failed'
                                  ? 'text-red-600'
                                  : 'text-amber-600'
                              }`}
                            >
                              {c.score}/{c.maxPoints}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleExport({ jobId: jobDetails.id })}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all mt-4"
                    >
                      <Download className="w-5 h-5" />
                      Export Report
                    </button>
                  </>
                )}

                <a
                  href={jobDetails.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  View Repository
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};