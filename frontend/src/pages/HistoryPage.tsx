import { useHistory } from '../hooks/useHistory';
import { exportPdf } from '../services/history';
import { analysisApi } from '../services/analysis';
import { AnalysisJob, AnalyzedCriterion } from '../types/analysis';
import { useState } from 'react';
import { History, Download, RefreshCw, Loader2, ExternalLink } from 'lucide-react';

export const HistoryPage = () => {
  const { history, isLoading, error, refresh } = useHistory();
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
      console.error('Failed to load job details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleExport = (job: { jobId: string }) => {
    if (jobDetails && selectedJob === job.jobId) {
      exportPdf(jobDetails);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatRepoUrl = (url: string) => {
    const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
    return match ? match[1] : url;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
              <p className="mt-2 text-gray-600">
                View past analyses and export reports
              </p>
            </div>
            <button
              onClick={refresh}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5 mr-2" />
              )}
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* History List */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Recent Analyses</h2>
            </div>

            {history.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No analyses yet. Go to /analyze to start one.
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((job) => (
                  <div
                    key={job.jobId}
                    onClick={() => handleViewDetails(job.jobId)}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedJob === job.jobId
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-blue-600">
                          {formatRepoUrl(job.repoUrl)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(job.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {job.status}
                      </span>
                    </div>
                    {job.totalScore !== undefined && (
                      <div className="mt-2 text-sm">
                        Score:{' '}
                        <span className="font-medium">
                          {job.totalScore} / {job.maxScore}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Panel */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Details</h2>

            {!selectedJob && (
              <div className="text-gray-500 text-center py-8">
                Select an analysis to view details
              </div>
            )}

            {loadingDetails && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}

            {jobDetails && !loadingDetails && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                      jobDetails.status
                    )}`}
                  >
                    {jobDetails.status}
                  </span>
                </div>

                {jobDetails.result && (
                  <>
                    <div className="flex justify-between items-center border-t pt-4">
                      <span className="font-medium">Total Score</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {jobDetails.result.totalScore} / {jobDetails.result.maxScore}
                      </span>
                    </div>

                    <p className="text-gray-600">{jobDetails.result.globalComment}</p>

                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-2">Criteria</h3>
                      <div className="space-y-2">
                        {jobDetails.result.criteria.map((c: AnalyzedCriterion) => (
                          <div
                            key={c.id}
                            className="flex justify-between items-center text-sm"
                          >
                            <span>{c.name}</span>
                            <span
                              className={`font-medium ${
                                c.status === 'passed'
                                  ? 'text-green-600'
                                  : c.status === 'failed'
                                  ? 'text-red-600'
                                  : 'text-yellow-600'
                              }`}
                            >
                              {c.score}/{c.maxPoints}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleExport(jobDetails)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mt-4"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Export Report
                    </button>
                  </>
                )}

                <a
                  href={jobDetails.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  View Repository
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};