import { useEffect, useRef, useState } from 'react';

const ICE_CONFIGURATION = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

const VIEWER_STORAGE_KEY = 'live-commerce-viewer-id';

/**
 * Manages viewer-side WebRTC playback for a live broadcast.
 *
 * @param {import('socket.io-client').Socket | null} socket
 * @param {string} roomId
 * @returns {{ remoteStream: MediaStream | null, isConnected: boolean, error: string | null }}
 */
export const useWebRTCViewer = (socket, roomId) => {
  const peerConnectionRef = useRef(null);
  const remoteStreamRef = useRef(new MediaStream());
  const viewerIdRef = useRef(
    typeof window !== 'undefined' ? window.localStorage.getItem(VIEWER_STORAGE_KEY) : null
  );

  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const cleanupPeerConnection = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    remoteStreamRef.current = new MediaStream();
    setRemoteStream(null);
    setIsConnected(false);
  };

  const getPeerConnection = () => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const peerConnection = new RTCPeerConnection(ICE_CONFIGURATION);

    peerConnection.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => {
        remoteStreamRef.current.addTrack(track);
      });

      setRemoteStream(new MediaStream(remoteStreamRef.current.getTracks()));
      setIsConnected(true);
      setError(null);
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      if (['closed', 'disconnected', 'failed'].includes(peerConnection.connectionState)) {
        setIsConnected(false);
      }
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  };

  useEffect(() => {
    if (!socket || !roomId) {
      return undefined;
    }

    const joinViewer = () => {
      socket.emit('viewer:join', { roomId });
    };

    const handleViewerJoined = ({ viewerId }) => {
      viewerIdRef.current = viewerId;
      window.localStorage.setItem(VIEWER_STORAGE_KEY, viewerId);
    };

    const handleOffer = async ({ viewerId, sdp }) => {
      try {
        const peerConnection = getPeerConnection();

        if (viewerIdRef.current && viewerId && viewerIdRef.current !== viewerId) {
          return;
        }

        if (viewerId) {
          viewerIdRef.current = viewerId;
        }

        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit('answer', {
          roomId,
          viewerId: viewerIdRef.current,
          sdp: answer,
        });
      } catch (offerError) {
        setError('Unable to connect to the host stream');
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      try {
        const peerConnection = getPeerConnection();

        if (candidate) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (candidateError) {
        setError('Unable to establish the media connection');
      }
    };

    const handleHostLeave = () => {
      cleanupPeerConnection();
      setError('Stream ended');
    };

    const handleSocketError = ({ message }) => {
      if (message) {
        setError(message);
      }
    };

    if (socket.connected) {
      joinViewer();
    } else {
      socket.on('connect', joinViewer);
    }

    socket.on('viewer:joined', handleViewerJoined);
    socket.on('offer', handleOffer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('host:leave', handleHostLeave);
    socket.on('error', handleSocketError);

    return () => {
      socket.off('connect', joinViewer);
      socket.off('viewer:joined', handleViewerJoined);
      socket.off('offer', handleOffer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('host:leave', handleHostLeave);
      socket.off('error', handleSocketError);
      cleanupPeerConnection();
    };
  }, [roomId, socket]);

  return { remoteStream, isConnected, error };
};
