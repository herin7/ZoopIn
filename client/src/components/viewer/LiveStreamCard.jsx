import { motion, AnimatePresence } from 'framer-motion';
import { Play, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LiveStreamCard = ({ session }) => {
  const navigate = useNavigate();
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] }
  };

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -10, rotate: 1 }}
      className="group relative cursor-pointer border-4 border-black bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-x-1 active:translate-y-1 overflow-hidden"
      onClick={() => navigate(`/live/${session.roomId}`)}
    >
      <div className="relative aspect-[3/4] overflow-hidden border-b-4 border-black font-sans">
        <img
          src={session.thumbnail || session.currentProduct?.images?.[0] || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800'}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          alt={session.title}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-zoop-yellow p-4 rounded-full border-2 border-black">
            <Play fill="black" size={24} />
          </div>
        </div>
        <div className="absolute top-4 left-4 bg-red-600 border-2 border-black px-3 py-1 text-xs font-black italic text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">LIVE</div>
      </div>
      <div className="p-6 font-sans">
        <p className="text-xs font-black uppercase text-black/40">@{session.hostName || 'Seller'}</p>
        <h3 className="mt-1 text-2xl font-black uppercase leading-tight tracking-tighter truncate">{session.title}</h3>
        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs font-bold uppercase"><Users size={14} /> {session.viewerCount || 0} Watching</span>
          <div className="h-8 w-8 rounded-full border-2 border-black flex items-center justify-center hover:bg-zoop-yellow transition-colors">
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveStreamCard;
