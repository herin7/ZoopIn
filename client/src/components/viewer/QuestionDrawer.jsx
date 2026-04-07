import { MessageCirclePlus, Send, X } from 'lucide-react';

const QuestionDrawer = ({
  isOpen,
  viewerName,
  questionText,
  onViewerNameChange,
  onQuestionTextChange,
  onSubmit,
  onClose,
}) => {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4">
      <div
        className={`pointer-events-auto w-full max-w-xl rounded-2xl border border-white/10 bg-black/70 p-5 text-white shadow-2xl backdrop-blur-md transition duration-300 ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-yellow/15 p-2 text-brand-yellow">
              <MessageCirclePlus size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Ask a question</h3>
              <p className="text-sm text-gray-400">Send it straight to the host dashboard.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-gray-300 transition hover:border-white/20 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <input
            value={viewerName}
            onChange={onViewerNameChange}
            placeholder="Your name"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-yellow"
          />
          <textarea
            value={questionText}
            onChange={onQuestionTextChange}
            required
            maxLength={300}
            rows={3}
            placeholder="Ask the host about the product or live demo..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-yellow"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-5 py-2.5 text-sm font-bold text-black transition hover:brightness-110"
          >
            <Send size={14} />
            Submit Question
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuestionDrawer;
