import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  ExternalLink,
  Flame,
  Heart,
  MessageCirclePlus,
  ShoppingBag,
  Sparkles,
  ThumbsUp,
  Zap,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../hooks/useSocket';
import { useWebRTCViewer } from '../../hooks/useWebRTCViewer';
import { useReactions } from '../../hooks/useReactions';
import FloatingEmoji from './FloatingEmoji';

const REACTION_BUTTONS = [
  { type: 'like', icon: <ThumbsUp size={22} />, label: 'Hype', color: 'bg-zoop-yellow', text: 'text-black' },
  { type: 'fire', icon: <Flame size={22} />, label: 'Fire', color: 'bg-red-600', text: 'text-white' },
  { type: 'heart', icon: <Heart size={22} />, label: 'Love', color: 'bg-pink-500', text: 'text-white' },
  { type: 'wow', icon: <Sparkles size={22} />, label: 'Wow', color: 'bg-blue-600', text: 'text-white' },
];

const getSessionImage = (session) =>
  session?.thumbnail || session?.currentProduct?.images?.[0] || '';

const getHostLabel = (session) => {
  if (session?.hostName) return session.hostName;
  if (session?.hostId) return session.hostId.split('@')[0];
  return 'Live seller';
};

const LiveFeedSlide = ({ session, index, isActive }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [viewerCount, setViewerCount] = useState(session?.viewerCount || 0);
  const [currentProduct, setCurrentProduct] = useState(session?.currentProduct || null);
  const sessionImage = getSessionImage(session);

  /* Only connect socket + WebRTC when this slide is active */
  const { socket } = useSocket(isActive ? session.roomId : null, 'viewer');
  const { remoteStream } = useWebRTCViewer(
    isActive ? socket : null,
    isActive ? session.roomId : null
  );
  const { reactionCounts, sendReaction, animatingReactions } = useReactions(
    isActive ? socket : null,
    session.roomId,
    session._id
  );

  /* Attach remote stream to video */
  useEffect(() => {
    if (!videoRef.current || !remoteStream) return;
    videoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  /* Listen for real-time updates */
  useEffect(() => {
    if (!socket) return undefined;

    const handleViewerCount = ({ viewerCount: count }) => setViewerCount(count || 0);
    const handleProductChanged = ({ currentProduct: product }) => {
      if (product) setCurrentProduct(product);
    };
    const handleSessionState = ({ data }) => {
      if (data?.viewerCount) setViewerCount(data.viewerCount);
      if (data?.session?.currentProduct) setCurrentProduct(data.session.currentProduct);
    };

    socket.on('viewer:count', handleViewerCount);
    socket.on('product:changed', handleProductChanged);
    socket.on('session:state', handleSessionState);

    return () => {
      socket.off('viewer:count', handleViewerCount);
      socket.off('product:changed', handleProductChanged);
      socket.off('session:state', handleSessionState);
    };
  }, [socket]);

  const handleSendReaction = (type, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    sendReaction(type, {
      x: `${rect.left + rect.width / 2}px`,
      y: `${rect.top}px`,
    });
  };

  return (
    <div
      data-index={index}
      className="feed-slide relative flex h-screen w-full flex-col overflow-hidden bg-black selection:bg-zoop-yellow selection:text-black"
    >
      {/* ── Background: stream video or thumbnail ── */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          {remoteStream ? (
            <motion.video
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              ref={videoRef}
              autoPlay
              playsInline
              muted={false}
              className="h-full w-full object-cover"
            />
          ) : sessionImage ? (
            <motion.img
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={sessionImage}
              alt={session.title}
              className="h-full w-full object-cover brightness-[0.7] grayscale-[0.2]"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-zinc-900">
               <Zap size={100} className="text-white/5 animate-pulse" />
               <p className="mt-4 text-xs font-black uppercase text-white/20 tracking-[0.5em]">Establishing Signal</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Overlays ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />

      {/* ── Floating emoji layer ── */}
      {animatingReactions.map((r) => (
        <FloatingEmoji key={r.id} emoji={r.emoji} x={r.x} y={r.y} />
      ))}

      {/* ── Content overlay ── */}
      <div className="relative z-20 flex h-full flex-col justify-end px-6 pb-10 sm:px-8 max-w-4xl">
        
        {/* ─ Live badge + viewers ─ */}
        <div className="absolute left-6 top-20 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-red-600 border-2 border-black px-3 py-1 text-[11px] font-black uppercase italic text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
            LIVE
          </div>
          <div className="bg-white border-2 border-black px-3 py-1 text-[11px] font-black uppercase italic text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5">
            <Eye size={14} /> {viewerCount}
          </div>
        </div>

        {/* ─ Right-side reaction rail ─ */}
        <div className="absolute bottom-40 right-6 z-30 flex flex-col items-center gap-5 sm:right-10">
          {REACTION_BUTTONS.map((btn) => (
            <div key={btn.type} className="flex flex-col items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.2, rotate: 5, boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}
                whileTap={{ scale: 0.9, x: 2, y: 2, boxShadow: 'none' }}
                onClick={(e) => handleSendReaction(btn.type, e)}
                className={`inline-flex h-14 w-14 items-center justify-center border-[3px] border-black text-black ${btn.color} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
              >
                {btn.icon}
              </motion.button>
              <span className="text-[10px] font-black italic text-white drop-shadow-md">
                {reactionCounts[btn.type] || 0}
              </span>
            </div>
          ))}

          {/* Ask question shortcut */}
          <div className="flex flex-col items-center gap-1 mt-2">
            <motion.button
              whileHover={{ scale: 1.2, rotate: -5, boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}
              whileTap={{ scale: 0.9, x: 2, y: 2, boxShadow: 'none' }}
              onClick={() => navigate(`/live/${session.roomId}`)}
              className="inline-flex h-14 w-14 items-center justify-center border-[3px] border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <MessageCirclePlus size={24} />
            </motion.button>
            <span className="text-[10px] font-black italic text-white drop-shadow-md">ASK</span>
          </div>
        </div>

        {/* ─ Bottom info panel ─ */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full"
        >
          {/* Host info */}
          <div className="flex items-center gap-2 mb-3">
             <div className="h-2 w-2 bg-zoop-yellow rounded-full animate-pulse" />
             <p className="text-sm font-black uppercase italic tracking-tighter text-zoop-yellow drop-shadow-sm">
                @{getHostLabel(session)}
             </p>
          </div>

          {/* Session title with brutalist decoration */}
          <h2 className="text-3xl font-black leading-[0.9] text-white uppercase italic tracking-tighter sm:text-5xl drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            {session.title}
          </h2>

          {/* Product card: NEUBRUTALIST UPGRADE */}
          {currentProduct && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex items-center gap-4 border-[3px] border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(244,255,0,1)] max-w-sm"
            >
              <div className="h-16 w-16 border-2 border-black flex-shrink-0 bg-black overflow-hidden">
                {currentProduct.images?.[0] ? (
                  <img src={currentProduct.images[0]} alt={product} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-white/20">
                     <ShoppingBag size={24} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                   <Tag size={12} className="text-black/40" />
                   <p className="text-[9px] font-black uppercase tracking-widest text-black/40 truncate">NOW SHOWCASING</p>
                </div>
                <p className="truncate text-base font-black uppercase italic tracking-tighter text-black leading-none">
                  {currentProduct.name}
                </p>
                <p className="mt-2 text-xl font-black italic tracking-tighter text-blue-600 leading-none">
                  ₹{Number(currentProduct.price || 0).toFixed(0)}
                </p>
              </div>
            </motion.div>
          )}

          {/* Primary CTA */}
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/live/${session.roomId}`)}
            className="mt-8 flex h-[64px] items-center justify-center gap-3 bg-black px-10 text-xl font-black uppercase italic tracking-tighter text-white border-2 border-white shadow-[6px_6px_0px_0px_rgba(244,255,0,1)] transition-all"
          >
            ENTER THE ROOM <ExternalLink size={20} strokeWidth={3} />
          </motion.button>
        </motion.div>
      </div>
      
      {/* ── Background Branding ── */}
      <div className="absolute bottom-4 left-6 pointer-events-none opacity-5 select-none">
         <span className="text-[120px] font-black uppercase italic tracking-tighter text-white">ZOOPIN</span>
      </div>
    </div>
  );
};

export default LiveFeedSlide;
