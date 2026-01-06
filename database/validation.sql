-- Database Validation Scripts for Data Center 3D Platform
-- Run these queries to validate database integrity and constraints

-- 1. Check for orphaned records (records that reference non-existent parents)
-- Sensors without valid racks
SELECT s.id, s.rack_id, s.type
FROM sensors s
LEFT JOIN racks r ON s.rack_id = r.id
WHERE r.id IS NULL;

-- Equipment without valid racks
SELECT e.id, e.rack_id, e.type
FROM equipment e
LEFT JOIN racks r ON e.rack_id = r.id
WHERE r.id IS NULL;

-- Racks without valid zones
SELECT r.id, r.zone_id, r.name
FROM racks r
LEFT JOIN zones z ON r.zone_id = z.id
WHERE z.id IS NULL;

-- Alerts without valid zones or equipment
SELECT a.id, a.zone_id, a.equipment_id, a.title
FROM alerts a
LEFT JOIN zones z ON a.zone_id = z.id
LEFT JOIN equipment e ON a.equipment_id = e.id
WHERE (a.zone_id IS NOT NULL AND z.id IS NULL)
   OR (a.equipment_id IS NOT NULL AND e.id IS NULL);

-- 2. Check for data consistency
-- Equipment metrics without valid equipment
SELECT em.id, em.equipment_id
FROM equipment_metrics em
LEFT JOIN equipment e ON em.equipment_id = e.id
WHERE e.id IS NULL;

-- Alert notifications without valid alerts
SELECT an.id, an.alert_id
FROM alert_notifications an
LEFT JOIN alerts a ON an.alert_id = a.id
WHERE a.id IS NULL;

-- 3. Check for constraint violations
-- Invalid security levels in zones
SELECT id, name, security_level
FROM zones
WHERE security_level NOT IN ('public', 'restricted', 'sensitive', 'critical');

-- Invalid alert severities
SELECT id, title, severity
FROM alerts
WHERE severity NOT IN ('low', 'medium', 'high', 'critical');

-- Invalid alert statuses
SELECT id, title, status
FROM alerts
WHERE status NOT IN ('active', 'acknowledged', 'resolved', 'escalated');

-- 4. Check for data integrity issues
-- Duplicate equipment IDs (should be unique)
SELECT id, COUNT(*) as count
FROM equipment
GROUP BY id
HAVING COUNT(*) > 1;

-- Sensors with values exceeding thresholds (potential alerts)
SELECT s.id, s.type, s.value, s.threshold, r.name as rack_name, z.name as zone_name
FROM sensors s
JOIN racks r ON s.rack_id = r.id
JOIN zones z ON r.zone_id = z.id
WHERE s.value > s.threshold;

-- 5. Performance validation
-- Check table sizes
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- 6. Data quality checks
-- Check for null values in required fields
SELECT 'zones' as table_name, COUNT(*) as null_names
FROM zones WHERE name IS NULL
UNION ALL
SELECT 'racks' as table_name, COUNT(*) as null_names
FROM racks WHERE name IS NULL
UNION ALL
SELECT 'equipment' as table_name, COUNT(*) as null_ids
FROM equipment WHERE id IS NULL;

-- Check for invalid JSON in position fields
SELECT id, 'zones' as table_name
FROM zones
WHERE position::text NOT LIKE '{%}'
UNION ALL
SELECT id, 'racks' as table_name
FROM racks
WHERE position::text NOT LIKE '{%}';

-- 7. Business rule validation
-- Racks with power usage exceeding capacity
SELECT r.id, r.name, r.power_usage, r.total_power_capacity
FROM racks r
WHERE r.power_usage > r.total_power_capacity;

-- Equipment with invalid statuses
SELECT id, type, status
FROM equipment
WHERE status NOT IN ('online', 'offline', 'maintenance', 'error');

-- 8. Alert system validation
-- Active alerts older than 30 days
SELECT id, title, created_at, updated_at
FROM alerts
WHERE status = 'active'
  AND created_at < NOW() - INTERVAL '30 days';

-- Alerts without notifications
SELECT a.id, a.title, a.severity
FROM alerts a
LEFT JOIN alert_notifications an ON a.id = an.alert_id
WHERE an.id IS NULL;

-- 9. Summary report
SELECT
  'Total Records' as metric,
  (SELECT COUNT(*) FROM zones) as zones,
  (SELECT COUNT(*) FROM racks) as racks,
  (SELECT COUNT(*) FROM sensors) as sensors,
  (SELECT COUNT(*) FROM equipment) as equipment,
  (SELECT COUNT(*) FROM alerts) as alerts
UNION ALL
SELECT
  'Active Alerts' as metric,
  NULL, NULL, NULL, NULL,
  COUNT(*) as alerts
FROM alerts
WHERE status = 'active'
UNION ALL
SELECT
  'Critical Alerts' as metric,
  NULL, NULL, NULL, NULL,
  COUNT(*) as alerts
FROM alerts
WHERE severity = 'critical' AND status = 'active';
