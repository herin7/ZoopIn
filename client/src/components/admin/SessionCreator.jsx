import { Plus, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SessionCreator = ({ sessionForm, setSessionForm, onSubmit, isCreatingSession, user, roleLabel }) => {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] mb-12">
      {/* Create Session Form */}
      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="border-[4px] border-black bg-zoop-yellow p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-8 flex items-center gap-3">
          <Plus className="bg-black text-white p-1" size={28} /> New Live Drop
        </h2>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest">Session Catchphrase</label>
            <input
              required
              value={sessionForm.title}
              onChange={(e) => setSessionForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border-2 border-black bg-white p-4 text-sm font-bold outline-none"
              placeholder="e.g. Rare 1-of-1 Vault Opening"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-black/40">Visual Proof (URL)</label>
              <input
                value={sessionForm.thumbnail}
                onChange={(e) => setSessionForm(f => ({ ...f, thumbnail: e.target.value }))}
                className="w-full border-2 border-black bg-white p-4 text-sm font-bold outline-none"
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-black/40">Drop Description</label>
              <textarea
                rows={1}
                value={sessionForm.description}
                onChange={(e) => setSessionForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border-2 border-black bg-white p-4 text-sm font-bold outline-none"
                placeholder="Urgent vibes only."
              />
            </div>
          </div>
          <motion.button
            type="submit"
            disabled={isCreatingSession}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-black text-white py-4 font-black uppercase italic tracking-tighter text-xl shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] disabled:bg-zinc-800"
          >
            {isCreatingSession ? 'Launching...' : 'Initialize Session'}
          </motion.button>
        </form>
      </motion.div>

      {/* User Bio Card */}
      <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="border-[4px] border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-black/30">Verified Credentials</p>
        <div className="flex items-center gap-4 mt-4">
          <div className="h-16 w-16 border-4 border-black bg-zoop-yellow flex items-center justify-center">
            <Zap className="fill-black" size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{user?.name || user?.email}</h3>
            <span className="text-sm font-black text-white bg-black px-2 py-0.5 uppercase mt-1 inline-block">{roleLabel} Access</span>
          </div>
        </div>
        <p className="mt-8 font-bold text-black/60 italic leading-snug">
          Every room you create is instantly blasted to the global feed. Make your thumbnails count.
        </p>
      </motion.div>
    </div>
  );
};

export default SessionCreator;
