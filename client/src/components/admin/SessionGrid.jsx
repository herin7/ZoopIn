import { motion, AnimatePresence } from 'framer-motion';
import { Users as UsersIcon } from 'lucide-react';

const getSessionImage = (session) =>
  session?.thumbnail || session?.currentProduct?.images?.[0] || '';

const SessionGrid = ({ managedSessions, activeSessionId, onSelectSession, isLoadingSessions }) => {
  return (
    <div className="mb-16 border-[6px] border-black p-8 bg-white shadow-[12px_12px_0px_0px_rgba(244,255,0,1)]">
      <div className="flex items-center justify-between gap-4 mb-8">
        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Your <span className="bg-black text-white px-3">Rooms</span></h2>
        <div className="h-[2px] flex-1 bg-black/10 mx-4 hidden md:block" />
        <div className="text-sm font-black uppercase tracking-widest">{managedSessions.length} Managed</div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {managedSessions.map((managedSession) => (
            <motion.button
              key={managedSession._id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => onSelectSession(managedSession)}
              className={`group relative overflow-hidden border-[3px] border-black p-4 transition-all text-left ${activeSessionId === managedSession._id
                ? 'bg-zoop-yellow shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white hover:bg-zinc-50'
                }`}
            >
              <div className="aspect-video border-2 border-black overflow-hidden mb-4 bg-zinc-100">
                {getSessionImage(managedSession) ? (
                  <img src={getSessionImage(managedSession)} className="h-full w-full object-cover transition-transform group-hover:scale-110" alt="thumb" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center italic font-black text-black/10">No Asset</div>
                )}
              </div>
              <h4 className="text-xl font-black uppercase italic tracking-tighter truncate">{managedSession.title}</h4>
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black ${managedSession.status === 'live' ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
                  {managedSession.status}
                </span>
                <span className="text-[10px] font-black uppercase flex items-center gap-1">
                  <UsersIcon size={12} /> {managedSession.viewerCount || 0}
                </span>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
        {!isLoadingSessions && managedSessions.length === 0 && (
          <div className="col-span-full border-2 border-dashed border-black/20 py-20 text-center font-black uppercase italic opacity-20 text-4xl tracking-tighter">Zero Rooms Loaded.</div>
        )}
      </div>
    </div>
  );
};

export default SessionGrid;
