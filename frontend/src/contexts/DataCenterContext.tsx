import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { apiService, Camera, Zone, Alert, Equipment } from '../services/api';

// Re-export types for convenience
export type { Camera, Zone, Alert, Equipment };

interface DataCenterState {
  cameras: Camera[];
  zones: Zone[];
  alerts: Alert[];
  equipment: Equipment[];
  loading: {
    cameras: boolean;
    zones: boolean;
    alerts: boolean;
    equipment: boolean;
  };
  error: {
    cameras: string | null;
    zones: string | null;
    alerts: string | null;
    equipment: string | null;
  };
  lastUpdated: Date | null;
}

type DataCenterAction =
  | { type: 'SET_LOADING'; payload: { key: keyof DataCenterState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof DataCenterState['error']; value: string | null } }
  | { type: 'SET_CAMERAS'; payload: Camera[] }
  | { type: 'SET_ZONES'; payload: Zone[] }
  | { type: 'SET_ALERTS'; payload: Alert[] }
  | { type: 'SET_EQUIPMENT'; payload: Equipment[] }
  | { type: 'ACKNOWLEDGE_ALERT'; payload: string }
  | { type: 'DELETE_ZONE'; payload: string }
  | { type: 'UPDATE_EQUIPMENT'; payload: Equipment }
  | { type: 'SET_LAST_UPDATED'; payload: Date };

interface DataCenterContextType {
  state: DataCenterState;
  actions: {
    refreshCameras: () => Promise<void>;
    refreshZones: () => Promise<void>;
    refreshAlerts: () => Promise<void>;
    refreshEquipment: () => Promise<void>;
    acknowledgeAlert: (alertId: string) => Promise<void>;
    deleteZone: (zoneId: string) => Promise<void>;
    updateEquipment: (equipment: Equipment) => Promise<void>;
  };
}

const initialState: DataCenterState = {
  cameras: [],
  zones: [],
  alerts: [],
  equipment: [],
  loading: {
    cameras: false,
    zones: false,
    alerts: false,
    equipment: false,
  },
  error: {
    cameras: null,
    zones: null,
    alerts: null,
    equipment: null,
  },
  lastUpdated: null,
};

function dataCenterReducer(state: DataCenterState, action: DataCenterAction): DataCenterState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value },
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: { ...state.error, [action.payload.key]: action.payload.value },
      };
    case 'SET_CAMERAS':
      return {
        ...state,
        cameras: action.payload,
        loading: { ...state.loading, cameras: false },
        error: { ...state.error, cameras: null },
        lastUpdated: new Date(),
      };
    case 'SET_ZONES':
      return {
        ...state,
        zones: action.payload,
        loading: { ...state.loading, zones: false },
        error: { ...state.error, zones: null },
        lastUpdated: new Date(),
      };
    case 'SET_ALERTS':
      return {
        ...state,
        alerts: action.payload,
        loading: { ...state.loading, alerts: false },
        error: { ...state.error, alerts: null },
        lastUpdated: new Date(),
      };
    case 'SET_EQUIPMENT':
      return {
        ...state,
        equipment: action.payload,
        loading: { ...state.loading, equipment: false },
        error: { ...state.error, equipment: null },
        lastUpdated: new Date(),
      };
    case 'ACKNOWLEDGE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map(alert =>
          alert.id === action.payload ? { ...alert, acknowledged: true } : alert
        ),
      };
    case 'DELETE_ZONE':
      return {
        ...state,
        zones: state.zones.filter(zone => zone.id !== action.payload),
      };
    case 'UPDATE_EQUIPMENT':
      return {
        ...state,
        equipment: state.equipment.map(eq =>
          eq.id === action.payload.id ? action.payload : eq
        ),
      };
    case 'SET_LAST_UPDATED':
      return {
        ...state,
        lastUpdated: action.payload,
      };
    default:
      return state;
  }
}

const DataCenterContext = createContext<DataCenterContextType | undefined>(undefined);

export const useDataCenter = () => {
  const context = useContext(DataCenterContext);
  if (!context) {
    throw new Error('useDataCenter must be used within a DataCenterProvider');
  }
  return context;
};

interface DataCenterProviderProps {
  children: ReactNode;
}

export const DataCenterProvider: React.FC<DataCenterProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dataCenterReducer, initialState);

  const refreshCameras = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'cameras', value: true } });
    try {
      const cameras = await apiService.cameras.getAll();
      dispatch({ type: 'SET_CAMERAS', payload: cameras });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { key: 'cameras', value: 'Failed to load cameras' } });
      throw error;
    }
  }, []);

  const refreshZones = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'zones', value: true } });
    try {
      const zones = await apiService.zones.getAll();
      dispatch({ type: 'SET_ZONES', payload: zones });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { key: 'zones', value: 'Failed to load zones' } });
      throw error;
    }
  }, []);

  const refreshAlerts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'alerts', value: true } });
    try {
      const alerts = await apiService.alerts.getAll();
      dispatch({ type: 'SET_ALERTS', payload: alerts });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { key: 'alerts', value: 'Failed to load alerts' } });
      throw error;
    }
  }, []);

  const refreshEquipment = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'equipment', value: true } });
    try {
      const equipment = await apiService.equipment.getAll();
      dispatch({ type: 'SET_EQUIPMENT', payload: equipment });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { key: 'equipment', value: 'Failed to load equipment' } });
      throw error;
    }
  }, []);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await apiService.alerts.acknowledge(alertId);
      dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: alertId });
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteZone = useCallback(async (zoneId: string) => {
    try {
      await apiService.zones.delete(zoneId);
      dispatch({ type: 'DELETE_ZONE', payload: zoneId });
    } catch (error) {
      throw error;
    }
  }, []);

  const updateEquipment = useCallback(async (equipment: Equipment) => {
    try {
      await apiService.equipment.update(equipment.id, equipment);
      dispatch({ type: 'UPDATE_EQUIPMENT', payload: equipment });
    } catch (error) {
      throw error;
    }
  }, []);

  const value: DataCenterContextType = {
    state,
    actions: {
      refreshCameras,
      refreshZones,
      refreshAlerts,
      refreshEquipment,
      acknowledgeAlert,
      deleteZone,
      updateEquipment,
    },
  };

  return (
    <DataCenterContext.Provider value={value}>
      {children}
    </DataCenterContext.Provider>
  );
};
