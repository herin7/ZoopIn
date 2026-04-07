import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Mic, MicOff, Radio, Square, VideoOff } from 'lucide-react';
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
    <div className="relative flex h-full flex-col rounded-[2rem] border border-white/10 bg-gray-900 p-5 shadow-2xl shadow-black/30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Live Control Room</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {session?.title || 'Create a session to begin'}
          </h2>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-gray-950/80 px-4 py-2 text-sm text-gray-300">
          <span className={`h-2.5 w-2.5 rounded-full ${isLive ? 'animate-pulse-live bg-red-500' : 'bg-gray-600'}`} />
          {isLive ? 'Live' : 'Offline'}
          <span className="text-gray-500">•</span>
          <span>{viewerCount} viewers</span>
        </div>
      </div>

      <div className="relative mt-5 flex min-h-[320px] flex-1 items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/10 bg-gray-950">
        {localStream ? (
          <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
        ) : (
          <div className="text-center text-gray-400">
            <Radio size={42} className="mx-auto text-gray-600" />
            <p className="mt-4 text-lg font-medium text-gray-200">Local preview is ready when you are</p>
            <p className="mt-2 text-sm text-gray-500">
              Click Go Live to start camera capture and broadcast to the room.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCameraEnabled((currentValue) => !currentValue)}
            disabled={!localStream}
            className={`rounded-full border px-4 py-3 transition ${
              isCameraEnabled
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border-white/10 bg-gray-950 text-gray-400'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {isCameraEnabled ? <Camera size={18} /> : <VideoOff size={18} />}
          </button>
          <button
            type="button"
            onClick={() => setIsMicEnabled((currentValue) => !currentValue)}
            disabled={!localStream}
            className={`rounded-full border px-4 py-3 transition ${
              isMicEnabled
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border-white/10 bg-gray-950 text-gray-400'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {isMicEnabled ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!session || isStarting || isLive}
            onClick={goLive}
            className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-gray-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700"
          >
            {isStarting ? 'Starting...' : 'Go Live'}
          </button>
          <button
            type="button"
            disabled={!session || !isLive || isEnding}
            onClick={() => setIsEndModalOpen(true)}
            className="rounded-full bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:bg-red-900"
          >
            {isEnding ? 'Ending...' : 'End Stream'}
          </button>
        </div>
      </div>

      {isEndModalOpen && (
        <div className="absolute inset-0 flex items-center justify-center rounded-[2rem] bg-black/70 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[1.5rem] border border-white/10 bg-gray-900 p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-500/15 p-2 text-red-300">
                <Square size={18} />
              </div>
              <h3 className="text-lg font-semibold">End the live stream?</h3>
            </div>
            <p className="mt-3 text-sm text-gray-300">
              This disconnects the host and tells viewers the session has ended.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEndModalOpen(false)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:border-white/20 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={endStream}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
              >
                Confirm End
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamControls;
