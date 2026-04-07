import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Heart, ThumbsUp, Flame, Star, Send } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { useWebRTCViewer } from '../hooks/useWebRTCViewer';
import { useReactions } from '../hooks/useReactions';
import { useSessionStore } from '../store/sessionStore';
import { useReactionStore } from '../store/reactionStore';

const userId = `user-${Math.floor(Math.random() * 10000)}`;
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

const LiveSession = () => {
  const { roomId } = useParams();
  const [loading, setLoading] = useState(true);
  const [questionText, setQuestionText] = useState('');

  const { session, setSession, viewerCount, setViewerCount } = useSessionStore();
  const { questions, addQuestion } = useReactionStore();

  const { socket } = useSocket(roomId, 'viewer');
  const { remoteStream, error: streamError } = useWebRTCViewer(socket, roomId);
  const { reactionCounts, sendReaction, animatingReactions } = useReactions(
    socket,
    roomId,
    session?._id
  );
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/sessions/${roomId}`);

        if (response.data.success) {
          setSession(response.data.data);
          setViewerCount(response.data.data.viewerCount);
        }
      } catch (error) {
        console.error('Session error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [roomId, setSession, setViewerCount]);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleSessionState = ({ data }) => {
      if (data?.session) {
        setSession(data.session);
      }

      if (typeof data?.viewerCount === 'number') {
        setViewerCount(data.viewerCount);
      }
    };

    const handleQuestionAnswered = (question) => {
      addQuestion(question);
    };

    const handleProductChanged = ({ currentProduct }) => {
      if (!currentProduct) {
        return;
      }

      setSession((previousSession) => {
        if (!previousSession) {
          return previousSession;
        }

        return {
          ...previousSession,
          currentProduct,
        };
      });
    };

    socket.on('session:state', handleSessionState);
    socket.on('question:answered', handleQuestionAnswered);
    socket.on('product:changed', handleProductChanged);

    return () => {
      socket.off('session:state', handleSessionState);
      socket.off('question:answered', handleQuestionAnswered);
      socket.off('product:changed', handleProductChanged);
    };
  }, [addQuestion, setSession, setViewerCount, socket]);

  useEffect(() => {
    if (!videoRef.current || !remoteStream) {
      return;
    }

    videoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  const askQuestion = (event) => {
    event.preventDefault();

    if (!questionText.trim() || !socket || !session?._id) {
      return;
    }

    const payload = {
      roomId,
      sessionId: session._id,
      viewerId: userId,
      viewerName: `Guest ${userId.substring(5)}`,
      text: questionText.trim(),
    };

    socket.emit('question:submit', payload);
    addQuestion({
      ...payload,
      timestamp: new Date().toISOString(),
    });
    setQuestionText('');
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return <div className="flex h-screen items-center justify-center">Session not found</div>;
  }

  return (
    <div className="flex h-screen flex-col bg-gray-900 text-white md:flex-row">
      <div className="relative flex flex-1 flex-col items-center justify-center p-4">
        <div className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-sm font-bold">
          {session.status === 'live' ? 'LIVE' : 'WAITING'}
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-sm font-bold">
          {viewerCount} viewers
        </div>

        <div className="flex w-full aspect-video items-center justify-center rounded-lg border border-gray-700 bg-black">
          {!remoteStream && (
            <p className="text-gray-500">{streamError || 'Waiting for host stream...'}</p>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={remoteStream ? 'h-full w-full rounded-lg object-cover' : 'hidden'}
          />
        </div>

        <div className="relative mt-6 flex gap-4 rounded-full bg-gray-800 p-3">
          {animatingReactions.slice(-3).map((reaction) => (
            <span
              key={reaction.id}
              className="absolute -top-8 rounded-full bg-gray-700 px-2 py-1 text-xs text-gray-200"
            >
              {reaction.emoji}
            </span>
          ))}
          <button
            onClick={() => sendReaction('like')}
            className="text-blue-400 transition hover:scale-110 hover:text-blue-300"
          >
            <ThumbsUp />
          </button>
          <button
            onClick={() => sendReaction('heart')}
            className="text-red-400 transition hover:scale-110 hover:text-red-300"
          >
            <Heart />
          </button>
          <button
            onClick={() => sendReaction('fire')}
            className="text-orange-400 transition hover:scale-110 hover:text-orange-300"
          >
            <Flame />
          </button>
          <button
            onClick={() => sendReaction('wow')}
            className="text-yellow-400 transition hover:scale-110 hover:text-yellow-300"
          >
            <Star />
          </button>
        </div>

        <div className="mt-3 text-sm text-gray-300">
          Likes {reactionCounts.like} | Hearts {reactionCounts.heart} | Fire{' '}
          {reactionCounts.fire} | Wow {reactionCounts.wow}
        </div>
      </div>

      <div className="flex h-1/2 w-full flex-col border-l border-gray-700 bg-gray-800 md:h-full md:w-80">
        <div className="border-b border-gray-700 p-4 text-lg font-bold">Live Q and A</div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {questions.map((question, index) => (
            <div key={`${question.timestamp}-${index}`} className="rounded-md bg-gray-700 p-3">
              <div className="text-sm font-bold text-teal-400">{question.viewerName}</div>
              <div className="mt-1 text-sm">{question.text}</div>
            </div>
          ))}
          {questions.length === 0 && (
            <p className="text-sm italic text-gray-500">
              No questions yet. Be the first to ask.
            </p>
          )}
        </div>

        <div className="border-t border-gray-700 p-4">
          <form onSubmit={askQuestion} className="flex gap-2">
            <input
              type="text"
              className="flex-1 rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
              placeholder="Ask a question..."
              value={questionText}
              onChange={(event) => setQuestionText(event.target.value)}
            />
            <button type="submit" className="rounded-md bg-teal-600 p-2 transition hover:bg-teal-700">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LiveSession;
