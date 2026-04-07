import { useEffect, useRef, useState } from 'react';

const ICE_CONFIGURATION = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

/**
 * Manages broadcaster-side WebRTC connections for one host and many viewers.
 *
 * @param {import('socket.io-client').Socket | null} socket
 * @param {string} roomId
 * @param {string} [sessionId]
 * @returns {{ localStream: MediaStream | null, startStream: () => Promise<MediaStream | null>, stopStream: () => void, viewerCount: number }}
 */
export const useWebRTC = (socket, roomId, sessionId) => {
  const connectionsRef = useRef(new Map());
  const streamRef = useRef(null);
  const pendingViewerIdsRef = useRef(new Set());

  const [localStream, setLocalStream] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);

  const cleanupConnection = (viewerId) => {
    const connection = connectionsRef.current.get(viewerId);

    if (connection) {
      connection.onicecandidate = null;
      connection.onconnectionstatechange = null;
      connection.close();
      connectionsRef.current.delete(viewerId);
    }
  };

  const createPeerConnection = (viewerId) => {
    cleanupConnection(viewerId);

    const peerConnection = new RTCPeerConnection(ICE_CONFIGURATION);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, streamRef.current);
      });
    }

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          roomId,
          to: viewerId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      if (['closed', 'disconnected', 'failed'].includes(peerConnection.connectionState)) {
        cleanupConnection(viewerId);
      }
    };

    connectionsRef.current.set(viewerId, peerConnection);
    return peerConnection;
  };

  const createOfferForViewer = async (viewerId) => {
    if (!socket || !streamRef.current) {
      pendingViewerIdsRef.current.add(viewerId);
      return;
    }

    const peerConnection = createPeerConnection(viewerId);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit('offer', {
      roomId,
      to: viewerId,
      sdp: offer,
    });
  };

  const startStream = async () => {
    try {
      if (streamRef.current) {
        return streamRef.current;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = mediaStream;
      setLocalStream(mediaStream);

      const pendingViewerIds = Array.from(pendingViewerIdsRef.current);
      pendingViewerIdsRef.current.clear();

      await Promise.allSettled(pendingViewerIds.map((viewerId) => createOfferForViewer(viewerId)));
      return mediaStream;
    } catch (error) {
      console.error('Failed to start host stream:', error);
      return null;
    }
  };

  const stopStream = () => {
    connectionsRef.current.forEach((_, viewerId) => cleanupConnection(viewerId));
    connectionsRef.current.clear();
    pendingViewerIdsRef.current.clear();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setLocalStream(null);
    setViewerCount(0);
  };

  useEffect(() => {
    if (!socket || !roomId) {
      return undefined;
    }

    const handleHostJoined = ({ viewerCount: currentViewerCount = 0 }) => {
      setViewerCount(currentViewerCount);
    };

    const handleViewerJoin = async ({ viewerId, viewerCount: currentViewerCount }) => {
      setViewerCount(
        typeof currentViewerCount === 'number'
          ? currentViewerCount
          : connectionsRef.current.size + 1
      );

      try {
        await createOfferForViewer(viewerId);
      } catch (error) {
        console.error('Failed to create viewer offer:', error);
      }
    };

    const handleViewerLeave = ({ viewerId, viewerCount: currentViewerCount }) => {
      cleanupConnection(viewerId);
      setViewerCount(
        typeof currentViewerCount === 'number'
          ? currentViewerCount
          : Math.max(0, connectionsRef.current.size)
      );
    };

    const handleAnswer = async ({ viewerId, sdp }) => {
      const peerConnection = connectionsRef.current.get(viewerId);

      if (!peerConnection || !sdp) {
        return;
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    };

    const handleIceCandidate = async ({ viewerId, candidate }) => {
      const peerConnection = connectionsRef.current.get(viewerId);

      if (!peerConnection || !candidate) {
        return;
      }

      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    };

    socket.on('host:joined', handleHostJoined);
    socket.on('viewer:join', handleViewerJoin);
    socket.on('viewer:leave', handleViewerLeave);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    return () => {
      socket.off('host:joined', handleHostJoined);
      socket.off('viewer:join', handleViewerJoin);
      socket.off('viewer:leave', handleViewerLeave);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      stopStream();
    };
  }, [roomId, sessionId, socket]);

  return { localStream, startStream, stopStream, viewerCount };
};
