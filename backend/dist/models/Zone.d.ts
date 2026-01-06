export interface Zone {
    id: string;
    name: string;
    type: 'public' | 'restricted' | 'sensitive' | 'critical';
    security_level: number;
    location: string;
    access_points: number;
    authorized_users: number;
    sensors: number;
    status: 'active' | 'maintenance' | 'inactive';
    color: string;
    position: {
        x: number;
        y: number;
        z: number;
    };
    created_at: Date;
    updated_at?: Date;
}
//# sourceMappingURL=Zone.d.ts.map