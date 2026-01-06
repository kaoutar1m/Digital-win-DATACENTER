import { AccessLog } from '../models/AccessLog';
import mongoose from 'mongoose';

const AccessLogSchema = new mongoose.Schema({
  id: String,
  user_id: String,
  zone_id: String,
  action: String,
  access_type: String,
  access_method: String,
  biometric_type: String,
  success: Boolean,
  reason: String,
  timestamp: Date,
  location: String,
  device_id: String,
  details: mongoose.Schema.Types.Mixed,
  metadata: mongoose.Schema.Types.Mixed,
});

const SecurityEventSchema = new mongoose.Schema({
  id: String,
  type: String,
  severity: String,
  description: String,
  zone_id: String,
  camera_id: String,
  sensor_id: String,
  timestamp: Date,
  resolved: Boolean,
  resolved_by: String,
  resolved_at: Date,
  evidence_urls: [String],
});

const AccessLogModel = mongoose.model('AccessLog', AccessLogSchema);
const SecurityEventModel = mongoose.model('SecurityEvent', SecurityEventSchema);

export class AccessLogService {
  private accessLogs: AccessLog[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with mock access log data
    this.accessLogs = [
      {
        id: 'log-001',
        user_id: 'user-001',
        zone_id: 'zone-001',
        access_type: 'entry',
        access_method: 'biometric',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        success: true,
        details: {
          biometric_type: 'fingerprint',
          confidence_score: 0.98,
          location: { x: 10, y: 5, z: 0 }
        },
        ip_address: '192.168.1.100',
        user_agent: 'DataCenter Terminal v1.0'
      },
      {
        id: 'log-002',
        user_id: 'user-002',
        zone_id: 'zone-001',
        access_type: 'exit',
        access_method: 'card',
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        success: true,
        details: {
          card_id: 'CARD-123456',
          location: { x: 5, y: 3, z: 2 }
        },
        ip_address: '192.168.1.101',
        user_agent: 'Mobile App v2.1'
      },
      {
        id: 'log-003',
        user_id: 'user-003',
        zone_id: 'zone-002',
        access_type: 'entry',
        access_method: 'biometric',
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        success: false,
        details: {
          biometric_type: 'facial_recognition',
          confidence_score: 0.45,
          reason: 'Low confidence score',
          location: { x: 15, y: 8, z: 1 }
        },
        ip_address: '192.168.1.102',
        user_agent: 'Security Camera System v3.0'
      }
    ];
  }

  async getAllAccessLogs(filters: any = {}): Promise<AccessLog[]> {
    let filteredLogs = [...this.accessLogs];

    if (filters.user_id) {
      filteredLogs = filteredLogs.filter(log => log.user_id === filters.user_id);
    }

    if (filters.zone_id) {
      filteredLogs = filteredLogs.filter(log => log.zone_id === filters.zone_id);
    }

    if (filters.access_type) {
      filteredLogs = filteredLogs.filter(log => (log as any).access_type === filters.access_type);
    }

    if (filters.success !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.success === filters.success);
    }

    if (filters.start_date) {
      const start = new Date(filters.start_date);
      filteredLogs = filteredLogs.filter(log => log.timestamp >= start);
    }

    if (filters.end_date) {
      const end = new Date(filters.end_date);
      filteredLogs = filteredLogs.filter(log => log.timestamp <= end);
    }

