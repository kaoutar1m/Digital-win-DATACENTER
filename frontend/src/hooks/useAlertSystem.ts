import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../providers/SocketProvider';

export type AlertLevel = 'info' | 'warning' | 'critical' | 'success';

export interface Alert {
  id: string | number;
  level: AlertLevel;
  message: string;
  timestamp: string | number | Date;
  acknowledged?: boolean;
  rack_id?: string | number;
  position?: { x: number; y: number; z: number };
}

export const alertColors: Record<AlertLevel, string> = {
  info: '#60a5fa',
  warning: '#f59e0b',
  critical: '#ef4444',
  success: '#10b981'
};

export const useAlertSystem = () => {
  const { socket, isConnected } = useSocket();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewAlert = (alert: Alert) => {
      setAlerts(prev => [...prev, alert]);
      setLoading(false);
    };

    const handleInitialAlerts = (initialAlerts: Alert[]) => {
      setAlerts(initialAlerts);
      setLoading(false);
    };

    socket.on('alert:new', handleNewAlert);
    socket.on('alert:initial', handleInitialAlerts);

    socket.emit('alert:request');

    const timeoutId = setTimeout(() => {
      if (loading) {
        setError('Timeout lors de la récupération des alertes');
        setLoading(false);
      }
    }, 5000);

    return () => {
      socket.off('alert:new', handleNewAlert);
      socket.off('alert:initial', handleInitialAlerts);
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, isConnected]);

  const acknowledgeAlert = useCallback((id: string | number) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, acknowledged: true } : a)));
    if (socket && isConnected) {
      socket.emit('alert:acknowledge', { id });
    }
  }, [socket, isConnected]);

  return { alerts, loading, error, acknowledgeAlert };
};