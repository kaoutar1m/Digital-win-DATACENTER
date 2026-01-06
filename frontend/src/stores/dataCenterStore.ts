import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface Zone {
  id: string;
  name: string;
  security_level: 'public' | 'restricted' | 'sensitive' | 'critical';
  color: string;
  position: { x: number; y: number; z: number };
}

interface Rack {
  id: string;
  zone_id?: string;
  name: string;
  status: string;
  temperature?: number;
  power_usage?: number;
  model_path?: string;
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

interface Sensor {
  id: string;
  rack_id: string;
  type: string;
  value?: number;
  threshold?: number;
  alert: boolean;
  last_updated: Date;
}

interface Alert {
  id: string;
  sensor_id: string;
  rack_id: string;
  message: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  timestamp: Date;
  position?: { x: number; y: number; z: number };
  acknowledged?: boolean;
}

interface AccessLog {
  id: string;
  user: string;
  action: string;
  zone: string;
  timestamp: Date;
}

// Ajouter ces interfaces:
export interface Equipment {
  id: string;
  rack_id: string;
  type: 'server' | 'switch' | 'router' | 'storage' | 'ups' | 'cooling' | 'power';
  model: string;
  status: 'online' | 'offline' | 'warning' | 'critical' | 'maintenance';
  metrics: {
    temperature: number;
    power_consumption: number;
    load: number;
    memory_usage: number;
    storage_usage: number;
    uptime: number;
  };
  alerts: string[];
  ip_address?: string;
  mac_address?: string;
  vendor: string;
  serial_number: string;
  position: { x: number; y: number; z: number };
  created_at: Date;
  updated_at: Date;
}

interface Camera {
  id: string;
  zone_id: string;
  type: 'fixed' | 'ptz' | 'thermal';
  status: 'active' | 'inactive' | 'warning';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  stream_url?: string;
}

interface BiometricLog {
  id: string;
  user_id: string;
  type: 'fingerprint' | 'face' | 'card' | 'pin';
  result: 'success' | 'failure';
  timestamp: Date;
  zone: string;
}

interface DataCenterState {
  zones: Zone[];
  racks: Rack[];
  sensors: Sensor[];
  equipment: Equipment[];
  alerts: Alert[];
  accessLogs: AccessLog[];
  cameraPosition: { x: number; y: number; z: number };
  selectedZone: string | null;
  selectedRack: string | null;

  // Actions
  setZones: (zones: Zone[]) => void;
  setRacks: (racks: Rack[]) => void;
  setSensors: (sensors: Sensor[]) => void;
  setEquipment: (equipment: Equipment[]) => void;
  addAlert: (alert: Alert) => void;
  addAccessLog: (log: AccessLog) => void;
  setCameraPosition: (position: { x: number; y: number; z: number }) => void;
  setSelectedZone: (zoneId: string | null) => void;
  setSelectedRack: (rackId: string | null) => void;
}

export const useDataCenterStore = create<DataCenterState>()(
  subscribeWithSelector((set) => ({
    zones: [],
    racks: [],
    sensors: [],
    equipment: [],
    alerts: [],
    accessLogs: [],
    cameraPosition: { x: 20, y: 20, z: 20 },
    selectedZone: null,
    selectedRack: null,

    setZones: (zones) => set({ zones }),
    setRacks: (racks) => set({ racks }),
    setSensors: (sensors) => set({ sensors }),
    setEquipment: (equipment) => set({ equipment }),
    addAlert: (alert) => set((state) => ({ alerts: [...state.alerts, alert] })),
    addAccessLog: (log) => set((state) => ({ accessLogs: [...state.accessLogs, log] })),
    setCameraPosition: (position) => set({ cameraPosition: position }),
    setSelectedZone: (zoneId) => set({ selectedZone: zoneId }),
    setSelectedRack: (rackId) => set({ selectedRack: rackId }),
  }))
);
