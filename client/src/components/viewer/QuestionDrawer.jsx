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
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-8">
      <div
        className={`pointer-events-auto w-full max-w-xl border-[4px] border-black bg-white p-6 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0'
        }`}
      >
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-zoop-yellow border-2 border-black p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <MessageCirclePlus size={22} strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Drop Query</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mt-1">Direct to host dashboard</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="border-2 border-black p-2 hover:bg-black hover:text-white transition-colors"
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-black">Handle</label>
             <input
               value={viewerName}
               onChange={onViewerNameChange}
               placeholder="e.g. @hypebeast"
               className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-zoop-yellow/5"
             />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-black">Your Question</label>
             <textarea
               value={questionText}
               onChange={onQuestionTextChange}
               required
               maxLength={300}
               rows={3}
               placeholder="Ask about the drop quality, sizing, or demo..."
               className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-zoop-yellow/5"
             />
          </div>
          <button
            type="submit"
            className="group flex w-full h-[54px] items-center justify-center gap-3 bg-black text-white text-sm font-black uppercase italic tracking-tighter shadow-[5px_5px_0px_0px_rgba(244,255,0,1)] hover:bg-zoop-yellow hover:text-black transition-colors"
          >
            Submit Signal <Send size={16} strokeWidth={3} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuestionDrawer;