    // Sort by timestamp descending (most recent first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return filteredLogs;
  }

  async getAccessLogById(id: string): Promise<AccessLog | null> {
    return this.accessLogs.find(log => log.id === id) || null;
  }

  async createAccessLog(logData: Omit<AccessLog, 'id'>): Promise<AccessLog> {
    const newLog: AccessLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...logData
    };

    this.accessLogs.push(newLog);
    return newLog;
  }

  async getAccessLogsByUser(userId: string, limit: number = 50): Promise<AccessLog[]> {
    return this.accessLogs
      .filter(log => log.user_id === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getAccessLogsByZone(zoneId: string, limit: number = 100): Promise<AccessLog[]> {
    return this.accessLogs
      .filter(log => log.zone_id === zoneId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getFailedAccessAttempts(startDate?: string, endDate?: string): Promise<AccessLog[]> {
    let failedLogs = this.accessLogs.filter(log => !log.success);

    if (startDate) {
      const start = new Date(startDate);
      failedLogs = failedLogs.filter(log => log.timestamp >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      failedLogs = failedLogs.filter(log => log.timestamp <= end);
    }

    return failedLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getAccessStatistics(timeRange: string = '24h'): Promise<any> {
    const now = new Date();
    let startTime: Date;

    switch (timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - 3600000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 86400000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 604800000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 2592000000);
        break;
      default:
        startTime = new Date(now.getTime() - 86400000);
    }

    const logsInRange = this.accessLogs.filter(log => log.timestamp >= startTime);

    const totalAttempts = logsInRange.length;
    const successfulAttempts = logsInRange.filter(log => log.success).length;
    const failedAttempts = totalAttempts - successfulAttempts;
    const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;

    const accessByType = logsInRange.reduce((acc, log) => {
      acc[log.access_type] = (acc[log.access_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const accessByMethod = logsInRange.reduce((acc, log) => {
      acc[log.access_method] = (acc[log.access_method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      time_range: timeRange,
      total_attempts: totalAttempts,
      successful_attempts: successfulAttempts,
      failed_attempts: failedAttempts,
      success_rate: Math.round(successRate * 100) / 100,
      access_by_type: accessByType,
      access_by_method: accessByMethod,
      generated_at: new Date()
    };
  }

  async logAccessAttempt(
    userId: string,
    zoneId: string,
    accessType: 'entry' | 'exit',
    accessMethod: 'biometric' | 'card' | 'pin' | 'manual',
    success: boolean,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AccessLog> {
    const logData: Omit<AccessLog, 'id'> = {
      user_id: userId,
      zone_id: zoneId,
      access_type: accessType,
      access_method: accessMethod,
      timestamp: new Date(),
      success: success,
      details: details || {},
      ip_address: ipAddress,
      user_agent: userAgent
    };

    return this.createAccessLog(logData);
  }

  async getRecentActivity(limit: number = 20): Promise<AccessLog[]> {
    return this.accessLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getSuspiciousActivity(): Promise<AccessLog[]> {
    // Define suspicious patterns
    const suspiciousLogs = this.accessLogs.filter(log => {
      // Failed biometric attempts with low confidence
      if (!log.success && log.access_method === 'biometric' && log.details?.confidence_score < 0.6) {
        return true;
      }

      // Multiple failed attempts from same IP in short time
      // This would require more complex logic in a real implementation

      return false;
    });

    return suspiciousLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getAccessLogs(filters: any = {}): Promise<AccessLog[]> {
    return this.getAllAccessLogs(filters);
  }

  async getUserAccessLogs(userId: string, filters: any = {}): Promise<AccessLog[]> {
    return AccessLogModel.find({ user_id: userId, ...filters }).exec();
  }

  async getZoneAccessLogs(zoneId: string, filters: any = {}): Promise<AccessLog[]> {
    return AccessLogModel.find({ zone_id: zoneId, ...filters }).exec();
  }

  async getSecurityEvents(filters: any = {}): Promise<any[]> {
    return SecurityEventModel.find({ ...filters, security_event: true }).exec();
  }

  async createSecurityEvent(eventData: any): Promise<any> {
    const event = new SecurityEventModel(eventData);
    return event.save();
  }

  async resolveSecurityEvent(eventId: string): Promise<any> {
    return SecurityEventModel.findByIdAndUpdate(
      eventId,
      { resolved: true, resolved_at: new Date() },
      { new: true }
    );
  }

  async getBiometricStats(filters: any = {}): Promise<any> {
    const logs = await AccessLogModel.find({
      ...filters,
      access_method: 'biometric'
    }).exec();

    return {
      total: logs.length,
      successful: logs.filter(l => l.success).length,
      failed: logs.filter(l => !l.success).length,
    };
  }
}
