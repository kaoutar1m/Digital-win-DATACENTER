export interface AccessLog {
  id: string;
  user_id: string;
  zone_id?: string;
  action: 'entry' | 'exit' | 'access_granted' | 'access_denied' | 'emergency_override';
  access_type?: string;
  access_method?: string;
  biometric_type?: 'fingerprint' | 'facial' | 'iris' | 'voice' | 'rfid' | 'pin';
  success: boolean;
  reason?: string; // For denied access
  timestamp: Date;
  location?: string;
  device_id?: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface SecurityEvent {
  id: string;
  type: 'intrusion' | 'tamper' | 'unauthorized_access' | 'system_breach' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  zone_id?: string;
  camera_id?: string;
  sensor_id?: string;
  timestamp: Date;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: Date;
  evidence_urls?: string[];
}
