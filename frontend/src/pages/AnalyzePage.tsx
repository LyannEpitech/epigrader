import { useState, useEffect } from 'react';
import { useAnalysis } from '../hooks/useAnalysis';
import { ProgressBar } from '../components/ProgressBar';
import { rubricApi } from '../services/rubric';
import { GitBranch, Play, Loader2 } from 'lucide-react';

export const AnalyzePage = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [selectedRubricId, setSelectedRubricId] = useState('');
  const [savedRubrics, setSavedRubrics] = useState<any[]>([]);
  const { job, isLoading, error, startAnalysis, clear } = useAnalysis();

  useEffect(() => {
    rubricApi.getAllRubrics().then(rubrics => setSavedRubrics(rubrics));
  }, []);

  const handleStart = async () => {
    if (!repoUrl.trim() || !selectedRubricId) return;
    await startAnalysis(repoUrl, selectedRubricId);
  };

  const isValidGitHubUrl = (url: string) => {
    return url.match(/github\.com\/[^/]+\/[^/]+/);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">Analyze Repository</h1>
          <p className="mt-2 text-gray-600">
            Analyze a GitHub repository against a grading rubric
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Repository</h2>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading || job?.status === 'processing'}
                />
                {repoUrl && !isValidGitHubUrl(repoUrl) && (
                  <p className="mt-1 text-sm text-red-600">
                    Please enter a valid GitHub URL
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Rubric
                </label>
                <select
                  value={selectedRubricId}
                  onChange={(e) => setSelectedRubricId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    No saved rubrics. Go to /rubric to create one.
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
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
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Progress */}
            {job && (
              <div className="mt-6">
                <ProgressBar progress={job.progress} status={job.status} />
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Results</h2>
            
            {!job && (
              <div className="text-gray-500 text-center py-8">
                Enter a repository URL and select a rubric to start analysis.
              </div>
            )}

            {job?.status === 'completed' && job.result && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Total Score</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {job.result.totalScore} / {job.result.maxScore}
                  </span>
                </div>

                <p className="text-gray-600">{job.result.globalComment}</p>

                <div className="space-y-3">
                  {job.result.criteria.map((criterion) => (
                    <div
                      key={criterion.id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3 h-3 rounded-full ${
                              criterion.status === 'passed'
                                ? 'bg-green-500'
                                : criterion.status === 'failed'
                                ? 'bg-red-500'
                                : 'bg-yellow-500'
                            }`}
                          />
                          <span className="font-medium">{criterion.name}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {criterion.score} / {criterion.maxPoints}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {criterion.justification}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {job?.status === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {job.error || 'Analysis failed'}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};