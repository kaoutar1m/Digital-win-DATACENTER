import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../providers/SocketProvider';

interface EquipmentMetrics {
  cpu: number;
  memory: number;
  temperature: number;
  power: number;
  uptime: number;
  timestamp: Date;
}

interface PerformanceHistory {
  timestamp: Date;
  cpu: number;
  memory: number;
  temperature: number;
}

interface EquipmentAlert {
  id: string;
  type: 'cpu' | 'memory' | 'temperature' | 'power' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface EquipmentInfo {
  id: string;
  name: string;
  type: 'server' | 'switch' | 'storage' | 'ups' | 'cooling';
  model: string;
  serialNumber: string;
  location: string;
  zone: string;
  ipAddress: string;
  firmwareVersion: string;
  warrantyExpiry: Date;
  maintenanceSchedule: Date;
}

const EquipmentDetail: React.FC<{ equipmentId: string }> = ({ equipmentId }) => {
  const { socket, isConnected } = useSocket();
  const [metrics, setMetrics] = useState<EquipmentMetrics | null>(null);
  const [history, setHistory] = useState<PerformanceHistory[]>([]);
  const [alerts, setAlerts] = useState<EquipmentAlert[]>([]);
  const [equipmentInfo, setEquipmentInfo] = useState<EquipmentInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'metrics' | 'history' | 'alerts' | 'info' | 'actions'>('metrics');
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // Mock equipment info
    const mockInfo: EquipmentInfo = {
      id: equipmentId,
      name: 'Server Rack A-01',
      type: 'server',
      model: 'Dell PowerEdge R750',
      serialNumber: 'ABC123456789',
      location: 'Server Room A',
      zone: 'critical',
      ipAddress: '192.168.1.100',
      firmwareVersion: '2.5.1',
      warrantyExpiry: new Date('2025-12-31'),
      maintenanceSchedule: new Date('2024-06-15')
    };

    // Mock current metrics
    const mockMetrics: EquipmentMetrics = {
      cpu: 65,
      memory: 78,
      temperature: 42,
      power: 450,
      uptime: 345600, // seconds
      timestamp: new Date()
    };

    // Mock performance history
    const mockHistory: PerformanceHistory[] = Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 3600000),
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      temperature: 35 + Math.random() * 15
    }));

    // Mock alerts
    const mockAlerts: EquipmentAlert[] = [
      {
        id: '1',
        type: 'temperature',
        severity: 'medium',
        message: 'Temperature above threshold',
        timestamp: new Date(Date.now() - 1800000),
        acknowledged: false
      },
      {
        id: '2',
        type: 'cpu',
        severity: 'low',
        message: 'High CPU usage detected',
        timestamp: new Date(Date.now() - 3600000),
        acknowledged: true
      }
    ];

    setEquipmentInfo(mockInfo);
    setMetrics(mockMetrics);
    setHistory(mockHistory);
    setAlerts(mockAlerts);
  }, [equipmentId]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMetricsUpdate = (data: EquipmentMetrics) => {
      setMetrics(data);
      setHistory(prev => [data, ...prev.slice(0, 23)].map(h => ({
        timestamp: h.timestamp,
        cpu: h.cpu,
        memory: h.memory,
        temperature: h.temperature
      })));
    };

    const handleAlert = (data: EquipmentAlert) => {
      setAlerts(prev => [data, ...prev.slice(0, 19)]);
    };

    socket.on(`equipment:${equipmentId}:metrics`, handleMetricsUpdate);
    socket.on(`equipment:${equipmentId}:alert`, handleAlert);

    return () => {
      socket.off(`equipment:${equipmentId}:metrics`, handleMetricsUpdate);
      socket.off(`equipment:${equipmentId}:alert`, handleAlert);
    };
  }, [socket, isConnected, equipmentId]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  }, []);

  const performAction = useCallback(async (action: 'restart' | 'maintenance' | 'diagnostic') => {
    setIsPerformingAction(true);
    // Simulate action
    setTimeout(() => {
      setIsPerformingAction(false);
      // Could emit socket event here
    }, 3000);
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (!equipmentInfo) {
    return (
      <div className="bg-gradient-to-br from-[#121212] to-[#1A1A1A] border border-[#2D2D2D]/50 rounded-xl p-6">
        <div className="text-center text-gray-400">Loading equipment details...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#121212] to-[#1A1A1A] border border-[#2D2D2D]/50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#00FF88]">{equipmentInfo.name}</h2>
          <p className="text-gray-400 text-sm mt-1">
            {equipmentInfo.type} • {equipmentInfo.location}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-[#00FF88] animate-pulse' : 'bg-[#FF6B6B]'}`}></div>
          <span className="text-xs text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-[#2D2D2D]/50">
        {[
          { id: 'metrics' as const, label: 'Real-time Metrics', icon: '📊' },
          { id: 'history' as const, label: 'Performance History', icon: '📈' },
          { id: 'alerts' as const, label: 'Alerts', icon: '🚨' },
          { id: 'info' as const, label: 'Technical Info', icon: 'ℹ️' },
          { id: 'actions' as const, label: 'Actions', icon: '⚙️' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'text-[#00FF88] border-b-2 border-[#00FF88]'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Real-time Metrics Tab */}
        {activeTab === 'metrics' && metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">CPU Usage</span>
                <span className="text-xl">🖥️</span>
              </div>
              <div className="text-2xl font-bold text-[#00FF88]">{metrics.cpu.toFixed(1)}%</div>
              <div className="w-full bg-[#2D2D2D] rounded-full h-2 mt-2">
                <div
                  className="bg-[#00FF88] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.cpu}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Memory</span>
                <span className="text-xl">💾</span>
              </div>
              <div className="text-2xl font-bold text-[#00FF88]">{metrics.memory.toFixed(1)}%</div>
              <div className="w-full bg-[#2D2D2D] rounded-full h-2 mt-2">
                <div
                  className="bg-[#00FF88] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.memory}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Temperature</span>
                <span className="text-xl">🌡️</span>
              </div>
              <div className="text-2xl font-bold text-[#00FF88]">{metrics.temperature.toFixed(1)}°C</div>
              <div className="w-full bg-[#2D2D2D] rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metrics.temperature > 50 ? 'bg-[#FF6B6B]' :
                    metrics.temperature > 40 ? 'bg-[#FFD166]' : 'bg-[#00FF88]'
                  }`}
                  style={{ width: `${(metrics.temperature / 60) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Power</span>
                <span className="text-xl">⚡</span>
              </div>
              <div className="text-2xl font-bold text-[#00FF88]">{metrics.power}W</div>
              <div className="text-gray-400 text-xs mt-2">Uptime: {formatUptime(metrics.uptime)}</div>
            </div>
          </div>
        )}

        {/* Performance History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#00FF88]">24-Hour Performance History</h3>
            <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-4">
              <div className="h-64 flex items-end justify-between space-x-1">
                {history.slice(0, 24).reverse().map((point, index) => (
                  <div key={index} className="flex flex-col items-center space-y-1">
                    <div className="w-2 bg-[#00FF88] rounded-t" style={{ height: `${point.cpu}%` }}></div>
                    <div className="w-2 bg-[#FFD166] rounded-t" style={{ height: `${point.memory}%` }}></div>
                    <div className="w-2 bg-[#FF6B6B] rounded-t" style={{ height: `${(point.temperature / 60) * 100}%` }}></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center space-x-4 mt-4 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-[#00FF88] rounded"></div>
                  <span>CPU</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-[#FFD166] rounded"></div>
                  <span>Memory</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-[#FF6B6B] rounded"></div>
                  <span>Temperature</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#00FF88]">Equipment Alerts</h3>
              <div className="text-sm text-gray-400">
                {alerts.filter(a => !a.acknowledged).length} unacknowledged
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${
                  alert.acknowledged ? 'bg-[#1E1E1E] border-[#2D2D2D]' : 'bg-[#FF6B6B]/10 border-[#FF6B6B]/30'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-1 rounded ${
                        alert.severity === 'critical' ? 'bg-[#FF6B6B]/20' :
                        alert.severity === 'high' ? 'bg-[#FF6B6B]/20' :
                        alert.severity === 'medium' ? 'bg-[#FFD166]/20' :
                        'bg-[#00FF88]/20'
                      }`}>
                        <span className="text-sm">
                          {alert.type === 'cpu' && '🖥️'}
                          {alert.type === 'memory' && '💾'}
                          {alert.type === 'temperature' && '🌡️'}
                          {alert.type === 'power' && '⚡'}
                          {alert.type === 'network' && '🌐'}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{alert.message}</div>
                        <div className="text-gray-400 text-sm">{alert.type.toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-medium px-2 py-1 rounded ${
                        alert.severity === 'critical' ? 'bg-[#FF6B6B]/20 text-[#FF6B6B]' :
                        alert.severity === 'high' ? 'bg-[#FF6B6B]/20 text-[#FF6B6B]' :
                        alert.severity === 'medium' ? 'bg-[#FFD166]/20 text-[#FFD166]' :
                        'bg-[#00FF88]/20 text-[#00FF88]'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        {alert.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="bg-[#00FF88]/10 text-[#00FF88] px-3 py-1 rounded text-sm hover:bg-[#00FF88]/20"
                      >
                        Acknowledge
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Info Tab */}
        {activeTab === 'info' && equipmentInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#00FF88]">Hardware Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Model:</span>
                  <span className="text-white">{equipmentInfo.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Serial Number:</span>
                  <span className="text-white">{equipmentInfo.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">{equipmentInfo.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">IP Address:</span>
                  <span className="text-white">{equipmentInfo.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Firmware:</span>
                  <span className="text-white">{equipmentInfo.firmwareVersion}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#00FF88]">Maintenance & Warranty</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span className="text-white">{equipmentInfo.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Zone:</span>
                  <span className="text-white">{equipmentInfo.zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Warranty Expiry:</span>
                  <span className="text-white">{equipmentInfo.warrantyExpiry.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Next Maintenance:</span>
                  <span className="text-white">{equipmentInfo.maintenanceSchedule.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions Tab */}
        {activeTab === 'actions' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#00FF88]">Equipment Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => performAction('restart')}
                disabled={isPerformingAction}
                className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-4 hover:bg-[#2D2D2D] transition-colors disabled:opacity-50"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🔄</div>
                  <div className="text-white font-medium">Restart</div>
                  <div className="text-gray-400 text-sm">Reboot the equipment</div>
                </div>
              </button>

              <button
                onClick={() => performAction('maintenance')}
                disabled={isPerformingAction}
                className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-4 hover:bg-[#2D2D2D] transition-colors disabled:opacity-50"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🔧</div>
                  <div className="text-white font-medium">Maintenance</div>
                  <div className="text-gray-400 text-sm">Schedule maintenance</div>
                </div>
              </button>

              <button
                onClick={() => performAction('diagnostic')}
                disabled={isPerformingAction}
                className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-4 hover:bg-[#2D2D2D] transition-colors disabled:opacity-50"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🔍</div>
                  <div className="text-white font-medium">Diagnostic</div>
                  <div className="text-gray-400 text-sm">Run diagnostics</div>
                </div>
              </button>
            </div>

            {isPerformingAction && (
              <div className="text-center text-[#00FF88]">
                Performing action... Please wait.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentDetail;
