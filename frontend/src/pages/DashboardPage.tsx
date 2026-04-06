import { useHistory } from '../hooks/useHistory';
import { useGitHubAuth } from '../hooks/useGitHubAuth';
import { Link } from 'react-router-dom';
import { FileText, Play, History, LogOut, BarChart3, CheckCircle, XCircle, Clock } from 'lucide-react';

export const DashboardPage = () => {
  const { logout } = useGitHubAuth();
  const { history, isLoading } = useHistory();

  const completedAnalyses = history.filter(h => h.status === 'completed').length;
  const failedAnalyses = history.filter(h => h.status === 'error').length;
  const processingAnalyses = history.filter(h => h.status === 'processing').length;

  const recentAnalyses = history.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">EpiGrader</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/rubric"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Rubrics
              </Link>
              <Link
                to="/analyze"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Analyze
              </Link>
              <Link
                to="/history"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                History
              </Link>
              <button
                onClick={logout}
                className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{completedAnalyses}</p>
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-2xl font-bold">{processingAnalyses}</p>
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold">{failedAnalyses}</p>
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{history.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/rubric"
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <FileText className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Manage Rubrics</h3>
            <p className="text-gray-600">Create and edit grading rubrics</p>
          </Link>
          <Link
            to="/analyze"
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <Play className="w-10 h-10 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">New Analysis</h3>
            <p className="text-gray-600">Analyze a GitHub repository</p>
          </Link>
          <Link
            to="/history"
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <History className="w-10 h-10 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">View History</h3>
            <p className="text-gray-600">See past analyses and reports</p>
          </Link>
        </div>

        {/* Recent Analyses */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Analyses</h2>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : recentAnalyses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No analyses yet. Start by analyzing a repository!
            </div>
          ) : (
            <div className="space-y-3">
              {recentAnalyses.map((job) => (
                <div
                  key={job.jobId}
                  className="flex justify-between items-center border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {job.repoUrl.match(/github\.com\/([^/]+\/[^/]+)/)?.[1] || job.repoUrl}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(job.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {job.totalScore !== undefined && (
                      <span className="font-medium">
                        {job.totalScore} / {job.maxScore}
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        job.status === 'completed'
                          ? 'text-green-600 bg-green-100'
                          : job.status === 'error'
                          ? 'text-red-600 bg-red-100'
                          : 'text-blue-600 bg-blue-100'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};