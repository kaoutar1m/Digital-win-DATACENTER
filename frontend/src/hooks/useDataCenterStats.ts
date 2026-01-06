import { useEffect, useState } from 'react';
import { useSocket } from '../providers/SocketProvider';

export const useDataCenterStats = () => {
  const { socket, isConnected } = useSocket();
  const [stats, setStats] = useState({
    totalRacks: 0,
    activeServers: 0,
    powerConsumption: 0,
    temperature: 0,
    efficiency: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Écouter les mises à jour de statistiques
    const handleStatsUpdate = (newStats: typeof stats) => {
      setStats(newStats);
      setLoading(false);
    };

    socket.on('stats:update', handleStatsUpdate);

    // Demander les statistiques initiales
    socket.emit('stats:request');

    // Timeout to avoid infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        setError('Timeout while retrieving statistics');
        setLoading(false);
      }
    }, 5000);

    return () => {
      socket.off('stats:update', handleStatsUpdate);
      clearTimeout(timeoutId);
    };
  }, [socket, isConnected]);

  return { stats, loading, error };
};