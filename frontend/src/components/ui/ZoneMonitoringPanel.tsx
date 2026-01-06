import React, { useEffect, useState } from 'react';
import { FaTimes, FaTemperatureHigh, FaBolt, FaServer, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';

interface ZoneMonitoringPanelProps {
  zoneId: string;
  zoneName: string;
  onClose: () => void;
}

interface ZoneMetrics {
  temperature: number;
  powerUsage: number;
  rackCount: number;
  status: 'Normal' | 'Warning' | 'Critical';
  cpu: number;
  memory: number;
  traffic: number;
  humidity?: number;
  airFlow?: number;
  lastUpdate: Date;
}

const ZoneMonitoringPanel: React.FC<ZoneMonitoringPanelProps> = ({ zoneId, zoneName, onClose }) => {
  const [data, setData] = useState<ZoneMetrics>({
    temperature: 24,
    powerUsage: 150,
    rackCount: 20,
    status: 'Normal',
    cpu: 45,
    memory: 62,
    traffic: 30,
    humidity: 45,
    airFlow: 1200,
    lastUpdate: new Date(),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch zone metrics from database
  const fetchZoneMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch zone metrics from API
      const response = await fetch(`http://localhost:3001/api/zones/${zoneId}/metrics`);
      if (!response.ok) {
        throw new Error('Failed to fetch zone metrics');
      }

      const metrics = await response.json();
      setData({
        temperature: metrics.temperature || 24,
        powerUsage: metrics.powerUsage || 150,
        rackCount: metrics.rackCount || 20,
        status: metrics.status || 'Normal',
        cpu: metrics.cpu || 45,
        memory: metrics.memory || 62,
        traffic: metrics.traffic || 30,
        humidity: metrics.humidity || 45,
        airFlow: metrics.airFlow || 1200,
        lastUpdate: new Date(metrics.lastUpdate || Date.now()),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load zone metrics');
      // Fallback to simulated data
      setData((prev) => ({
        ...prev,
        temperature: 24 + (Math.random() - 0.5) * 6,
        powerUsage: 150 + (Math.random() - 0.5) * 30,
        status: Math.random() > 0.9 ? 'Critical' : Math.random() > 0.7 ? 'Warning' : 'Normal',
        cpu: 30 + Math.random() * 50,
        memory: 40 + Math.random() * 40,
        traffic: 20 + Math.random() * 60,
        humidity: 40 + Math.random() * 20,
        airFlow: 1000 + Math.random() * 400,
        lastUpdate: new Date(),
      }));
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchZoneMetrics();
  }, [zoneId]);

  // Real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchZoneMetrics();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [zoneId]);

  // Simple radial gauge component
  const RadialGauge = ({ value, max, color, label, icon }: any) => {
    const percentage = (value / max) * 100;
    const isHigh = percentage > 80;

    return (
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-1">{icon}</div>
            <div className={`text-2xl font-bold ${isHigh ? 'text-red-400' : 'text-white'}`}>
              {value.toFixed(0)}
            </div>
            <div className="text-xs text-gray-400">{label}</div>
          </div>
        </div>
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#2D2D2D"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
      </div>
    );
  };

  // Simple progress bar component
  const ProgressBar = ({ value, max, color, label }: any) => (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-300 mb-1">
        <span>{label}</span>
        <span>{value.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(value / max) * 100}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-2 sm:p-4">
      <div className="bg-gradient-to-br from-[#0b0f17] to-[#111827] border border-[#2D2D2D]/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#00FF88] truncate">Zone Monitoring</h2>
            <p className="text-gray-400 text-xs sm:text-sm truncate">Real-time data for {zoneName} (ID: {zoneId})</p>
            <p className="text-gray-500 text-xs mt-1">
              Last updated: {data.lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors ml-2 flex-shrink-0"
          >
            <FaTimes size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF88]"></div>
            <span className="ml-3 text-[#00FF88]">Loading zone data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-400 mr-2" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Status indicator */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                data.status === 'Normal' ? 'bg-green-400' :
                data.status === 'Warning' ? 'bg-yellow-400 animate-pulse' :
                'bg-red-500 animate-pulse'
              }`} />
              <span className={`text-sm sm:text-base lg:text-lg font-semibold ${
                data.status === 'Normal' ? 'text-green-400' :
                data.status === 'Warning' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                Status: {data.status}
              </span>
            </div>

            {/* Gauges Grid - Responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
              <RadialGauge value={data.temperature} max={40} color="#FF6B6B" label="Temp °C" icon={<FaTemperatureHigh />} />
              <RadialGauge value={data.powerUsage} max={200} color="#FFD166" label="Power kW" icon={<FaBolt />} />
              <RadialGauge value={data.rackCount} max={30} color="#4A90E2" label="Racks" icon={<FaServer />} />
              <RadialGauge value={data.cpu} max={100} color="#8B5CF6" label="CPU %" icon={<FaShieldAlt />} />
            </div>

            {/* Progress bars - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <ProgressBar value={data.memory} max={100} color="#00FF88" label="Memory Usage" />
              <ProgressBar value={data.traffic} max={100} color="#4A90E2" label="Network Traffic" />
            </div>

            {/* Additional Metrics for larger screens */}
            {(data.humidity !== undefined || data.airFlow !== undefined) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {data.humidity !== undefined && (
                  <ProgressBar value={data.humidity} max={100} color="#06B6D4" label="Humidity %" />
                )}
                {data.airFlow !== undefined && (
                  <ProgressBar value={data.airFlow} max={2000} color="#8B5CF6" label="Air Flow CFM" />
                )}
              </div>
            )}

            {/* Actions - Responsive */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
              <button
                onClick={onClose}
                className="px-4 sm:px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm sm:text-base order-2 sm:order-1"
              >
                Close
              </button>
              <button
                onClick={() => alert(`Generating report for zone ${zoneId}...`)}
                className="px-4 sm:px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors text-sm sm:text-base order-1 sm:order-2"
              >
                Generate Report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ZoneMonitoringPanel;
