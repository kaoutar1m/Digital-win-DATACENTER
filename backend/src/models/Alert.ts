export interface Alert {
  id: string;
  title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  source?: string;
  zone_id?: string;
  equipment_id?: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'escalated';
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: Date;
  resolved_at?: Date;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  condition: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: Record<string, any>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AlertNotification {
  id: string;
  alert_id: string;
  user_id?: string;
  channel: 'email' | 'sms' | 'webhook' | 'desktop' | 'slack';
  recipient?: string;
  message: string;
  sent_at?: Date;
  status: 'pending' | 'sent' | 'failed';
  error_message?: string;
  created_at: Date;
}

export interface AlertHistory {
  id: string;
  alert_id: string;
  action: string;
  user_id?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface AlertAttachment {
  id: string;
  alert_id: string;
  filename: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  uploaded_by?: string;
  uploaded_at: Date;
}

export interface AlertComment {
  id: string;
  alert_id: string;
  user_id?: string;
  comment: string;
  is_internal: boolean;
  created_at: Date;
}
