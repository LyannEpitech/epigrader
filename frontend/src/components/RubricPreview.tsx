import { Criterion } from '../types/rubric';

interface RubricPreviewProps {
  criteria: Criterion[];
  totalPoints: number;
}

export const RubricPreview = ({ criteria, totalPoints }: RubricPreviewProps) => {
  if (criteria.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No criteria parsed yet. Enter a rubric to see the preview.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="text-lg font-semibold">Parsed Rubric</h3>
        <span className="text-sm text-gray-600">
          {criteria.length} criteria • {totalPoints} points total
        </span>
      </div>

      <div className="space-y-3">
        {criteria.map((criterion, index) => (
          <div
            key={criterion.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                  {index + 1}
                </span>
                <h4 className="font-medium">{criterion.name}</h4>
              </div>
              <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded">
                {criterion.maxPoints} pts
              </span>
            </div>
            {criterion.description && (
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">
                {criterion.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};