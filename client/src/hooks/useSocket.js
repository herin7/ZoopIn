import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

/**
 * Creates and manages a socket.io connection for a live room participant.
 *
 * @param {string} roomId
 * @param {'host' | 'viewer'} role
 * @returns {{ socket: import('socket.io-client').Socket | null, isConnected: boolean }}
 */
export const useSocket = (roomId, role) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
    });

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    setSocket(socketInstance);
    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    socketInstance.on('connect_error', handleDisconnect);

    return () => {
      if (roomId && socketInstance.connected) {
        const leaveEvent = role === 'host' ? 'host:leave' : 'viewer:leave';
        socketInstance.emit(leaveEvent, { roomId });
      }

      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.off('connect_error', handleDisconnect);
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [roomId, role]);

  return { socket, isConnected };
};
