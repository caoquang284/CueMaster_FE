'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';

export function useWebSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const socketInstance = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
  }, [socket]);

  const emit = useCallback((event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  }, [socket, isConnected]);

  return { socket, isConnected, subscribe, emit };
}

// Hook for table updates
export function useTableUpdates(onUpdate: (data: any) => void) {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe?.('table:updated', onUpdate);
    return () => unsubscribe?.();
  }, [subscribe, onUpdate]);
}

// Hook for booking updates
export function useBookingUpdates(onUpdate: (data: any) => void) {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe?.('booking:updated', onUpdate);
    return () => unsubscribe?.();
  }, [subscribe, onUpdate]);
}

// Hook for order updates
export function useOrderUpdates(onUpdate: (data: any) => void) {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe?.('order:updated', onUpdate);
    return () => unsubscribe?.();
  }, [subscribe, onUpdate]);
}

// Hook for notifications
export function useNotificationUpdates(onNotification: (data: any) => void) {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe?.('notification', onNotification);
    return () => unsubscribe?.();
  }, [subscribe, onNotification]);
}
