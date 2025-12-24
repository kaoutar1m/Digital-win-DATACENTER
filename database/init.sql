CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  security_level VARCHAR(50) CHECK (security_level IN ('public', 'restricted', 'sensitive', 'critical')),
  color VARCHAR(7) NOT NULL,
  position JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE racks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES zones(id),
  name VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'operational',
  temperature DECIMAL(5,2),
  power_usage DECIMAL(10,2),
  model_path VARCHAR(500),
  position JSONB NOT NULL,
  rotation JSONB,
  scale JSONB DEFAULT '{"x":1, "y":1, "z":1}'
);

CREATE TABLE sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rack_id UUID REFERENCES racks(id),
  type VARCHAR(50) NOT NULL,
  value DECIMAL(10,2),
  threshold DECIMAL(10,2),
  alert BOOLEAN DEFAULT false,
  last_updated TIMESTAMP DEFAULT NOW()
);
