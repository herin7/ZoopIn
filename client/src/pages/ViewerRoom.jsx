import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, Flame, Heart, MessageCirclePlus, Sparkles, ThumbsUp } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { useWebRTCViewer } from '../hooks/useWebRTCViewer';
import { useReactions } from '../hooks/useReactions';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import FloatingEmoji from '../components/viewer/FloatingEmoji';
import ProductSpotlight from '../components/viewer/ProductSpotlight';
import QuestionDrawer from '../components/viewer/QuestionDrawer';

const REACTION_BUTTONS = [
  { type: 'like', icon: <ThumbsUp size={18} /> },
  { type: 'fire', icon: <Flame size={18} /> },
  { type: 'heart', icon: <Heart size={18} /> },
  { type: 'wow', icon: <Sparkles size={18} /> },
];

const VIEWER_NAME_KEY = 'viewer-name';

const ViewerRoom = () => {
  const { roomId } = useParams();
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
        title: 'Product has changed',
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
      title: 'Question submitted',
      message: 'The host will see it in the live control room.',
      tone: 'success',
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-black">
        {remoteStream ? (
          <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-950">
            <div className="h-[42vh] w-[84vw] max-w-4xl rounded-[2rem] border border-white/10 bg-gray-900" />
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/75" />

      {animatingReactions.map((reaction) => (
        <FloatingEmoji key={reaction.id} emoji={reaction.emoji} x={reaction.x} y={reaction.y} />
      ))}

      <div className="relative z-20 flex min-h-screen flex-col justify-between px-4 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="max-w-[70%] rounded-full bg-black/55 px-4 py-2 text-sm backdrop-blur-sm">
            {session?.title || 'Live session'}
          </div>

          <div className="flex items-center gap-2 rounded-full bg-black/55 px-4 py-2 text-sm backdrop-blur-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-200">
              <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse-live" />
              Live
            </span>
            <Eye size={15} className="text-emerald-300" />
            <span>{viewerCount}</span>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
          {isLoading && (
            <div className="rounded-[1.75rem] bg-black/65 px-6 py-5 text-center backdrop-blur-sm">
              <p className="text-lg font-semibold">Connecting to stream...</p>
              <p className="mt-2 text-sm text-gray-300">Loading the live room and current product state.</p>
            </div>
          )}

          {!isLoading && !hasStreamEnded && session?.status !== 'live' && (
            <div className="rounded-[1.75rem] bg-black/65 px-6 py-5 text-center backdrop-blur-sm">
              <p className="text-xl font-semibold">Stream has not started yet</p>
              <p className="mt-2 text-sm text-gray-300">Stay tuned. Checking again in 00:{String(countdown).padStart(2, '0')}</p>
            </div>
          )}

          {hasStreamEnded && (
            <div className="max-w-md rounded-[1.75rem] bg-black/70 p-6 text-center backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">Session ended</p>
              <h2 className="mt-3 text-2xl font-semibold">Thanks for watching</h2>
              <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/5 p-4 text-left text-sm text-gray-300">
                <p>Session: {session?.title || 'Live session'}</p>
                <p className="mt-2">Final viewer count: {viewerCount}</p>
                <p className="mt-2">Total reactions: {totalReactions}</p>
                <p className="mt-2">Featured product: {session?.currentProduct?.name || 'No active product'}</p>
              </div>
            </div>
          )}
        </div>

        {hasConnectedOnce && !isConnected && !hasStreamEnded && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/35 backdrop-blur-sm">
            <div className="rounded-full bg-black/70 px-5 py-3 text-sm text-white">
              <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-emerald-400" />
              Reconnecting...
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute right-4 top-1/3 z-20 flex flex-col gap-3">
          {REACTION_BUTTONS.map((reaction) => (
            <button
              key={reaction.type}
              type="button"
              onClick={(event) => handleSendReaction(reaction.type, event)}
              className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:scale-105 hover:bg-black/70"
            >
              {reaction.icon}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="ml-auto max-w-2xl rounded-[1.75rem] bg-black/60 p-4 backdrop-blur-sm">
            <ProductSpotlight product={session?.currentProduct} />
          </div>

          <div className="flex items-end justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsQuestionDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-black/75"
            >
              <MessageCirclePlus size={18} />
              Ask a question
            </button>

            <div className="rounded-full bg-black/60 px-4 py-3 text-xs text-gray-300 backdrop-blur-sm">
              Like {reactionCounts.like} | Fire {reactionCounts.fire} | Heart {reactionCounts.heart} | Wow {reactionCounts.wow}
            </div>
          </div>
        </div>
      </div>

      <QuestionDrawer
        isOpen={isQuestionDrawerOpen}
        viewerName={viewerName}
        questionText={questionText}
        onViewerNameChange={(event) => setViewerName(event.target.value)}
        onQuestionTextChange={(event) => setQuestionText(event.target.value)}
        onSubmit={handleQuestionSubmit}
        onClose={() => setIsQuestionDrawerOpen(false)}
      />

      {streamError && !hasStreamEnded && (
        <div className="absolute bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-full bg-red-500/10 px-4 py-2 text-sm text-red-100 backdrop-blur-sm">
          {streamError}
        </div>
      )}
    </div>
  );
};

export default ViewerRoom;
