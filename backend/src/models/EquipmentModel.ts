export interface EquipmentModel {
  id: string;
  model: string;
  vendor: string;
  type: 'server' | 'switch' | 'router' | 'storage' | 'ups' | 'cooling' | 'power';
  specs_template: {
    height_u?: number;
    width_mm?: number;
    depth_mm?: number;
    weight_kg?: number;
    power_consumption_w?: number;
    cooling_requirement_btuh?: number;
    network_ports?: number;
    storage_capacity_gb?: number;
    cpu_cores?: number;
    memory_gb?: number;
    interfaces?: string[];
    certifications?: string[];
  };
  default_power_consumption: number;
  default_rack_units: number;
  created_at: Date;
  updated_at: Date;
}

export interface EquipmentHistory {
  id: string;
  equipment_id: string;
  event_type: 'created' | 'updated' | 'maintenance' | 'moved' | 'replaced' | 'decommissioned';
  details: {
    previous_values?: Record<string, any>;
    new_values?: Record<string, any>;
    user_id?: string;
    notes?: string;
    maintenance_type?: string;
    cost?: number;
    vendor?: string;
  };
  timestamp: Date;
}
