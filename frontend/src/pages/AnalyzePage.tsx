import { useState, useEffect } from 'react';
import { useAnalysis } from '../hooks/useAnalysis';
import { useNotification } from '../contexts/NotificationContext';
import { AnalysisSteps } from '../components/AnalysisSteps';
import { CacheManager } from '../components/CacheManager';
import { rubricApi } from '../services/rubric';
import { GitBranch, Play, Loader2, Sparkles, CheckCircle, XCircle, AlertCircle, Download, FileText } from 'lucide-react';

export const AnalyzePage = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('');
  const [selectedRubricId, setSelectedRubricId] = useState('');
  const [savedRubrics, setSavedRubrics] = useState<any[]>([]);
  const { job, isLoading, error, startAnalysis, clear } = useAnalysis();
  const { success, error: showError } = useNotification();

  useEffect(() => {
    rubricApi.getAllRubrics().then(rubrics => setSavedRubrics(rubrics));
  }, []);

  const handleStart = async () => {
    if (!repoUrl.trim()) {
      showError('Please enter a repository URL');
      return;
    }
    if (!selectedRubricId) {
      showError('Please select a rubric');
      return;
    }
    if (!isValidGitHubUrl(repoUrl)) {
      showError('Please enter a valid GitHub URL');
      return;
    }
    
    await startAnalysis(repoUrl, selectedRubricId, branch || undefined);
    success('Analysis started successfully!');
  };

  const isValidGitHubUrl = (url: string) => {
    return url.match(/github\.com\/[^/]+\/[^/]+/);
  };

  const handleExport = () => {
    if (!job?.result) return;
    
    const report = {
      repository: repoUrl,
      date: new Date().toISOString(),
      totalScore: job.result.totalScore,
      maxScore: job.result.maxScore,
      criteria: job.result.criteria,
      globalComment: job.result.globalComment,
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${repoUrl.split('/').pop()}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('Report exported successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#ff6b35]" />
            <div>
              <h1 className="text-3xl font-bold">Analyze Repository</h1>
              <p className="text-white/80">Analyze a GitHub repository against a grading rubric</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-[#1e3a5f]/10 rounded-lg">
                <GitBranch className="w-5 h-5 text-[#1e3a5f]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Repository</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub Repository URL
                </label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/Epitech/my_project"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-all"
                  disabled={isLoading || job?.status === 'processing'}
                />
                {repoUrl && !isValidGitHubUrl(repoUrl) && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Please enter a valid GitHub URL
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch (optional)
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main (default)"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-all"
                  disabled={isLoading || job?.status === 'processing'}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Leave empty to use the default branch
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Rubric
                </label>
                <select
                  value={selectedRubricId}
                  onChange={(e) => setSelectedRubricId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-all"
                  disabled={isLoading || job?.status === 'processing'}
                >
                  <option value="">Choose a rubric...</option>
                  {savedRubrics.map((rubric) => (
                    <option key={rubric.id} value={rubric.id}>
                      {rubric.name} ({rubric.totalPoints} pts)
                    </option>
                  ))}
                </select>
                {savedRubrics.length === 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    No saved rubrics. <a href="/rubric" className="text-[#1e3a5f] hover:underline">Create one</a>.
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleStart}
                  disabled={
                    isLoading ||
                    !repoUrl.trim() ||
                    !selectedRubricId ||
                    !isValidGitHubUrl(repoUrl) ||
                    job?.status === 'processing'
                  }
                  className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start Analysis
                    </>
                  )}
                </button>

                {job && (
                  <button
                    onClick={clear}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Analysis Progress */}
            {job && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <AnalysisSteps 
                  steps={job.steps || []} 
                  currentStatus={job.status} 
                />
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Results</h2>
              </div>
              {job?.status === 'completed' && (
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              )}
            </div>
            
            {!job && (
              <div className="text-gray-400 text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Enter a repository URL and select a rubric</p>
                <p className="text-sm mt-1">to start analysis</p>
              </div>
            )}

            {job?.status === 'completed' && job.result && (
              <div className="space-y-4">
                {job.branch && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    <GitBranch className="w-4 h-4" />
                    Branch: <span className="font-medium">{job.branch}</span>
                  </div>
                )}
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl">
                  <span className="font-medium text-emerald-900">Total Score</span>
                  <span className="text-3xl font-bold text-emerald-600">
                    {job.result.totalScore} <span className="text-lg text-emerald-400">/</span> {job.result.maxScore}
                  </span>
                </div>

                <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">{job.result.globalComment}</p>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {job.result.criteria.map((criterion) => (
                    <div
                      key={criterion.id}
                      className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {criterion.status === 'passed' ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          ) : criterion.status === 'failed' ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                          )}
                          <span className="font-medium text-gray-900">{criterion.name}</span>
                        </div>
                        <span className="text-sm font-semibold bg-gray-100 px-2 py-1 rounded-lg">
                          {criterion.score} / {criterion.maxPoints}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{criterion.justification}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {job?.status === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                <XCircle className="w-5 h-5 flex-shrink-0" />
                {job.error || 'Analysis failed'}
              </div>
            )}
          </div>

          {/* Cache Manager */}
          <div className="lg:col-span-2">
            <CacheManager />
          </div>
        </div>
      </main>
    </div>
  );
};