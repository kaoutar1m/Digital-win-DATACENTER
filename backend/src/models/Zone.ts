export interface Zone {
  id: number;
  name: string;
  security_level: string;
  color: string;
  position: any; // JSONB from database
  created_at: Date;
}
