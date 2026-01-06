import { Zone } from '../models/Zone';
import { Equipment } from '../models/Equipment';
import { Alert } from '../models/Alert';
export declare class ZoneService {
    static getAllZones(): Promise<Zone[]>;
    static getZoneById(id: string): Promise<Zone | null>;
    static createZone(zone: Omit<Zone, 'id' | 'created_at' | 'updated_at'>): Promise<Zone>;
    static updateZone(id: string, zone: Partial<Omit<Zone, 'id' | 'created_at'>>): Promise<Zone | null>;
    static deleteZone(id: string): Promise<boolean>;
    static getZoneEquipment(zoneId: string): Promise<Equipment[]>;
    static getZoneAlerts(zoneId: string): Promise<Alert[]>;
}
//# sourceMappingURL=zoneService.d.ts.map