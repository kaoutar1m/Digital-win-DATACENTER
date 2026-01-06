import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { io, Socket } from 'socket.io-client';

// Types
export type AlertLevel = 'critical' | 'warning' | 'info' | 'success';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'escalated';

export interface Alert {
  id: string;
  title: string;
  description?: string;
  severity: AlertSeverity;
  type: string;
  source?: string;
  zone_id?: string;
  equipment_id?: string;
  status: AlertStatus;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: Date;
  resolved_at?: Date;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
  zone_name?: string;
  equipment_type?: string;
  // Legacy fields for backward compatibility
  level?: AlertLevel;
  message?: string;
  timestamp?: Date;
  position?: { x: number; y: number; z: number };
  zone?: string;
  equipment?: string;
  rack_id?: string;
}

// Alert colors
export const alertColors: Record<AlertLevel, string> = {
  critical: '#FF6B6B',
  warning: '#FFD166',
  info: '#4A90E2',
  success: '#00FF88'
};

// Zustand store interface
interface AlertStore {
  alerts: Alert[];
  socket: Socket | null;
  isConnected: boolean;
  isSimulating: boolean;
  simulationInterval: NodeJS.Timeout | null;
  loading: boolean;
  error: string | null;

  // Actions
  addAlert: (alert: Omit<Alert, 'id'>) => void;
  acknowledgeAlert: (id: string) => void;
  clearAlert: (id: string) => void;
  clearAllAlerts: () => void;
  getAlertsByLevel: (level: AlertLevel) => Alert[];
  getUnacknowledgedAlerts: () => Alert[];
  startRealTimeSimulation: () => void;
  stopRealTimeSimulation: () => void;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Create the Zustand store with persistence
export const useAlertStore = create<AlertStore>()(
  persist(
    (set, get) => ({
      alerts: [],
      socket: null,
      isConnected: false,
      isSimulating: false,
      simulationInterval: null,
      loading: false,
      error: null,

      addAlert: (alertData) => {
        const newAlert: Alert = {
          id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          ...alertData
        };

        set((state) => ({
          alerts: [newAlert, ...state.alerts]
        }));

        // Emit to WebSocket if connected
        const { socket, isConnected } = get();
        if (socket && isConnected) {
          socket.emit('alert:new', newAlert);
        }
      },

      acknowledgeAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.map(alert =>
            alert.id === id ? { ...alert, acknowledged: true } : alert
          )
        }));

        // Emit to WebSocket if connected
        const { socket, isConnected } = get();
        if (socket && isConnected) {
          socket.emit('alert:acknowledge', { id });
        }
      },

      clearAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.filter(alert => alert.id !== id)
        }));
      },

      clearAllAlerts: () => {
        set({ alerts: [] });
      },

      getAlertsByLevel: (level) => {
        return get().alerts.filter(alert => alert.level === level);
      },

      getUnacknowledgedAlerts: () => {
        return get().alerts.filter(alert => !alert.acknowledged);
      },

      startRealTimeSimulation: () => {
        const { isSimulating } = get();
        if (isSimulating) return;

        set({ isSimulating: true });

        const interval = setInterval(() => {
          const zones = ['Outer Perimeter', 'Main Entrance', 'Server Rooms', 'Network Room', 'High Density Storage', 'Backup & Generator'];
          const equipments = ['Server Rack A1', 'Switch SW-01', 'Router RT-01', 'UPS Unit 1', 'Camera CAM-001'];
          const messages = {
            critical: [
              'CRITICAL: Power failure detected!',
              'CRITICAL: Temperature exceeds safe limits!',
              'CRITICAL: Security breach detected!',
              'CRITICAL: Hardware failure imminent!'
            ],
            warning: [
              'WARNING: High temperature detected',
              'WARNING: Unusual network activity',
              'WARNING: Power consumption spike',
              'WARNING: Sensor malfunction'
            ],
            info: [
              'INFO: Routine maintenance completed',
              'INFO: System update available',
              'INFO: Backup completed successfully',
              'INFO: Network traffic normal'
            ],
            success: [
              'SUCCESS: All systems operational',
              'SUCCESS: Backup verification passed',
              'SUCCESS: Security scan completed',
              'SUCCESS: Performance optimization applied'
            ]
          };

          const levels: AlertLevel[] = ['critical', 'warning', 'info', 'success'];
          const randomLevel = levels[Math.floor(Math.random() * levels.length)];
          const randomZone = zones[Math.floor(Math.random() * zones.length)];
          const randomEquipment = Math.random() > 0.5 ? equipments[Math.floor(Math.random() * equipments.length)] : undefined;
          const randomMessage = messages[randomLevel][Math.floor(Math.random() * messages[randomLevel].length)];

          // Add 3D position for React Three Fiber integration
          const position = Math.random() > 0.7 ? {
            x: (Math.random() - 0.5) * 20,
            y: Math.random() * 5,
            z: (Math.random() - 0.5) * 20
          } : undefined;

          get().addAlert({
            title: randomMessage,
            description: `Alert from ${randomZone}`,
            severity: randomLevel === 'critical' ? 'critical' : randomLevel === 'warning' ? 'high' : randomLevel === 'info' ? 'medium' : 'low',
            type: 'system',
            source: 'simulation',
            zone_name: randomZone,
            equipment_type: randomEquipment,
            status: 'active',
            acknowledged: false,
            created_at: new Date(),
            updated_at: new Date(),
            // Legacy fields for backward compatibility
            level: randomLevel,
            message: `${randomMessage} - ${randomZone}`,
            timestamp: new Date(),
            position,
            zone: randomZone,
            equipment: randomEquipment
          });
        }, 8000); // Generate alert every 8 seconds

        set({ simulationInterval: interval });
      },

      stopRealTimeSimulation: () => {
        const { simulationInterval } = get();
        if (simulationInterval) {
          clearInterval(simulationInterval);
        }
        set({ isSimulating: false, simulationInterval: null });
      },

      connectWebSocket: () => {
        const socket = io('http://localhost:3001', {
          transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
          set({ isConnected: true });
          console.log('Alert system connected to WebSocket');
        });

        socket.on('disconnect', () => {
          set({ isConnected: false });
          console.log('Alert system disconnected from WebSocket');
        });

        socket.on('alert:new', (alert: Alert) => {
          get().addAlert(alert);
        });

        socket.on('alert:acknowledged', (data: { id: string }) => {
          get().acknowledgeAlert(data.id);
        });

        set({ socket });
      },

      disconnectWebSocket: () => {
        const { socket } = get();
        if (socket) {
          socket.disconnect();
          set({ socket: null, isConnected: false });
        }
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      setError: (error: string | null) => {
        set({ error });
      }
    }),
    {
      name: 'alert-system-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        alerts: state.alerts.filter(alert => !alert.acknowledged).slice(0, 50) // Keep only last 50 unacknowledged alerts
      })
    }
  )
);

// React hook for easy usage with React Three Fiber
export const useAlertSystem = () => {
  const store = useAlertStore();

  // Auto-connect WebSocket on mount
  React.useEffect(() => {
    store.connectWebSocket();
    store.startRealTimeSimulation();

    return () => {
      store.stopRealTimeSimulation();
      store.disconnectWebSocket();
    };
  }, []);

  return {
    // State
    alerts: store.alerts,
    isConnected: store.isConnected,
    isSimulating: store.isSimulating,

    // Actions
    addAlert: store.addAlert,
    acknowledgeAlert: store.acknowledgeAlert,
    clearAlert: store.clearAlert,
    clearAllAlerts: store.clearAllAlerts,
    getAlertsByLevel: store.getAlertsByLevel,
    getUnacknowledgedAlerts: store.getUnacknowledgedAlerts,

    // Simulation controls
    startRealTimeSimulation: store.startRealTimeSimulation,
    stopRealTimeSimulation: store.stopRealTimeSimulation,

    // WebSocket controls
    connectWebSocket: store.connectWebSocket,
    disconnectWebSocket: store.disconnectWebSocket
  };
};

// Utility functions for React Three Fiber integration
export const useAlertPositions = () => {
  const alerts = useAlertStore((state) => state.alerts);
  return alerts.filter(alert => alert.position !== undefined);
};

export const useAlertById = (id: string) => {
  return useAlertStore((state) => state.alerts.find(alert => alert.id === id));
};
