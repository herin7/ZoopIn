import { CheckCheck, MessageSquareMore } from 'lucide-react';

const QuestionPanel = ({ questions, unansweredCount, onMarkAnswered }) => {
  const sortedQuestions = [...questions].sort(
    (leftQuestion, rightQuestion) =>
      new Date(rightQuestion.timestamp || 0) - new Date(leftQuestion.timestamp || 0)
  );

  return (
    <div className="space-y-4">
      <div className="rounded-[1.75rem] border border-white/10 bg-gray-950/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-500/10 p-2 text-amber-300">
              <MessageSquareMore size={18} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Viewer Questions</h3>
              <p className="text-sm text-gray-500">Keep up with incoming questions as they arrive in real time.</p>
            </div>
          </div>
          <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-200">
            {unansweredCount} unanswered
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {sortedQuestions.length === 0 && (
          <div className="rounded-[1.75rem] border border-white/10 bg-gray-950/70 p-8 text-center text-sm text-gray-500">
            No questions yet. Once viewers start asking, they will appear here automatically.
          </div>
        )}

        {sortedQuestions.map((question) => (
          <div
            key={question._id || `${question.viewerName}-${question.timestamp}`}
            className={`rounded-[1.5rem] border bg-gray-950/70 p-4 transition ${
              question.isAnswered
                ? 'border-white/10 opacity-60'
                : 'border-amber-500/20 border-l-4 border-l-amber-400'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">{question.viewerName || 'Guest viewer'}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {question.timestamp
                    ? new Date(question.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                    : 'Just now'}
                </p>
              </div>

              {question.isAnswered ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                  <CheckCheck size={14} />
                  Answered
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onMarkAnswered(question)}
                  className="rounded-full bg-amber-400 px-3 py-1.5 text-xs font-semibold text-gray-950 transition hover:bg-amber-300"
                >
                  Mark Answered
                </button>
              )}
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-200">{question.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionPanel;
