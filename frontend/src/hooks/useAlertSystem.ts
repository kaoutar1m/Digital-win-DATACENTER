import { useEffect, useState } from 'react';
import { useSocket } from '../providers/SocketProvider';

export const useAlertSystem = () => {
  const { socket, isConnected } = useSocket();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Écouter les nouvelles alertes
    const handleNewAlert = (alert: any) => {
      setAlerts(prev => [...prev, alert]);
      setLoading(false);
    };

    // Écouter les alertes initiales
    const handleInitialAlerts = (initialAlerts: any[]) => {
      setAlerts(initialAlerts);
      setLoading(false);
    };

    socket.on('alert:new', handleNewAlert);
    socket.on('alert:initial', handleInitialAlerts);

    // Demander les alertes initiales
    socket.emit('alert:request');

    // Timeout pour éviter un chargement infini
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
  }, [socket, isConnected, loading]);

  return { alerts, loading, error };
};