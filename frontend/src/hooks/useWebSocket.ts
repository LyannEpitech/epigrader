import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { AnalysisJob } from '../types/analysis';

// Use the same host but let Socket.IO handle the port
// In development, Vite proxy forwards /socket.io to the backend
const SOCKET_URL = '/';

interface UseWebSocketOptions {
  onJobUpdate?: (job: AnalysisJob) => void;
  onStepUpdate?: (step: unknown) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const optionsRef = useRef(options);
  
  // Keep options ref up to date
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[WebSocket] Connected');
      optionsRef.current.onConnect?.();
    });

    socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
      optionsRef.current.onDisconnect?.();
    });

    socket.on('job:update', (job: AnalysisJob) => {
      console.log('[WebSocket] Job update:', job.jobId, job.status);
      optionsRef.current.onJobUpdate?.(job);
    });

    socket.on('job:step', (step: unknown) => {
      console.log('[WebSocket] Step update:', step);
      optionsRef.current.onStepUpdate?.(step);
    });

    socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const subscribeToJob = useCallback((jobId: string) => {
    if (socketRef.current?.connected) {
      console.log('[WebSocket] Subscribing to job:', jobId);
      socketRef.current.emit('subscribe:job', jobId);
    }
  }, []);

  const unsubscribeFromJob = useCallback((jobId: string) => {
    if (socketRef.current?.connected) {
      console.log('[WebSocket] Unsubscribing from job:', jobId);
      socketRef.current.emit('unsubscribe:job', jobId);
    }
  }, []);

  const isConnected = useCallback(() => {
    return socketRef.current?.connected || false;
  }, []);

  return {
    subscribeToJob,
    unsubscribeFromJob,
    isConnected,
  };
};
