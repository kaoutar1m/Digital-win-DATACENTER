import React from 'react';

import { useAlertSystem, alertColors, AlertLevel, AlertSeverity } from '../hooks/useAlertSystem';


const AlertDemo: React.FC = () => {
  const {
    alerts,
    isConnected,
    isSimulating,
    addAlert,
    acknowledgeAlert,
    clearAlert,
    clearAllAlerts,
    getAlertsByLevel,
    getUnacknowledgedAlerts,
    startRealTimeSimulation,
    stopRealTimeSimulation
  } = useAlertSystem();

 const handleAddCustomAlert = (level: AlertLevel) => {
  const now = new Date();
  const message = `Custom ${level.toUpperCase()} alert - ${now.toLocaleTimeString()}`;
  addAlert({
    type: 'demo',
    title: 'Demo Alert',
    level,
    message,
    zone: 'Demo Zone',
    equipment: 'Demo Equipment',
    status: 'active',
    acknowledged: false,
    timestamp: now,
    source: 'demo',
    // 添加缺失的属性
    severity: level as unknown as AlertSeverity, // 类型断言转换
    created_at: now,
    updated_at: now
  });
};



  const unacknowledgedAlerts = getUnacknowledgedAlerts();

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">🚨 Zustand Alert System Demo</h1>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isConnected ? 'bg-green-800' : 'bg-red-800'}`}>
            <div className="text-sm opacity-75">WebSocket</div>
            <div className="text-lg font-bold">{isConnected ? '🟢 Connected' : '🔴 Disconnected'}</div>
          </div>
          <div className={`p-4 rounded-lg ${isSimulating ? 'bg-blue-800' : 'bg-gray-800'}`}>
            <div className="text-sm opacity-75">Simulation</div>
            <div className="text-lg font-bold">{isSimulating ? '🔄 Running' : '⏸️ Stopped'}</div>
          </div>
          <div className="p-4 rounded-lg bg-purple-800">
            <div className="text-sm opacity-75">Total Alerts</div>
            <div className="text-lg font-bold">{alerts.length}</div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={startRealTimeSimulation}
            disabled={isSimulating}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-medium"
          >
            ▶️ Start Simulation
          </button>
          <button
            onClick={stopRealTimeSimulation}
            disabled={!isSimulating}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg font-medium"
          >
            ⏹️ Stop Simulation
          </button>
          <button
            onClick={clearAllAlerts}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-medium"
          >
            🗑️ Clear All
          </button>
          <button
            onClick={() => acknowledgeAlert(unacknowledgedAlerts[0]?.id)}
            disabled={unacknowledgedAlerts.length === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium"
          >
            ✅ Acknowledge First
          </button>
        </div>

        {/* Add Custom Alerts */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3">Add Custom Alerts</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.keys(alertColors) as AlertLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => handleAddCustomAlert(level)}
                className="px-3 py-2 rounded-lg font-medium text-white text-sm"
                style={{ backgroundColor: alertColors[level] }}
              >
                Add {level.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Alert Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {(Object.keys(alertColors) as AlertLevel[]).map((level) => {
            const count = getAlertsByLevel(level).length;
            return (
              <div key={level} className="p-4 rounded-lg bg-gray-800">
                <div className="text-sm opacity-75 capitalize">{level}</div>
                <div className="text-2xl font-bold" style={{ color: alertColors[level] }}>
                  {count}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Alerts */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recent Alerts ({alerts.length})</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {alerts.slice(0, 20).map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.acknowledged ? 'bg-gray-700 opacity-60' : 'bg-gray-750'
                }`}
                style={{ borderLeftColor: alertColors[alert.level] }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span
                        className="px-2 py-1 rounded text-xs font-bold text-white"
                        style={{ backgroundColor: alertColors[alert.level] }}
                      >
                        {alert.level.toUpperCase()}
                      </span>
                      {alert.acknowledged && (
                        <span className="px-2 py-1 rounded text-xs bg-green-600 text-white">
                          ACKNOWLEDGED
                        </span>
                      )}
                    </div>
                    <p className="text-white font-medium">{alert.message}</p>
                    <div className="text-sm text-gray-400 mt-1">
                      {alert.timestamp.toLocaleString()} •
                      {alert.zone && ` Zone: ${alert.zone}`} •
                      {alert.equipment && ` Equipment: ${alert.equipment}`}
                    </div>
                    {alert.position && (
                      <div className="text-xs text-gray-500 mt-1">
                        3D Position: ({alert.position.x.toFixed(1)}, {alert.position.y.toFixed(1)}, {alert.position.z.toFixed(1)})
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => clearAlert(alert.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {alerts.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No alerts yet. Start the simulation or add custom alerts!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertDemo;
