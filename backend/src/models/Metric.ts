export interface Metric {
  id: number;
  equipment_id: number;
  metric_type: string;
  value: number;
  unit: string;
  timestamp: Date;
}

export interface MetricAggregate {
  equipment_id: string;
  type: string;
  period: '1m' | '5m' | '15m' | '1h' | '1d' | '1w';
  timestamp: Date;
  min_value: number;
  max_value: number;
  avg_value: number;
  count: number;
}

export interface SystemMetrics {
  total_power_consumption: number;
  average_temperature: number;
  total_alerts_active: number;
  total_equipment_online: number;
  total_equipment_offline: number;
  network_utilization: number;
  pue_ratio: number; // Power Usage Effectiveness
  timestamp: Date;
}
