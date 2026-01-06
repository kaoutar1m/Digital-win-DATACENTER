export interface Camera {
  id: string;
  zone_id: string;
  name: string;
  type: 'fixed' | 'ptz' | 'thermal' | 'infrared' | 'fisheye';
  status: 'online' | 'offline' | 'maintenance' | 'error';
  position_3d: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  fov: number; // Field of view in degrees
  resolution: string; // e.g., "1920x1080"
  stream_url?: string;
  recording_enabled: boolean;
  motion_detection: boolean;
  ai_enabled: boolean;
  detections: Detection[];
  last_motion?: Date;
  last_recording?: Date;
  ip_address?: string;
  mac_address?: string;
  firmware_version?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Detection {
  id: string;
  camera_id: string;
  type: 'motion' | 'person' | 'vehicle' | 'animal' | 'object' | 'face';
  confidence: number; // 0-1
  bounding_box?: { x: number; y: number; width: number; height: number };
  timestamp: Date;
  snapshot_url?: string;
  metadata?: Record<string, any>;
}
