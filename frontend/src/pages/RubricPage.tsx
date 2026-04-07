import { useState } from 'react';
import { useRubricParser } from '../hooks/useRubricParser';
import { useRubrics } from '../hooks/useRubrics';
import { useNotification } from '../contexts/NotificationContext';
import { RubricPreview } from '../components/RubricPreview';
import { FileText, Loader2, Save, Trash2, RefreshCw, CheckCircle, Sparkles, BookOpen } from 'lucide-react';

export const RubricPage = () => {
  const [content, setContent] = useState('');
  const [rubricName, setRubricName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const { criteria, totalPoints, isLoading, error, parseRubric, clear } = useRubricParser();
  const { rubrics, isLoading: rubricsLoading, fetchRubrics, saveRubric, deleteRubric } = useRubrics();
  const { success, error: showError } = useNotification();

  const handleParse = async () => {
    if (!content.trim()) {
      showError('Please enter rubric content');
      return;
    }
    const result = await parseRubric(content);
    if (result) {
      success('Rubric parsed successfully!');
    } else if (error) {
      showError(error);
    }
  };

  const handleSave = async () => {
    if (!rubricName.trim() || criteria.length === 0) {
      showError('Please enter a name and parse a rubric first');
      return;
    }
    const id = await saveRubric(rubricName, criteria);
    if (id) {
      success('Rubric saved successfully!');
      setShowSaveDialog(false);
      setRubricName('');
      clear();
      setContent('');
    } else {
      showError('Failed to save rubric');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const result = await deleteRubric(id);
      if (result) {
        success('Rubric deleted successfully!');
      } else {
        showError('Failed to delete rubric');
      }
    }
  };

  const handleLoadRubric = (rubric: any) => {
    setContent(`${rubric.name}\n\n${rubric.criteria.map((c: any) => `## ${c.name} (${c.maxPoints} pts)\n${c.description}`).join('\n\n')}`);
    success(`Loaded rubric: ${rubric.name}`);
  };

  const exampleRubric = `## Presentation (5 pts)
- README complete with project description
- Makefile present and functional
- Compilation without warnings

## Features (10 pts)
- Arguments handling
- Error handling (3 pts)
- Correct output display (3 pts)
- Memory management (2 pts)`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-[#ff6b35]" />
            <div>
              <h1 className="text-3xl font-bold">Rubric Parser</h1>
              <p className="text-white/80">Parse and save grading rubrics for Epitech projects</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#1e3a5f]/10 rounded-lg">
                  <FileText className="w-5 h-5 text-[#1e3a5f]" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Input Rubric</h2>
              </div>
              <button
                onClick={() => setContent(exampleRubric)}
                className="text-sm text-[#ff6b35] hover:text-[#ff8f5a] font-medium"
              >
                Load Example
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your rubric here...

Example:
## Presentation (5 pts)
- README complete
- Makefile present

## Features (10 pts)
- Arguments handling"
              className="w-full h-64 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent font-mono text-sm resize-none"
            />

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleParse}
                disabled={isLoading || !content.trim()}
                className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Parse Rubric
                  </>
                )}
              </button>
              
              {criteria.length > 0 && (
                <>
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={clear}
                    className="flex items-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Clear
                  </button>
                </>
              )}
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rubric Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rubricName}
                    onChange={(e) => setRubricName(e.target.value)}
                    placeholder="Enter rubric name..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                  <button
                    onClick={handleSave}
                    disabled={!rubricName.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Saved Rubrics List */}
            <div className="mt-6 border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Saved Rubrics</h3>
                <button
                  onClick={fetchRubrics}
                  disabled={rubricsLoading}
                  className="text-sm text-[#1e3a5f] hover:text-[#2d5a87] font-medium flex items-center"
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${rubricsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              
              {rubrics.length === 0 ? (
                <div className="text-center py-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">No saved rubrics yet</p>
                  <p className="text-xs text-gray-400 mt-1">Parse and save a rubric to see it here</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {rubrics.map((rubric) => (
                    <div
                      key={rubric.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                      <button
                        onClick={() => handleLoadRubric(rubric)}
                        className="flex-1 text-left text-sm"
                      >
                        <span className="font-medium text-gray-900">{rubric.name}</span>
                        <span className="text-gray-500 ml-2">({rubric.totalPoints} pts)</span>
                      </button>
                      <button
                        onClick={() => handleDelete(rubric.id, rubric.name)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete rubric"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
            {criteria.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-4 p-3 bg-emerald-50 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">{criteria.length} criteria parsed successfully</span>
                </div>
                <RubricPreview criteria={criteria} totalPoints={totalPoints} />
              </>
            ) : (
              <div className="text-gray-400 text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Enter a rubric and click "Parse Rubric"</p>
                <p className="text-sm mt-1">to see the preview</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};