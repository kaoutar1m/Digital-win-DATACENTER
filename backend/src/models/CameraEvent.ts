export interface CameraEvent {
  id: string;
  camera_id: string;
  event_type: string;
  timestamp: Date;
  details: Record<string, any>;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  snapshot_url?: string;
}
