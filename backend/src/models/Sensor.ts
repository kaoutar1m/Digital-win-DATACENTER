export interface Sensor {
  id: string;
  rack_id: string;
  type: string;
  value?: number;
  threshold?: number;
  alert: boolean;
  last_updated: Date;
}
