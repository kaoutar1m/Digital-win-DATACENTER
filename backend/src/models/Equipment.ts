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
  alerts: string[]; // Alert IDs
  ip_address?: string;
  mac_address?: string;
  vendor: string;
  serial_number: string;
  position: { x: number; y: number; z: number };
  created_at: Date;
  updated_at: Date;
}

export interface EquipmentMetrics {
  id: string;
  equipment_id: string;
  type: 'temperature' | 'power' | 'load' | 'memory' | 'storage' | 'uptime';
  value: number;
  timestamp: Date;
  threshold?: number;
}
