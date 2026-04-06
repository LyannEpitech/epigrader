import { useState } from 'react';
import { useRubricParser } from '../hooks/useRubricParser';
import { RubricPreview } from '../components/RubricPreview';
import { rubricStorage } from '../services/rubric';
import { FileText, Loader2, Save, Trash2 } from 'lucide-react';

export const RubricPage = () => {
  const [content, setContent] = useState('');
  const [rubricName, setRubricName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const { criteria, totalPoints, isLoading, error, parseRubric, clear } = useRubricParser();

  const handleParse = async () => {
    if (!content.trim()) return;
    await parseRubric(content);
  };

  const handleSave = () => {
    if (rubricName.trim() && criteria.length > 0) {
      rubricStorage.saveRubric(rubricName, criteria);
      setShowSaveDialog(false);
      setRubricName('');
    }
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">Rubric Parser</h1>
          <p className="mt-2 text-gray-600">
            Parse and save grading rubrics for Epitech projects
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Input Rubric</h2>
              </div>
              <button
                onClick={() => setContent(exampleRubric)}
                className="text-sm text-blue-600 hover:text-blue-800"
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
              className="w-full h-96 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleParse}
                disabled={isLoading || !content.trim()}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  'Parse Rubric'
                )}
              </button>
              
              {criteria.length > 0 && (
                <>
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={clear}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Clear
                  </button>
                </>
              )}
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rubric Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rubricName}
                    onChange={(e) => setRubricName(e.target.value)}
                    placeholder="Enter rubric name..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSave}
                    disabled={!rubricName.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Preview</h2>
            <RubricPreview criteria={criteria} totalPoints={totalPoints} />
          </div>
        </div>
      </main>
    </div>
  );
};