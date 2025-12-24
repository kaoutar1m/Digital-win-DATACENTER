import { Rack } from '../models/Rack';
export declare class RackService {
    static getAllRacks(): Promise<Rack[]>;
    static createRack(rack: Omit<Rack, 'id'>): Promise<Rack>;
}
//# sourceMappingURL=rackService.d.ts.map