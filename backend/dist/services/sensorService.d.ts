export interface Sensor {
    id: string;
    rack_id: string;
    type: 'temperature' | 'humidity' | 'power' | 'smoke' | 'motion' | 'door';
    value: number;
    threshold: number;
    alert: boolean;
    last_updated: Date;
}
export interface CreateSensorDTO {
    rack_id: string;
    type: 'temperature' | 'humidity' | 'power' | 'smoke' | 'motion' | 'door';
    value: number;
    threshold: number;
    alert?: boolean;
}
export interface UpdateSensorValueDTO {
    id: string;
    value: number;
}
export interface SensorWithRackInfo extends Sensor {
    rack_name?: string;
    rack_status?: string;
    zone_name?: string;
    security_level?: string;
}
export declare class SensorService {
    static getAllSensors(includeRackInfo?: boolean): Promise<SensorWithRackInfo[]>;
    static getSensorsWithAlerts(): Promise<SensorWithRackInfo[]>;
    static getSensorById(id: string): Promise<SensorWithRackInfo | null>;
    static createSensor(sensorData: CreateSensorDTO): Promise<Sensor>;
    static updateSensorValue(id: string, value: number): Promise<Sensor>;
    static updateSensorThreshold(id: string, threshold: number): Promise<Sensor>;
    static deleteSensor(id: string): Promise<boolean>;
    static getSensorsByRack(rackId: string): Promise<Sensor[]>;
    static getSensorStatistics(): Promise<{
        total_sensors: number;
        alerting_sensors: number;
        sensor_types: {
            [key: string]: number;
        };
        average_value_by_type: {
            [key: string]: number;
        };
    }>;
    static getSensorHistory(id: string, limit?: number): Promise<Array<{
        value: number;
        timestamp: Date;
    }>>;
    static bulkUpdateSensorValues(updates: Array<{
        id: string;
        value: number;
    }>): Promise<Sensor[]>;
}
export declare const sensorService: SensorService;
//# sourceMappingURL=sensorService.d.ts.map