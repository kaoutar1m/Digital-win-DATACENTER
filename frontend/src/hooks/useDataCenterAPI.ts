import { useState, useEffect, useCallback } from 'react';
import { useDataCenterData } from './useDataCenterData';
import { useDataCenterStats } from './useDataCenterStats';
import { useAlertSystem, useAlertStore } from './useAlertSystem';

const API_BASE_URL = 'http://localhost:3001/api';

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface Zone {
  id: string;
  name: string;
  status: 'active' | 'warning' | 'critical';
  cameras: number;
  sensors: number;
}

interface Rack {
  id: string;
  name: string;
  status: 'active' | 'warning' | 'critical';
  equipmentCount: number;
}

export const useDataCenterAPI = () => {
  const { racks, sensors, zones, equipment } = useDataCenterData();
  const { stats, loading: statsLoading, error: statsError } = useDataCenterStats();
  const { alerts, isConnected, isSimulating, addAlert, acknowledgeAlert: acknowledgeAlertFromSystem, clearAlert, connectWebSocket, disconnectWebSocket } = useAlertSystem();
  const socket = useAlertStore((state) => state.socket);

  const [securityZones, setSecurityZones] = useState<Zone[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setApiLoading(true);
      setApiError(null);

      try {
        // Mock security zones data
        const mockZones: Zone[] = [
          { id: 'server-room-1', name: 'Server Room A', status: 'active', cameras: 4, sensors: 12 },
          { id: 'network-room-1', name: 'Network Room', status: 'active', cameras: 2, sensors: 6 },
          { id: 'perimeter-1', name: 'Perimeter Zone', status: 'active', cameras: 8, sensors: 4 },
          { id: 'entrance-1', name: 'Main Entrance', status: 'warning', cameras: 3, sensors: 2 },
          { id: 'storage-1', name: 'Storage Area', status: 'active', cameras: 2, sensors: 3 }
        ];
        setSecurityZones(mockZones);
      } catch (error) {
        setApiError(error instanceof Error ? error.message : 'Failed to initialize data');
      } finally {
        setApiLoading(false);
      }
    };

    initializeData();
  }, []);

  const refreshData = useCallback(async () => {
    try {
      // Request fresh stats from backend
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const newStats = await response.json();

      // Emit stats update via socket if connected
      if (isConnected) {
        socket?.emit('stats:update', newStats);
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error('Refresh data failed:', error);
      throw new Error('Failed to refresh data');
    }
  }, [isConnected, socket]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/acknowledge`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to acknowledge alert');
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  }, []);

  const deleteZone = useCallback(async (zoneId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/zones/${zoneId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete zone');
      }

      setSecurityZones(prev => prev.filter(zone => zone.id !== zoneId));
    } catch (error) {
      console.error('Error deleting zone:', error);
      throw error;
    }
  }, []);

  const addZone = useCallback(async (newZone: Omit<Zone, 'id'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newZone),
      });

      if (!response.ok) {
        throw new Error('Failed to add zone');
      }

      const createdZone = await response.json();
      setSecurityZones(prev => [...prev, createdZone]);
    } catch (error) {
      console.error('Error adding zone:', error);
      throw error;
    }
  }, []);

  return {
    stats,
    alerts,
    securityZones,
    racks,
    loading: apiLoading || statsLoading,
    error: apiError || statsError,
    refreshData,
    acknowledgeAlert,
    deleteZone,
    addZone
  };
};
