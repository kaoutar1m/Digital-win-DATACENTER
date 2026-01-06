export interface Rack {
  id: string;
  zone_id?: string;
  name: string;
  status: string;
  size_u: number;
  location: string;
  total_power_capacity: number;
  total_cooling_capacity: number;
  temperature?: number;
  power_usage?: number;
  model_path?: string;
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  created_at: Date;
  updated_at: Date;
}

export interface RackLayout {
  rack_id: string;
  equipment: Array<{
    id: string;
    name: string;
    type: string;
    position_u: number; // Starting U position
    size_u: number; // Height in U
    power_consumption: number;
    status: string;
  }>;
  total_power: number;
  available_u: number;
  utilization_percentage: number;
}
