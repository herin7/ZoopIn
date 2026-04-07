import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Flame, Heart, MessageCirclePlus, Sparkles, ThumbsUp, Zap, Radio, ChevronLeft, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import { useWebRTCViewer } from '../hooks/useWebRTCViewer';
import { useReactions } from '../hooks/useReactions';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import FloatingEmoji from '../components/viewer/FloatingEmoji';
import ProductSpotlight from '../components/viewer/ProductSpotlight';
import QuestionDrawer from '../components/viewer/QuestionDrawer';

const REACTION_BUTTONS = [
  { type: 'like', icon: <ThumbsUp size={22} />, color: 'bg-zoop-yellow', label: 'Hype' },
  { type: 'fire', icon: <Flame size={22} />, color: 'bg-red-600', label: 'Fire' },
  { type: 'heart', icon: <Heart size={22} />, color: 'bg-pink-500', label: 'Love' },
  { type: 'wow', icon: <Sparkles size={22} />, color: 'bg-blue-600', label: 'Wow' },
];

const VIEWER_NAME_KEY = 'viewer-name';

const ViewerRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const addToast = useToastStore((state) => state.addToast);
  const [session, setSession] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasConnectedOnce, setHasConnectedOnce] = useState(false);
  const [hasStreamEnded, setHasStreamEnded] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isQuestionDrawerOpen, setIsQuestionDrawerOpen] = useState(false);
  const [viewerName, setViewerName] = useState(
    sessionStorage.getItem(VIEWER_NAME_KEY) || user?.name || 'Guest viewer'
  );
  const [questionText, setQuestionText] = useState('');
  const videoRef = useRef(null);

  const { socket, isConnected } = useSocket(roomId, 'viewer');
  const { remoteStream, error: streamError } = useWebRTCViewer(socket, roomId);
  const { reactionCounts, sendReaction, animatingReactions } = useReactions(
    socket,
    roomId,
    session?._id
  );

  useEffect(() => {
    const countdownInterval = window.setInterval(() => {
      setCountdown((currentValue) => (currentValue <= 1 ? 30 : currentValue - 1));
    }, 1000);

    return () => window.clearInterval(countdownInterval);
  }, []);

  useEffect(() => {
    if (user?.name && !sessionStorage.getItem(VIEWER_NAME_KEY)) {
      setViewerName(user.name);
      sessionStorage.setItem(VIEWER_NAME_KEY, user.name);
    }
  }, [user]);

  useEffect(() => {
    if (!videoRef.current || !remoteStream) {
      return;
    }

    videoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleSessionState = ({ data }) => {
      setSession(data.session);
      setViewerCount(data.viewerCount || 0);
      setIsLoading(false);
      setHasConnectedOnce(true);
      setHasStreamEnded(data.session?.status === 'ended');
    };

    const handleViewerCount = ({ viewerCount: nextViewerCount }) => {
      setViewerCount(nextViewerCount || 0);
    };

    const handleProductChanged = ({ currentProduct }) => {
      setSession((currentSession) =>
        currentSession
          ? {
            ...currentSession,
            currentProduct,
          }
          : currentSession
      );

      addToast({
        title: 'Product Drop!',
        message: currentProduct?.name || 'A new item is now featured.',
        tone: 'success',
      });
    };

    const handleHostLeave = () => {
      setHasStreamEnded(true);
      setSession((currentSession) =>
        currentSession
          ? {
            ...currentSession,
            status: 'ended',
          }
          : currentSession
      );
    };

    socket.on('session:state', handleSessionState);
    socket.on('viewer:count', handleViewerCount);
    socket.on('product:changed', handleProductChanged);
    socket.on('host:leave', handleHostLeave);

    return () => {
      socket.off('session:state', handleSessionState);
      socket.off('viewer:count', handleViewerCount);
      socket.off('product:changed', handleProductChanged);
      socket.off('host:leave', handleHostLeave);
    };
  }, [addToast, socket]);

  useEffect(() => {
    if (isConnected) {
      setHasConnectedOnce(true);
      setIsLoading(false);
    }
  }, [isConnected]);

  const totalReactions = useMemo(
    () => Object.values(reactionCounts).reduce((total, count) => total + count, 0),
    [reactionCounts]
  );

  const handleSendReaction = (type, event) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    sendReaction(type, {
      x: `${buttonRect.left + buttonRect.width / 2}px`,
      y: `${buttonRect.top}px`,
    });
  };

  const handleQuestionSubmit = (event) => {
    event.preventDefault();

    if (!socket || !session?._id || !questionText.trim()) {
      return;
    }

    sessionStorage.setItem(VIEWER_NAME_KEY, viewerName);

    socket.emit('question:submit', {
      roomId,
      sessionId: session._id,
      viewerName,
      text: questionText.trim(),
    });

    setQuestionText('');
    setIsQuestionDrawerOpen(false);
    addToast({
      title: 'Hype Question Sent!',
      message: 'The host will see it in the drop center.',
      tone: 'success',
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-black selection:bg-black selection:text-white font-sans">
      
      {/* ── Background Video layer ── */}
      <div className="absolute inset-0 bg-black z-0">
        {remoteStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover transition-all duration-700"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
             <Radio size={80} className="text-white opacity-10 animate-pulse" />
          </div>
        )}
      </div>

      {/* ── Overlays: Brutalist Gradients ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none z-10" />

      {/* ── Floating emoji layer ── */}
      {animatingReactions.map((reaction) => (
        <FloatingEmoji key={reaction.id} emoji={reaction.emoji} x={reaction.x} y={reaction.y} />
      ))}

      {/* ── Top Nav: Hype Centric ── */}
      <div className="relative z-30 flex items-center justify-between p-6">
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-white border-[3px] border-black px-4 py-2 font-black uppercase italic text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-zoop-yellow transition-all pointer-events-auto"
        >
          <ChevronLeft size={16} strokeWidth={3} /> Exit Drop
        </motion.button>

        <div className="flex items-center gap-4">
           <div className="bg-red-600 border-[3px] border-black px-4 py-2 flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="h-2 w-2 rounded-full bg-white animate-ping" />
              <span className="text-xs font-black uppercase italic text-white tracking-widest">LIVE SIGNAL</span>
           </div>
           <div className="bg-white border-[3px] border-black px-4 py-2 flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Eye size={16} strokeWidth={3} />
              <span className="text-xs font-black uppercase italic tracking-tighter">{viewerCount} Watching</span>
           </div>
        </div>
      </div>

      {/* ── Center Information / Loading States ── */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-8">
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zoop-yellow border-[6px] border-black p-8 text-center shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]"
            >
               <Radio size={50} className="mx-auto mb-4 animate-bounce" />
               <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-2">SYNCING BEAT...</h2>
               <p className="text-sm font-bold uppercase tracking-widest text-black/40">Calibrating Hype Levels</p>
            </motion.div>
          )}

          {!isLoading && !hasStreamEnded && session?.status !== 'live' && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white border-[6px] border-black p-8 text-center shadow-[15px_15px_0px_0px_rgba(244,255,0,1)]"
            >
               <Zap size={50} className="mx-auto mb-4 text-zoop-yellow" />
               <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-4">Awaiting Signal</h2>
               <p className="text-lg font-bold italic text-black/60 mb-8">The drop starts in 00:{String(countdown).padStart(2, '0')}</p>
               <div className="h-2 w-full bg-zinc-100 border-2 border-black">
                  <motion.div 
                    className="h-full bg-zoop-yellow"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(countdown / 30) * 100}%` }}
                  />
               </div>
            </motion.div>
          )}

          {hasStreamEnded && (
            <motion.div
              initial={{ scale: 0.8, rotate: -2 }}
              animate={{ scale: 1, rotate: 0 }}
              className="max-w-lg bg-white border-[6px] border-black p-10 text-center shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] pointer-events-auto"
            >
               <div className="bg-red-600 text-white px-4 py-1 border-2 border-black inline-block font-black uppercase text-xs mb-6 tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">SIGNAL CUT</div>
               <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-8">DROP OVER.</h2>
               
               <div className="space-y-4 text-left border-t-4 border-black pt-8">
                  <div className="flex justify-between border-b-2 border-dashed border-black/10 pb-2">
                     <span className="text-[10px] font-black uppercase opacity-40">Session ID</span>
                     <span className="text-xs font-black uppercase italic">{session?.roomId}</span>
                  </div>
                  <div className="flex justify-between border-b-2 border-dashed border-black/10 pb-2">
                     <span className="text-[10px] font-black uppercase opacity-40">Total Hype</span>
                     <span className="text-xs font-black uppercase italic">{totalReactions} REACTIONS</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-[10px] font-black uppercase opacity-40">MVP Status</span>
                     <span className="text-xs font-black uppercase italic text-blue-600">VERIFIED ATTENDEE</span>
                  </div>
               </div>

               <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className="w-full bg-black text-white py-5 mt-10 font-black uppercase italic tracking-tighter text-2xl shadow-[6px_6px_0px_0px_rgba(244,255,0,1)]"
               >
                 BACK TO FEED
               </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Right-Side Reaction Rail ── */}
      <div className="absolute top-[20%] right-6 z-40 flex flex-col gap-6">
        {REACTION_BUTTONS.map((reaction, i) => (
          <div key={reaction.type} className="flex flex-col items-center gap-1">
            <motion.button
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.2, rotate: 5, boxShadow: '6px 6px 0px 0px rgba(0,0,0,0.5)' }}
              whileTap={{ scale: 0.9, x: 2, y: 2, boxShadow: 'none' }}
              onClick={(event) => handleSendReaction(reaction.type, event)}
              className={`h-14 w-14 flex items-center justify-center border-[3px] border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${reaction.color}`}
            >
              {reaction.icon}
            </motion.button>
            <span className="text-[10px] font-black text-white drop-shadow-md italic uppercase">{reactionCounts[reaction.type]}</span>
          </div>
        ))}
      </div>

      {/* ── Bottom Interactive Zone ── */}
      <div className="absolute inset-x-0 bottom-0 z-30 p-6 flex flex-col md:flex-row items-end justify-between gap-6">
        
        {/* Question & Meta */}
        <div className="flex flex-col gap-4">
           <motion.button
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             onClick={() => setIsQuestionDrawerOpen(true)}
             className="bg-white border-[3px] border-black px-6 py-4 flex items-center gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-zoop-yellow transition-all"
           >
             <MessageCirclePlus size={20} strokeWidth={3} />
             <span className="font-black uppercase italic tracking-tighter">Ask the Host</span>
           </motion.button>

           <div className="bg-black/80 border-2 border-white/20 p-4 text-white/40 font-black uppercase text-[10px] italic tracking-widest hidden lg:block">
              SIGNAL FREQUENCY : 105.7 MHZ | ZOOPIN DROP PROTOCOL ACTIVE
           </div>
        </div>

        {/* Product In SpotLight */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full md:max-w-md lg:max-w-xl"
        >
          <div className="bg-white border-[4px] border-black p-6 shadow-[12px_12px_0px_0px_rgba(244,255,0,1)] relative">
             <div className="absolute -top-4 -left-4 bg-black text-white px-3 py-1 font-black uppercase italic text-[10px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(244,255,0,1)]">
                NOW DROPPING
             </div>
             <ProductSpotlight product={session?.currentProduct} />
          </div>
        </motion.div>
      </div>

      {/* ── Reconnecting UI ── */}
      <AnimatePresence>
        {hasConnectedOnce && !isConnected && !hasStreamEnded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-white border-[4px] border-black p-6 flex flex-col items-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
               <div className="h-10 w-10 border-4 border-black border-t-zoop-yellow animate-spin mb-4" />
               <p className="font-black uppercase italic tracking-tighter">RECONNECTING RADAR...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <QuestionDrawer
        isOpen={isQuestionDrawerOpen}
        viewerName={viewerName}
        questionText={questionText}
        onViewerNameChange={(event) => setViewerName(event.target.value)}
        onQuestionTextChange={(event) => setQuestionText(event.target.value)}
        onSubmit={handleQuestionSubmit}
        onClose={() => setIsQuestionDrawerOpen(false)}
      />

      {/* ── Persistent Cart Shortcut ── */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/cart')}
        className="fixed bottom-36 left-6 z-40 h-16 w-16 bg-white border-[3px] border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-zoop-yellow group"
      >
        <ShoppingCart size={28} strokeWidth={3} className="transition-transform group-hover:-rotate-12" />
        <div className="absolute -top-2 -right-2 h-6 w-6 bg-red-600 border-2 border-black text-white text-[10px] font-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">3</div>
      </motion.button>
    </div>
  );
};

export default ViewerRoom;
