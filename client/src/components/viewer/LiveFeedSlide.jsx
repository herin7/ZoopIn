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
} from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { useWebRTCViewer } from '../../hooks/useWebRTCViewer';
import { useReactions } from '../../hooks/useReactions';
import FloatingEmoji from './FloatingEmoji';

const REACTION_BUTTONS = [
  { type: 'like', icon: <ThumbsUp size={20} />, label: 'Like', color: 'bg-brand-yellow', text: 'text-black' },
  { type: 'fire', icon: <Flame size={20} />, label: 'Fire', color: 'bg-brand-blue', text: 'text-white' },
  { type: 'heart', icon: <Heart size={20} />, label: 'Love', color: 'bg-brand-blue', text: 'text-white' },
  { type: 'wow', icon: <Sparkles size={20} />, label: 'Wow', color: 'bg-brand-yellow', text: 'text-black' },
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
      className="feed-slide relative flex h-screen w-full flex-col overflow-hidden bg-black"
    >
      {/* ── Background: stream video or thumbnail ── */}
      <div className="absolute inset-0">
        {remoteStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={false}
            className="h-full w-full object-cover"
          />
        ) : sessionImage ? (
          <img
            src={sessionImage}
            alt={session.title}
            className="h-full w-full object-cover brightness-75"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
            <ShoppingBag size={64} className="text-gray-700" />
          </div>
        )}
      </div>

      {/* ── Top gradient ── */}
      <div className="absolute inset-x-0 top-0 h-32 gradient-feed-top" />

      {/* ── Bottom gradient ── */}
      <div className="absolute inset-x-0 bottom-0 h-[45%] gradient-feed-bottom" />

      {/* ── Floating emoji layer ── */}
      {animatingReactions.map((r) => (
        <FloatingEmoji key={r.id} emoji={r.emoji} x={r.x} y={r.y} />
      ))}

      {/* ── Content overlay ── */}
      <div className="relative z-20 flex h-full flex-col justify-end px-4 pb-6 sm:px-6">
        {/* ─ Live badge + viewers ─ */}
        <div className="absolute left-4 top-16 flex items-center gap-2 sm:left-6">
          <span className="inline-flex items-center gap-1.5 rounded bg-red-500 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse-live" />
            Live
          </span>
          <span className="glass-dark inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-white">
            <Eye size={13} />
            {viewerCount}
          </span>
        </div>

        {/* ─ Right-side reaction rail ─ */}
        <div className="absolute bottom-32 right-4 z-30 flex flex-col items-center gap-3 sm:right-6">
          {REACTION_BUTTONS.map((btn) => (
            <button
              key={btn.type}
              type="button"
              onClick={(e) => handleSendReaction(btn.type, e)}
              className="group flex flex-col items-center gap-1"
            >
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition group-hover:scale-110 group-hover:${btn.color} group-hover:${btn.text} group-active:scale-95`}>
                {btn.icon}
              </span>
              <span className="text-[10px] font-medium text-white/70">
                {reactionCounts[btn.type] || 0}
              </span>
            </button>
          ))}

          {/* Ask question shortcut */}
          <button
            type="button"
            onClick={() => navigate(`/live/${session.roomId}`)}
            className="group flex flex-col items-center gap-1"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition group-hover:scale-110 group-hover:bg-white/20 group-active:scale-95">
              <MessageCirclePlus size={20} />
            </span>
            <span className="text-[10px] font-medium text-white/70">Ask</span>
          </button>
        </div>

        {/* ─ Bottom info panel ─ */}
        <div className="max-w-lg animate-slide-up">
          {/* Host name */}
          <p className="text-xs font-bold uppercase tracking-wider text-brand-yellow text-shadow-sm">
            @{getHostLabel(session)}
          </p>

          {/* Session title */}
          <h2 className="mt-2 text-xl font-bold leading-tight text-white text-shadow-md sm:text-2xl">
            {session.title}
          </h2>

          {/* Description */}
          {session.description && (
            <p className="mt-2 line-clamp-2 text-sm text-gray-200 text-shadow-sm">
              {session.description}
            </p>
          )}

          {/* Product card */}
          {currentProduct && (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-black/40 p-3 backdrop-blur-sm">
              {currentProduct.images?.[0] && (
                <img
                  src={currentProduct.images[0]}
                  alt={currentProduct.name}
                  className="h-14 w-14 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-brand-yellow">Now showing</p>
                <p className="mt-0.5 truncate text-sm font-semibold text-white">
                  {currentProduct.name}
                </p>
                <p className="mt-0.5 text-sm font-bold text-brand-yellow">
                  ₹{Number(currentProduct.price || 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            type="button"
            onClick={() => navigate(`/live/${session.roomId}`)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-yellow px-5 py-2.5 text-sm font-bold text-black transition hover:brightness-110 active:scale-95"
          >
            <ExternalLink size={15} />
            Open full room
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveFeedSlide;
