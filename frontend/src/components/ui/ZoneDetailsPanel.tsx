import React, { useState, useEffect } from 'react';
import { FaTimes, FaBuilding, FaShieldAlt, FaUsers, FaEye, FaExclamationTriangle, FaCamera, FaHistory, FaCog, FaMapMarkerAlt } from 'react-icons/fa';

interface Zone {
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
  position: { x: number; y: number; z: number };
  created_at: Date;
  updated_at?: Date;
}

interface Equipment {
  id: string;
  rack_id: string;
  type: 'server' | 'switch' | 'router' | 'storage' | 'ups' | 'cooling' | 'power';
  model: string;
  status: 'online' | 'offline' | 'warning' | 'critical' | 'maintenance';
  metrics: {
    temperature: number;
    power_consumption: number;
    load: number;
    memory_usage: number;
    storage_usage: number;
    uptime: number;
  };
  alerts: string[];
  ip_address?: string;
  mac_address?: string;
  vendor: string;
  serial_number: string;
  position: { x: number; y: number; z: number };
  created_at: Date;
  updated_at: Date;
}

interface Alert {
  id: string;
  type: 'temperature' | 'power' | 'network' | 'security' | 'hardware' | 'software' | 'environmental';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  equipment_id: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: Date;
  timestamp: Date;
  resolved?: boolean;
  resolved_at?: Date;
  metadata?: Record<string, any>;
}

interface ZoneDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  zone: Zone | null;
}

