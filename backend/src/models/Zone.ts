export interface Zone {
  id: string;
  name: string;
  security_level: 'public' | 'restricted' | 'sensitive' | 'critical';
  color: string;
  position: { x: number; y: number; z: number };
  created_at: Date;
}
