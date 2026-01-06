import { Pool } from 'pg';
import 'dotenv/config';
declare const pool: Pool;
interface Sensor {
    id: number;
    name: string;
    type: string;
    zone_id: number;
    status: string;
    last_reading: number;
    unit: string;
    created_at: Date;
}
export declare const getSensors: () => Promise<Sensor[]>;
export default pool;
//# sourceMappingURL=database.d.ts.map