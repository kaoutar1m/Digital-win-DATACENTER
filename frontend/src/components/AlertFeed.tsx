import React from 'react';
import { FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import { useAlertSystem, alertColors } from '../hooks/useAlertSystem';

const AlertFeed: React.FC = () => {
  const { alerts, acknowledgeAlert } = useAlertSystem();

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="alert-feed bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-3 text-white">Alert Feed</h3>
      {alerts.length === 0 ? (
        <p className="text-gray-400 text-sm">No active alerts</p>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border-l-4 ${
                alert.acknowledged ? 'bg-gray-700 border-gray-600' : 'bg-gray-750 border-red-500'
              }`}
              style={{ borderLeftColor: alertColors[alert.level] }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <FaExclamationTriangle
                    className="mt-1"
                    color={alertColors[alert.level]}
                    size={16}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded"
                        style={{
                          backgroundColor: alertColors[alert.level],
                          color: 'white'
                        }}
                      >
                        {alert.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(alert.timestamp)}
                      </span>
                    </div>
                    <p className="text-white text-sm mt-1">{alert.message}</p>
                    {alert.rack_id && (
                      <p className="text-gray-400 text-xs mt-1">
                        Rack: {alert.rack_id}
                      </p>
                    )}
                  </div>
                </div>
                {!alert.acknowledged && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="text-green-500 hover:text-green-400 p-1"
                    title="Acknowledge alert"
                  >
                    <FaCheck size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertFeed;
