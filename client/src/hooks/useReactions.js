import { useEffect, useRef, useState } from 'react';

const VIEWER_STORAGE_KEY = 'live-commerce-viewer-id';
const REACTION_TYPES = ['like', 'fire', 'heart', 'wow'];
const EMOJI_BY_TYPE = {
  like: '👍',
  fire: '🔥',
  heart: '❤️',
  wow: '😮',
};

const getViewerId = () => {
  const existingViewerId = window.localStorage.getItem(VIEWER_STORAGE_KEY);

  if (existingViewerId) {
    return existingViewerId;
  }

  const viewerId = window.crypto.randomUUID();
  window.localStorage.setItem(VIEWER_STORAGE_KEY, viewerId);
  return viewerId;
};

/**
 * Tracks and sends live reaction events for a viewer room.
 *
 * @param {import('socket.io-client').Socket | null} socket
 * @param {string} roomId
 * @param {string | undefined} sessionId
 * @returns {{ reactionCounts: { like: number, fire: number, heart: number, wow: number }, sendReaction: (type: 'like' | 'fire' | 'heart' | 'wow') => void, animatingReactions: Array<{ id: string, type: string, emoji: string }> }}
 */
export const useReactions = (socket, roomId, sessionId) => {
  const [reactionCounts, setReactionCounts] = useState({
    like: 0,
    fire: 0,
    heart: 0,
    wow: 0,
  });
  const [animatingReactions, setAnimatingReactions] = useState([]);
  const timeoutIdsRef = useRef(new Set());

  const queueAnimation = (type, position = null) => {
    const id = window.crypto.randomUUID();
    const animation = {
      id,
      type,
      emoji: EMOJI_BY_TYPE[type],
      x: position?.x ?? null,
      y: position?.y ?? null,
    };

    setAnimatingReactions((previousAnimations) => [...previousAnimations, animation]);

    const timeoutId = window.setTimeout(() => {
      setAnimatingReactions((previousAnimations) =>
        previousAnimations.filter((item) => item.id !== id)
      );
      timeoutIdsRef.current.delete(timeoutId);
    }, 2200);

    timeoutIdsRef.current.add(timeoutId);
  };

  const sendReaction = (type, position = null) => {
    if (!socket || !sessionId || !REACTION_TYPES.includes(type)) {
      return;
    }

    queueAnimation(type, position);
    socket.emit('reaction:send', {
      roomId,
      sessionId,
      type,
      userId: getViewerId(),
    });
  };

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleReactionUpdate = ({ counts, latestReactionType }) => {
      if (counts) {
        setReactionCounts((previousCounts) => ({
          ...previousCounts,
          ...counts,
        }));
      }

      if (latestReactionType && EMOJI_BY_TYPE[latestReactionType]) {
        queueAnimation(latestReactionType);
      }
    };

    const handleSessionState = ({ data }) => {
      if (data?.reactionCounts) {
        setReactionCounts((previousCounts) => ({
          ...previousCounts,
          ...data.reactionCounts,
        }));
      }
    };

    socket.on('reaction:update', handleReactionUpdate);
    socket.on('session:state', handleSessionState);

    return () => {
      socket.off('reaction:update', handleReactionUpdate);
      socket.off('session:state', handleSessionState);
      timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutIdsRef.current.clear();
    };
  }, [socket]);

  return { reactionCounts, sendReaction, animatingReactions };
};
