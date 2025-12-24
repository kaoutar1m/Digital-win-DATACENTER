export interface Rack {
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
