import { Zone } from '../models/Zone';
export declare class ZoneService {
    static getAllZones(): Promise<Zone[]>;
    static createZone(zone: Omit<Zone, 'id' | 'created_at'>): Promise<Zone>;
}
//# sourceMappingURL=zoneService.d.ts.map