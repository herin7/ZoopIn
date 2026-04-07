import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Mic, MicOff, Radio, Square, VideoOff, Zap, Eye, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import { useToastStore } from '../../store/toastStore';

const StreamControls = ({ session, socket, localStream, startStream, stopStream, viewerCount, onSessionChange }) => {
  const addToast = useToastStore((state) => state.addToast);
  const [isLive, setIsLive] = useState(session?.status === 'live');
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setIsLive(session?.status === 'live');
  }, [session?.status]);

  useEffect(() => {
    if (!videoRef.current || !localStream) {
      return;
    }

    videoRef.current.srcObject = localStream;
  }, [localStream]);

  const cameraTrack = useMemo(() => localStream?.getVideoTracks()?.[0] || null, [localStream]);
  const micTrack = useMemo(() => localStream?.getAudioTracks()?.[0] || null, [localStream]);

  useEffect(() => {
    if (cameraTrack) {
      cameraTrack.enabled = isCameraEnabled;
    }
  }, [cameraTrack, isCameraEnabled]);

  useEffect(() => {
    if (micTrack) {
      micTrack.enabled = isMicEnabled;
    }
  }, [isMicEnabled, micTrack]);

  const goLive = async () => {
    if (!session) {
      addToast({
        title: 'Create a session first',
        message: 'You need a live session before starting the broadcast.',
        tone: 'warning',
      });
      return;
    }

    setIsStarting(true);

    try {
      const stream = await startStream();

      if (!stream) {
        throw new Error('Unable to access camera or microphone.');
      }

      const response = await api.patch(`/api/sessions/${session._id}/start`);
      socket?.emit('host:join', {
        roomId: session.roomId,
        sessionId: session._id,
      });

      setIsLive(true);
      onSessionChange?.(response.data.data);
      addToast({
        title: 'You are live',
        message: 'The broadcast is now visible to viewers.',
        tone: 'success',
      });
    } catch (error) {
      stopStream();
      addToast({
        title: 'Unable to go live',
        message: error.response?.data?.message || error.message,
        tone: 'error',
      });
    } finally {
      setIsStarting(false);
    }
  };

  const endStream = async () => {
    if (!session) {
      return;
    }

    setIsEnding(true);

    try {
      const response = await api.patch(`/api/sessions/${session._id}/end`);
      socket?.emit('host:leave', {
        roomId: session.roomId,
        sessionId: session._id,
      });
      stopStream();
      setIsLive(false);
      onSessionChange?.(response.data.data);
      addToast({
        title: 'Stream ended',
        message: 'The live session has been closed for viewers.',
        tone: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Unable to end stream',
        message: error.response?.data?.message || 'Please try again.',
        tone: 'error',
      });
    } finally {
      setIsEnding(false);
      setIsEndModalOpen(false);
    }
  };

  return (
    <div className="relative flex h-full flex-col border-[4px] border-black bg-white p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] selection:bg-black selection:text-white overflow-hidden">
      
      {/* Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-4 mb-6">
        <div className="flex items-center gap-3">
           <Zap className="text-zoop-yellow fill-black" size={24} />
           <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">
              {session?.title || 'Signal Lost...'}
           </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 border-2 border-black font-black uppercase italic text-xs flex items-center gap-2 ${isLive ? 'bg-red-600 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] animate-pulse' : 'bg-zinc-100 text-black/30'}`}>
             <Circle size={10} fill={isLive ? 'white' : 'transparent'} />
             {isLive ? 'Online' : 'Offline'}
          </div>
          <div className="px-3 py-1 border-2 border-black bg-white font-black uppercase italic text-xs flex items-center gap-2">
             <Eye size={14} /> {viewerCount} Viewers
          </div>
        </div>
      </div>

      {/* Video Canvas */}
      <div className="relative flex-1 min-h-[400px] border-[4px] border-black bg-black overflow-hidden group shadow-[inset_0px_0px_60px_rgba(0,0,0,0.8)]">
        {localStream ? (
          <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover grayscale-[0.2] transition-all group-hover:grayscale-0" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-zinc-900">
            <div className="relative">
               <Radio size={64} className="text-white opacity-20 animate-ping absolute" />
               <Radio size={64} className="text-zoop-yellow" />
            </div>
            <p className="mt-8 text-2xl font-black uppercase italic tracking-tighter text-white">Awaiting Signal</p>
            <p className="mt-2 text-sm font-bold text-white/40 uppercase tracking-widest max-w-xs leading-tight">
               Local preview is ready. Hit Go Live to broadcast.
            </p>
          </div>
        )}

        {/* Floating Controls Over Video */}
        {localStream && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10 transition-transform group-hover:scale-110">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCameraEnabled(v => !v)}
              className={`h-14 w-14 border-2 border-black flex items-center justify-center transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] ${isCameraEnabled ? 'bg-white text-black' : 'bg-red-600 text-white'}`}
            >
              {isCameraEnabled ? <Camera size={24} /> : <VideoOff size={24} />}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMicEnabled(v => !v)}
              className={`h-14 w-14 border-2 border-black flex items-center justify-center transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] ${isMicEnabled ? 'bg-white text-black' : 'bg-red-600 text-white'}`}
            >
              {isMicEnabled ? <Mic size={24} /> : <MicOff size={24} />}
            </motion.button>
          </div>
        )}
      </div>

      {/* Primary Actions */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-black/40 italic">Control Frequency 105.7 MHz</p>
        
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!session || isStarting || isLive}
            onClick={goLive}
            className="px-8 py-4 bg-zoop-yellow border-[3px] border-black font-black uppercase italic tracking-tighter text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:bg-zinc-200 disabled:shadow-none transition-all"
          >
            {isStarting ? 'CONNECTING...' : 'Go Live'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!session || !isLive || isEnding}
            onClick={() => setIsEndModalOpen(true)}
            className="px-8 py-4 bg-white border-[3px] border-black font-black uppercase italic tracking-tighter text-xl shadow-[6px_6px_0px_0px_rgba(220,38,38,1)] hover:bg-red-600 hover:text-white disabled:opacity-30 disabled:shadow-none transition-all"
          >
            {isEnding ? 'CUTTING...' : 'Kill Stream'}
          </motion.button>
        </div>
      </div>

      {/* Neubrutalist Confirmation Modal */}
      <AnimatePresence>
        {isEndModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm border-[6px] border-black bg-white p-8 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex flex-col items-center text-center">
                 <div className="h-20 w-20 border-[4px] border-black bg-red-600 flex items-center justify-center mb-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                    <Square size={32} fill="white" />
                 </div>
                 <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-4 underline decoration-red-600 decoration-[6px]">Kill Signal?</h3>
                 <p className="text-lg font-bold text-black/60 leading-tight mb-8 italic">
                   This action will disconnect every viewer instantly.
                 </p>
                 
                 <div className="flex flex-col w-full gap-3">
                   <motion.button
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={endStream}
                     className="w-full bg-black text-white py-4 font-black uppercase italic tracking-tighter text-xl shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]"
                   >
                     Confirm Kill
                   </motion.button>
                   <button
                     onClick={() => setIsEndModalOpen(false)}
                     className="w-full border-2 border-black py-3 font-black uppercase italic tracking-tighter text-sm hover:bg-zinc-50"
                   >
                     Stay Live
                   </button>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StreamControls;
