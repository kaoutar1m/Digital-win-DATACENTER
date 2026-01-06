import { Rack, RackLayout } from '../models/Rack';
export declare class RackService {
    static getAllRacks(): Promise<Rack[]>;
    static getRackById(id: string): Promise<Rack | null>;
    static createRack(rack: Omit<Rack, 'id' | 'created_at' | 'updated_at'>): Promise<Rack>;
    static updateRack(id: string, updates: Partial<Rack>): Promise<Rack | null>;
    static deleteRack(id: string): Promise<boolean>;
    static getRackLayout(rackId: string): Promise<RackLayout>;
    static updateEquipmentPosition(rackId: string, equipmentId: string, position_u: number): Promise<boolean>;
    static calculateRackPowerUsage(rackId: string): Promise<number>;
    static calculateRackCoolingRequirement(rackId: string): Promise<number>;
    static validateRackCapacity(rackId: string): Promise<{
        valid: boolean;
        issues: string[];
    }>;
    static moveEquipmentToRack(equipmentId: string, newRackId: string, position_u?: number): Promise<boolean>;
    static getRackUtilization(rackId: string): Promise<{
        power_utilization: number;
        space_utilization: number;
        cooling_utilization: number;
    }>;
}
//# sourceMappingURL=rackService.d.ts.map