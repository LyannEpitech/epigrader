import { useHistory } from '../hooks/useHistory';
import { Link } from 'react-router-dom';
import { FileText, Play, History, BarChart3, CheckCircle, XCircle, Clock, Sparkles, TrendingUp, Zap, ChevronRight } from 'lucide-react';

export const DashboardPage = () => {
  const { history, isLoading } = useHistory();

  const completedAnalyses = history.filter(h => h.status === 'completed').length;
  const failedAnalyses = history.filter(h => h.status === 'error').length;
  const processingAnalyses = history.filter(h => h.status === 'processing').length;

  const recentAnalyses = history.slice(0, 5);

  const stats = [
    { 
      label: 'Completed', 
      value: completedAnalyses, 
      icon: CheckCircle, 
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    { 
      label: 'Processing', 
      value: processingAnalyses, 
      icon: Clock, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Failed', 
      value: failedAnalyses, 
      icon: XCircle, 
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50'
    },
    { 
      label: 'Total', 
      value: history.length, 
      icon: BarChart3, 
      color: 'from-[#1e3a5f] to-[#2d5a87]',
      bgColor: 'bg-indigo-50'
    },
  ];

  const quickActions = [
    {
      to: '/rubric',
      icon: FileText,
      title: 'Manage Rubrics',
      description: 'Create and edit grading rubrics',
      color: 'from-[#1e3a5f] to-[#2d5a87]',
    },
    {
      to: '/analyze',
      icon: Play,
      title: 'New Analysis',
      description: 'Analyze a GitHub repository',
      color: 'from-[#ff6b35] to-[#ff8f5a]',
    },
    {
      to: '/history',
      icon: History,
      title: 'View History',
      description: 'See past analyses and reports',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Sparkles className="w-8 h-8 text-[#ff6b35]" />
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>
          <p className="text-white/80 text-lg">
            Welcome back! Here's an overview of your grading activities.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} style={{ color: 'inherit' }} />
                </div>
                <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                {action.title}
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>

        {/* Recent Analyses */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-[#1e3a5f]" />
                <h2 className="text-lg font-semibold text-gray-900">Recent Analyses</h2>
              </div>
              <Link 
                to="/history" 
                className="text-sm text-[#1e3a5f] hover:text-[#2d5a87] font-medium flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-gray-500">
                <Zap className="w-5 h-5 animate-pulse" />
                Loading...
              </div>
            </div>
          ) : recentAnalyses.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No analyses yet</p>
              <p className="text-sm text-gray-400 mt-1">Start by analyzing a repository!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentAnalyses.map((job) => (
                <div
                  key={job.jobId}
                  className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      job.status === 'completed' ? 'bg-emerald-500' :
                      job.status === 'error' ? 'bg-red-500' :
                      'bg-blue-500 animate-pulse'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">
                        {job.repoUrl.match(/github\.com\/([^/]+\/[^/]+)/)?.[1] || job.repoUrl}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(job.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {job.totalScore !== undefined && (
                      <span className="font-semibold text-gray-900">
                        {job.totalScore} <span className="text-gray-400">/</span> {job.maxScore}
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        job.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : job.status === 'error'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
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