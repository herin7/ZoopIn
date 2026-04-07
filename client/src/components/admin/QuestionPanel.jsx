import { CheckCheck, MessageSquareMore } from 'lucide-react';

const QuestionPanel = ({ questions, unansweredCount, onMarkAnswered }) => {
  const sortedQuestions = [...questions].sort(
    (leftQuestion, rightQuestion) =>
      new Date(rightQuestion.timestamp || 0) - new Date(leftQuestion.timestamp || 0)
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-yellow/15 p-2 text-brand-yellow">
              <MessageSquareMore size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Viewer Questions</h3>
              <p className="text-sm text-gray-400">Keep up with incoming questions as they arrive in real time.</p>
            </div>
          </div>
          <div className="rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-1 text-xs text-brand-yellow">
            {unansweredCount} unanswered
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {sortedQuestions.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-black/40 p-8 text-center text-sm text-gray-500">
            No questions yet. Once viewers start asking, they will appear here automatically.
          </div>
        )}

        {sortedQuestions.map((question) => (
          <div
            key={question._id || `${question.viewerName}-${question.timestamp}`}
            className={`rounded-2xl border bg-black/40 p-4 transition ${
              question.isAnswered
                ? 'border-white/10 opacity-60'
                : 'border-brand-yellow/20 border-l-4 border-l-brand-yellow'
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
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-bold text-brand-blue">
                  <CheckCheck size={14} />
                  Answered
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onMarkAnswered(question)}
                  className="rounded-full bg-brand-yellow px-3 py-1.5 text-xs font-bold text-black transition hover:brightness-110"
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
