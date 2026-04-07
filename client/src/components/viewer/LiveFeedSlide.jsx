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
  Tag,
  ShoppingCart
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

  const handleBuy = (e) => {
    e.stopPropagation();
    navigate('/cart');
  };

  return (
    <div
      data-index={index}
      className="feed-slide relative flex h-screen w-full flex-col overflow-hidden bg-black selection:bg-zoop-yellow selection:text-black font-sans"
    >
      {/* ── Background: stream video or thumbnail ── */}
      <div className="absolute inset-0 bg-black">
        {remoteStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover grayscale-[0.1]"
          />
        ) : sessionImage ? (
          <img
            src={sessionImage}
            alt={session.title}
            className="h-full w-full object-cover brightness-[0.7] grayscale-[0.2]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-zinc-950">
             <Zap size={100} className="text-white/5 animate-pulse" />
             <p className="mt-4 text-xs font-black uppercase text-white/20 tracking-[0.5em]">Establishing Signal</p>
          </div>
        )}
      </div>

      {/* ── Overlays: Brutalist Contrast ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none" />

      {/* ── Floating emoji layer ── */}
      {animatingReactions.map((r) => (
        <FloatingEmoji key={r.id} emoji={r.emoji} x={r.x} y={r.y} />
      ))}

      {/* ── Content overlay ── */}
      <div className="relative z-20 flex h-full flex-col justify-end px-6 pb-12 sm:px-10 lg:px-16 max-w-6xl">
        
        {/* ─ Live badge + viewers ─ */}
        <div className="absolute left-6 top-24 sm:left-10 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-red-600 border-[3px] border-black px-4 py-1 text-[11px] font-black uppercase italic text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <span className="h-2 w-2 rounded-full bg-white animate-ping" />
            VIBE ACTIVE
          </div>
          <div className="bg-white border-[3px] border-black px-4 py-1 text-[11px] font-black uppercase italic text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
            <Eye size={16} strokeWidth={3} /> {viewerCount}
          </div>
        </div>

        {/* ─ Right-side reaction rail ─ */}
        <div className="absolute bottom-48 right-6 z-30 flex flex-col items-center gap-6 sm:right-10 lg:right-16">
          {REACTION_BUTTONS.map((btn) => (
            <div key={btn.type} className="flex flex-col items-center gap-1 group">
              <motion.button
                whileHover={{ scale: 1.25, rotate: 5, boxShadow: '8px 8px_0px_0px_rgba(0,0,0,1)' }}
                whileTap={{ scale: 0.9, x: 2, y: 2, boxShadow: 'none' }}
                onClick={(e) => handleSendReaction(btn.type, e)}
                className={`inline-flex h-16 w-16 items-center justify-center border-[3px] border-black text-black ${btn.color} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all`}
              >
                {btn.icon}
              </motion.button>
              <span className="text-[11px] font-black italic text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{reactionCounts[btn.type] || 0}</span>
            </div>
          ))}

          {/* Ask question shortcut */}
          <div className="flex flex-col items-center gap-1 mt-4">
            <motion.button
              whileHover={{ scale: 1.2, rotate: -5, boxShadow: '8px 8px_0px_0px_rgba(0,0,0,1)' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(`/live/${session.roomId}`)}
              className="inline-flex h-16 w-16 items-center justify-center border-[3px] border-black bg-white text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              <MessageCirclePlus size={28} strokeWidth={3} />
            </motion.button>
            <span className="text-[11px] font-black italic text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] uppercase">CHATS</span>
          </div>
        </div>

        {/* ─ Bottom info panel ─ */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-10"
        >
          <div className="flex-1">
             {/* Host info */}
             <div className="flex items-center gap-3 mb-4">
                <div className="bg-zoop-yellow border-2 border-black p-1">
                   <Zap size={14} className="fill-black" />
                </div>
                <p className="text-lg font-black uppercase italic tracking-tighter text-zoop-yellow drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                   DRAINING @{getHostLabel(session)}
                </p>
             </div>

             {/* Session title */}
             <h2 className="text-4xl sm:text-6xl font-black leading-[0.85] text-white uppercase italic tracking-tighter drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] mb-8">
               {session.title}
             </h2>

             {/* Primary Actions */}
             <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/live/${session.roomId}`)}
                  className="bg-zoop-yellow border-[4px] border-black px-8 py-4 text-2xl font-black uppercase italic tracking-tighter text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 group"
                >
                  ENTER THE ROOM <ExternalLink size={24} strokeWidth={4} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </motion.button>
                <div className="bg-white/10 border-2 border-white/20 px-6 py-4 backdrop-blur-md hidden sm:block">
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">CURRENT RADAR</p>
                   <p className="text-lg font-black text-white tracking-widest uppercase italic truncate max-w-[200px]">{session.roomId}</p>
                </div>
             </div>
          </div>

          {/* Product card: HYPE DROPPING */}
          {currentProduct && (
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="lg:w-96 border-[4px] border-black bg-white p-5 shadow-[12px_12px_0px_0px_rgba(244,255,0,1)] relative group"
            >
              <div className="absolute -top-4 -right-4 bg-black text-white px-3 py-1 font-black uppercase italic text-[10px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(244,255,0,1)]">
                 LIVE DROP
              </div>
              <div className="flex gap-4 mb-6">
                 <div className="h-20 w-20 border-[3px] border-black flex-shrink-0 bg-zinc-100 overflow-hidden">
                    {currentProduct.images?.[0] ? (
                      <img src={currentProduct.images[0]} alt="product" className="h-full w-full object-cover grayscale-[0.2] transition-all group-hover:grayscale-0" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-black/10 font-black">?</div>
                    )}
                 </div>
                 <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <p className="truncate text-xl font-black uppercase italic tracking-tighter text-black leading-none mb-2">
                       {currentProduct.name}
                    </p>
                    <div className="flex items-baseline gap-2">
                       <p className="text-3xl font-black italic tracking-tighter text-blue-600 leading-none">
                          ₹{Number(currentProduct.price || 0).toFixed(0)}
                       </p>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <motion.button 
                   whileTap={{ scale: 0.9 }}
                   onClick={handleBuy}
                   className="bg-black text-white py-3 font-black uppercase italic tracking-tighter text-xs shadow-[4px_4px_0px_0px_rgba(244,255,0,1)] flex items-center justify-center gap-2"
                 >
                    COP NOW <Zap size={14} className="fill-zoop-yellow" />
                 </motion.button>
                 <motion.button 
                   whileTap={{ scale: 0.9 }}
                   onClick={handleBuy}
                   className="bg-white border-2 border-black py-3 font-black uppercase italic tracking-tighter text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
                 >
                    CART <ShoppingCart size={14} strokeWidth={3} />
                 </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* ── Background Branding ── */}
      <div className="absolute bottom-10 left-10 pointer-events-none opacity-5 select-none z-0">
         <span className="text-[200px] font-black uppercase italic tracking-tighter text-white leading-none">ZOOPIN</span>
      </div>
    </div>
  );
};

export default LiveFeedSlide;
