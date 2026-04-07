import { CheckCheck, MessageSquareMore, User, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuestionPanel = ({ questions, unansweredCount, onMarkAnswered }) => {
  const sortedQuestions = [...questions].sort(
    (leftQuestion, rightQuestion) =>
      new Date(rightQuestion.timestamp || 0) - new Date(leftQuestion.timestamp || 0)
  );

  return (
    <div className="space-y-6 selection:bg-black selection:text-white">
      {/* Header Card */}
      <div className="border-[3px] border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(244,255,0,1)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-black text-zoop-yellow p-2 border-2 border-black">
              <MessageSquareMore size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter leading-none">Interrogations</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mt-1">Real-time engagement</p>
            </div>
          </div>
          <div className="bg-red-600 text-white px-3 py-1 border-2 border-black font-black uppercase italic text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            {unansweredCount} HOT
          </div>
        </div>
      </div>

      {/* Questions Scroll Area */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {sortedQuestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-2 border-dashed border-black/20 py-20 text-center"
            >
               <Zap size={40} className="mx-auto text-black/10 mb-4" />
               <p className="font-black uppercase italic opacity-20 text-2xl tracking-tighter leading-none">Silence is Golden.</p>
               <p className="text-[10px] font-black uppercase tracking-widest text-black/10 mt-2">Waiting for viewer queries</p>
            </motion.div>
          ) : (
            sortedQuestions.map((question, i) => (
              <motion.div
                key={question._id || `${question.viewerName}-${question.timestamp}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`border-[3px] border-black p-5 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                  question.isAnswered ? 'bg-zinc-50 border-black/20 shadow-none grayscale opacity-60' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 border-2 border-black bg-zoop-yellow flex items-center justify-center">
                       <User size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase italic tracking-tighter leading-none">
                        {question.viewerName || 'Anony-Hype'}
                      </p>
                      <p className="text-[9px] font-black uppercase text-black/30 tracking-widest mt-1">
                        {question.timestamp ? new Date(question.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NOW'}
                      </p>
                    </div>
                  </div>

                  {question.isAnswered ? (
                    <div className="bg-green-500 text-white border-2 border-black p-1">
                      <CheckCheck size={14} />
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onMarkAnswered(question)}
                      className="bg-black text-zoop-yellow px-3 py-1 border-2 border-black font-black uppercase italic text-[10px] tracking-tighter shadow-[2px_2px_0px_0px_rgba(244,255,0,0.3)]"
                    >
                      CLEAR
                    </motion.button>
                  )}
                </div>

                <div className="relative">
                   <span className="absolute -left-2 top-0 text-xl font-black text-zoop-yellow opacity-40">"</span>
                   <p className="text-sm font-bold text-black/80 leading-snug pl-2 italic">
                     {question.text}
                   </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuestionPanel;
