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

CREATE TABLE equipment (
  id VARCHAR(100) PRIMARY KEY,
  rack_id UUID REFERENCES racks(id),
  type VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'offline',
  vendor VARCHAR(100) DEFAULT 'Unknown',
  serial_number VARCHAR(100),
  ip_address INET,
  mac_address MACADDR,
  position JSONB DEFAULT '{"x":0, "y":0, "z":0}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE equipment_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id VARCHAR(100) REFERENCES equipment(id),
  temperature DECIMAL(5,2),
  power_consumption DECIMAL(10,2),
  load DECIMAL(5,2),
  memory_usage DECIMAL(5,2),
  storage_usage DECIMAL(5,2),
  uptime DECIMAL(10,2),
  recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE equipment_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model VARCHAR(100) NOT NULL,
  vendor VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  specs_template JSONB,
  default_power_consumption DECIMAL(10,2) DEFAULT 0,
  default_rack_units INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE equipment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id VARCHAR(100) REFERENCES equipment(id),
  event_type VARCHAR(50) NOT NULL,
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Add size_u and other rack fields
ALTER TABLE racks ADD COLUMN IF NOT EXISTS size_u INTEGER DEFAULT 42;
ALTER TABLE racks ADD COLUMN IF NOT EXISTS total_power_capacity DECIMAL(10,2) DEFAULT 0;
ALTER TABLE racks ADD COLUMN IF NOT EXISTS total_cooling_capacity DECIMAL(10,2) DEFAULT 0;

-- Alerts System Tables
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  type VARCHAR(50) NOT NULL,
  source VARCHAR(100),
  zone_id UUID REFERENCES zones(id),
  equipment_id VARCHAR(100) REFERENCES equipment(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'escalated')),
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP,
  resolved_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  condition JSONB NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  action JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE alert_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  user_id UUID,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'webhook', 'desktop', 'slack')),
  recipient VARCHAR(255),
  message TEXT NOT NULL,
  sent_at TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  user_id UUID,
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE alert_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  uploaded_by UUID,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE alert_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  user_id UUID,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cameras Table
CREATE TABLE cameras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  zone_id UUID REFERENCES zones(id),
  ip_address INET NOT NULL,
  port INTEGER DEFAULT 554,
  status VARCHAR(50) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance')),
  last_ping TIMESTAMP,
  stream_url VARCHAR(500),
  model VARCHAR(100),
  location JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Security Logs Table
CREATE TABLE security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  zone_id UUID REFERENCES zones(id),
  access_type VARCHAR(50) NOT NULL CHECK (access_type IN ('entry', 'exit', 'attempt', 'alarm')),
  result VARCHAR(20) NOT NULL CHECK (result IN ('success', 'failure', 'denied')),
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'operator', 'viewer')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_zone_id ON alerts(zone_id);
CREATE INDEX idx_alerts_equipment_id ON alerts(equipment_id);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alert_rules_is_active ON alert_rules(is_active);
CREATE INDEX idx_alert_notifications_alert_id ON alert_notifications(alert_id);
CREATE INDEX idx_alert_notifications_status ON alert_notifications(status);
CREATE INDEX idx_alert_history_alert_id ON alert_history(alert_id);
CREATE INDEX idx_alert_attachments_alert_id ON alert_attachments(alert_id);
CREATE INDEX idx_alert_comments_alert_id ON alert_comments(alert_id);
CREATE INDEX idx_cameras_zone_id ON cameras(zone_id);
CREATE INDEX idx_cameras_status ON cameras(status);
CREATE INDEX idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX idx_security_logs_zone_id ON security_logs(zone_id);
CREATE INDEX idx_security_logs_timestamp ON security_logs(timestamp DESC);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