const ZoneDetailsPanel: React.FC<ZoneDetailsPanelProps> = ({ isOpen, onClose, zone }): JSX.Element | null => {
  const [activeTab, setActiveTab] = useState<'overview' | 'equipment' | 'alerts' | 'cameras' | 'logs'>('overview');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [cameras, setCameras] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch zone equipment
  const fetchZoneEquipment = async (zoneId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/zones/${zoneId}/equipment`);
      if (!response.ok) throw new Error('Failed to fetch equipment');
      const data = await response.json();
      setEquipment(data);
    } catch (err) {
      console.error('Failed to fetch zone equipment:', err);
    }
  };

  // Fetch zone alerts
  const fetchZoneAlerts = async (zoneId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/zones/${zoneId}/alerts`);
      if (!response.ok) throw new Error('Failed to fetch alerts');
      const data = await response.json();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to fetch zone alerts:', err);
    }
  };

  // Load data when zone changes or tab changes
  useEffect(() => {
    if (zone && isOpen) {
      if (activeTab === 'equipment') {
        fetchZoneEquipment(zone.id);
      } else if (activeTab === 'alerts') {
        fetchZoneAlerts(zone.id);
      }
      // TODO: Implement cameras and logs fetching when APIs are available
    }
  }, [zone, activeTab, isOpen]);

  const getZoneTypeColor = (type: Zone['type']) => {
    switch (type) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'sensitive': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'restricted': return 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30';
      case 'public': return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: Zone['status']) => {
    switch (status) {
      case 'active': return 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30';
      case 'maintenance': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'inactive': return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getEquipmentStatusColor = (status: Equipment['status']) => {
    switch (status) {
      case 'online': return 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30';
      case 'offline': return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      case 'warning': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'maintenance': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getAlertSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  if (!isOpen || !zone) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#1A1F2E] to-[#0F1419] border border-gray-800/50 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-800/50">
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${
              zone.status === 'active' ? 'bg-[#00FF88] shadow-lg shadow-[#00FF88]/50' :
              zone.status === 'maintenance' ? 'bg-amber-400 shadow-lg shadow-amber-400/50' :
              'bg-gray-400 shadow-lg shadow-gray-400/50'
            }`}></div>
            <div>
              <h3 className="text-2xl font-bold text-white">{zone.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{zone.location}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Zone Info Bar */}
        <div className="px-6 py-4 bg-gray-900/30 border-b border-gray-800/50">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">Type</div>
              <span className={`text-xs font-bold px-2 py-1 rounded border ${getZoneTypeColor(zone.type)}`}>
                {zone.type.toUpperCase()}
              </span>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">Security Level</div>
              <div className="text-white font-medium">Level {zone.security_level}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">Status</div>
              <span className={`text-xs font-bold px-2 py-1 rounded border ${getStatusColor(zone.status)}`}>
                {zone.status.toUpperCase()}
              </span>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">Access Points</div>
              <div className="text-[#00FF88] font-medium">{zone.access_points}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">Authorized Users</div>
              <div className="text-[#00FF88] font-medium">{zone.authorized_users}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">Sensors</div>
              <div className="text-[#00FF88] font-medium">{zone.sensors}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800/50">
          {[
            { id: 'overview', label: 'Overview', icon: FaBuilding },
            { id: 'equipment', label: 'Equipment', icon: FaCog },
            { id: 'alerts', label: 'Alerts', icon: FaExclamationTriangle },
            { id: 'cameras', label: 'Cameras', icon: FaCamera },
            { id: 'logs', label: 'Activity Logs', icon: FaHistory },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-[#00FF88] border-b-2 border-[#00FF88] bg-[#00FF88]/5'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/20'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Zone Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="w-5 h-5 text-[#00FF88]" />
                    Location & Position
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 text-sm">Location:</span>
                      <div className="text-white font-medium">{zone.location}</div>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Position:</span>
                      <div className="text-white font-mono text-sm">
                        X: {zone.position.x.toFixed(2)}, Y: {zone.position.y.toFixed(2)}, Z: {zone.position.z.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Color:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-6 h-6 rounded border border-gray-600"
                          style={{ backgroundColor: zone.color }}
                        ></div>
                        <span className="text-white font-mono text-sm">{zone.color}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FaShieldAlt className="w-5 h-5 text-[#00FF88]" />
                    Security Configuration
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 text-sm">Security Level:</span>
                      <div className="text-white font-medium">Level {zone.security_level} / 5</div>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Zone Type:</span>
                      <div className="text-white font-medium capitalize">{zone.type}</div>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Access Control:</span>
                      <div className="text-white font-medium">{zone.authorized_users} authorized users</div>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Monitoring:</span>
                      <div className="text-white font-medium">{zone.sensors} sensors active</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Zone Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00FF88] mb-1">{equipment.length}</div>
                    <div className="text-gray-400 text-sm">Equipment Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400 mb-1">
                      {alerts.filter(a => !a.resolved).length}
                    </div>
                    <div className="text-gray-400 text-sm">Active Alerts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-1">{zone.access_points}</div>
                    <div className="text-gray-400 text-sm">Access Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      {equipment.filter(e => e.status === 'online').length}
                    </div>
                    <div className="text-gray-400 text-sm">Online Equipment</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Equipment in Zone</h4>
                <div className="text-gray-400 text-sm">{equipment.length} items</div>
              </div>

              {equipment.length === 0 ? (
                <div className="text-center py-12">
                  <FaCog className="mx-auto mb-4 text-gray-600 text-4xl" />
                  <p className="text-gray-400 text-lg mb-2">No equipment found</p>
                  <p className="text-gray-500 text-sm">This zone doesn't have any equipment assigned</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {equipment.map((item) => (
                    <div key={item.id} className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-4 hover:border-[#00FF88]/30 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            item.status === 'online' ? 'bg-[#00FF88] shadow-lg shadow-[#00FF88]/50' :
                            item.status === 'offline' ? 'bg-gray-400' :
                            item.status === 'warning' ? 'bg-amber-400 shadow-lg shadow-amber-400/50' :
                            item.status === 'critical' ? 'bg-red-400 shadow-lg shadow-red-400/50' :
                            'bg-blue-400 shadow-lg shadow-blue-400/50'
                          }`}></div>
                          <div>
                            <div className="text-white font-medium">{item.model}</div>
                            <div className="text-gray-400 text-sm capitalize">{item.type}</div>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${getEquipmentStatusColor(item.status)}`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Vendor:</span>
                          <div className="text-white">{item.vendor}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">IP Address:</span>
                          <div className="text-white font-mono">{item.ip_address || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Temperature:</span>
                          <div className="text-white">{item.metrics.temperature}°C</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Power:</span>
                          <div className="text-white">{item.metrics.power_consumption}W</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Active Alerts</h4>
                <div className="text-gray-400 text-sm">{alerts.filter(a => !a.resolved).length} active</div>
              </div>

              {alerts.filter(a => !a.resolved).length === 0 ? (
                <div className="text-center py-12">
                  <FaExclamationTriangle className="mx-auto mb-4 text-gray-600 text-4xl" />
                  <p className="text-gray-400 text-lg mb-2">No active alerts</p>
                  <p className="text-gray-500 text-sm">All systems are operating normally</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.filter(a => !a.resolved).map((alert) => (
                    <div key={alert.id} className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            alert.severity === 'critical' ? 'bg-red-400 shadow-lg shadow-red-400/50' :
                            alert.severity === 'high' ? 'bg-orange-400 shadow-lg shadow-orange-400/50' :
                            alert.severity === 'medium' ? 'bg-amber-400 shadow-lg shadow-amber-400/50' :
                            'bg-gray-400'
                          }`}></div>
                          <div>
                            <div className="text-white font-medium">{alert.message}</div>
                            <div className="text-gray-400 text-sm capitalize">{alert.type} • {alert.severity} severity</div>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${getAlertSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-400">
                          Equipment ID: {alert.equipment_id.slice(0, 8)}...
                        </div>
                        <div className="text-gray-400">
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'cameras' && (
            <div className="text-center py-12">
              <FaCamera className="mx-auto mb-4 text-gray-600 text-4xl" />
              <p className="text-gray-400 text-lg mb-2">Camera monitoring coming soon</p>
              <p className="text-gray-500 text-sm">This feature will be available in the next update</p>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="text-center py-12">
              <FaHistory className="mx-auto mb-4 text-gray-600 text-4xl" />
              <p className="text-gray-400 text-lg mb-2">Activity logs coming soon</p>
              <p className="text-gray-500 text-sm">This feature will be available in the next update</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZoneDetailsPanel;
