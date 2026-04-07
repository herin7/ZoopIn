import { Eye, Play, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const getSessionImage = (session) =>
  session?.thumbnail || session?.currentProduct?.images?.[0] || '';

const getHostLabel = (session) => {
  if (session?.hostName) {
    return session.hostName;
  }

  if (session?.hostId) {
    return session.hostId.split('@')[0];
  }

  return 'Live seller';
};

const LiveRoomCard = ({ session, onOpen }) => {
  const sessionImage = getSessionImage(session);
  const sessionDescription =
    session?.description ||
    session?.currentProduct?.description ||
    'Join the live room to see the current showcase, ask questions, and react in real time.';

  return (
    <motion.div
      whileHover={{ y: -8, x: -8, boxShadow: '10px 10px 0px 0px rgba(0,0,0,1)' }}
      className="group relative flex flex-col border-[4px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(244,255,0,1)] transition-all overflow-hidden"
    >
      {/* Visual Header */}
      <div className="relative aspect-[16/10] overflow-hidden border-b-[4px] border-black bg-black">
        {sessionImage ? (
          <img 
            src={sessionImage} 
            alt={session?.title} 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <Zap size={48} className="text-zoop-yellow fill-zoop-yellow mb-4" />
            <span className="text-xs font-black uppercase tracking-widest text-zoop-yellow">Awaiting Visuals</span>
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <div className="bg-red-600 border-2 border-black px-3 py-1 text-[10px] font-black uppercase italic text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-pulse">
            LIVE
          </div>
          <div className="bg-white border-2 border-black px-2 py-1 text-[10px] font-black uppercase italic text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5">
            <Eye size={12} /> {session?.viewerCount || 0}
          </div>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/40 to-transparent">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 bg-zoop-yellow rounded-full animate-ping" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zoop-yellow">
              Hosted by @{getHostLabel(session)}
            </p>
          </div>
          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none truncate">
            {session?.title}
          </h3>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1 bg-white">
        <p className="line-clamp-2 text-sm font-bold text-black/60 leading-snug mb-6 italic">
          "{sessionDescription}"
        </p>

        {/* Product Callout */}
        <div className="mt-auto border-2 border-black bg-zoop-yellow/10 p-3 flex items-center gap-3 mb-6">
          <div className="p-2 border-2 border-black bg-black text-zoop-yellow">
            <Zap size={16} />
          </div>
          <div className="leading-tight">
             <p className="text-[9px] font-black uppercase tracking-widest text-black/40">Showing Now</p>
             <p className="text-xs font-black uppercase italic tracking-tighter truncate">
                {session?.currentProduct?.name || 'Loading Drops...'}
             </p>
          </div>
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onOpen?.(session?.roomId)}
          className="group flex w-full h-[54px] items-center justify-center gap-3 bg-black px-4 text-sm font-black uppercase italic tracking-tighter text-white shadow-[4px_4px_0px_0px_rgba(244,255,0,1)] hover:bg-zoop-yellow hover:text-black transition-colors"
        >
          Watch Feed <Play fill="currentColor" size={16} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LiveRoomCard;
