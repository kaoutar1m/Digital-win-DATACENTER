import React, { useState, useEffect } from 'react';
import { FaChartLine, FaThermometerHalf, FaBolt, FaExclamationTriangle, FaEye, FaFilter, FaDownload } from 'react-icons/fa';
import PowerUsageChart from './charts/PowerUsageChart';
import AlertTrendChart from './charts/AlertTrendChart';
import TemperatureHeatmap from './charts/TemperatureHeatmap';
import { useDataCenterData } from '../hooks/useDataCenterData';

interface MetricData {
  time: string;
  value: number;
}

interface AlertData {
  date: string;
  count: number;
  level: string;
}

interface TemperaturePoint {
  x: number;
  y: number;
  temperature: number;
}

const MonitoringDashboard: React.FC = () => {
  const { racks, sensors, zones } = useDataCenterData();
  const [loading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('power');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Sample data for demonstration
  const powerData: MetricData[] = [
    { time: '00:00', value: 45.2 },
    { time: '04:00', value: 38.7 },
    { time: '08:00', value: 52.1 },
    { time: '12:00', value: 67.8 },
    { time: '16:00', value: 71.3 },
    { time: '20:00', value: 58.9 },
  ];

  const alertData: AlertData[] = [
  { date: '00:00', count: 2, level: 'low' },
  { date: '04:00', count: 1, level: 'medium' },
  { date: '08:00', count: 3, level: 'high' },
  { date: '12:00', count: 1, level: 'low' },
  { date: '16:00', count: 4, level: 'medium' },
  { date: '20:00', count: 2, level: 'high' },
];


  const temperatureData: TemperaturePoint[] = [
    { x: 0, y: 0, temperature: 22 },
    { x: 1, y: 0, temperature: 24 },
    { x: 2, y: 0, temperature: 26 },
    { x: 0, y: 1, temperature: 23 },
    { x: 1, y: 1, temperature: 25 },
    { x: 2, y: 1, temperature: 27 },
    { x: 0, y: 2, temperature: 21 },
    { x: 1, y: 2, temperature: 28 },
    { x: 2, y: 2, temperature: 30 },
  ];

  const timeRanges = [
    { value: '1h', label: 'Dernière heure' },
    { value: '24h', label: '24 heures' },
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
  ];

  const metricTypes = [
    { value: 'power', label: 'Puissance', icon: FaBolt, color: '#3B82F6' },
    { value: 'temperature', label: 'Température', icon: FaThermometerHalf, color: '#EF4444' },
    { value: 'alerts', label: 'Alertes', icon: FaExclamationTriangle, color: '#F59E0B' },
  ];

  const currentMetric = metricTypes.find(m => m.value === selectedMetric);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF88]"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-950">
      {/* Header */}
      <div className="p-6 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00FF88] to-[#00CC6F] flex items-center justify-center">
              <FaChartLine className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Tableau de Bord de Monitoring</h1>
              <p className="text-gray-400">Surveillance temps réel des métriques et performances</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Actualisation auto:</label>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  autoRefresh ? 'bg-[#00FF88]' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  autoRefresh ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg text-gray-300 hover:text-white transition-all">
              <FaDownload className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FaFilter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Période:</span>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-[#00FF88]/50"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Métrique:</span>
            <div className="flex gap-1">
              {metricTypes.map((metric) => (
                <button
                  key={metric.value}
                  onClick={() => setSelectedMetric(metric.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    selectedMetric === metric.value
                      ? 'bg-[#00FF88]/20 border border-[#00FF88]/50 text-[#00FF88]'
                      : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white'
                  }`}
                >
                  {React.createElement(metric.icon, { className: "w-4 h-4" })}
                  {metric.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primary Chart */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                {currentMetric && React.createElement(currentMetric.icon, { className: "w-6 h-6", style: { color: currentMetric.color } })}
                <h2 className="text-xl font-semibold text-white">
                  {currentMetric?.label} - {timeRanges.find(r => r.value === selectedTimeRange)?.label}
                </h2>
              </div>

              {selectedMetric === 'power' && <PowerUsageChart data={powerData} />}
              {selectedMetric === 'alerts' && <AlertTrendChart data={alertData} />}
              {selectedMetric === 'temperature' && <TemperatureHeatmap data={temperatureData} />}
            </div>
          </div>

          {/* Secondary Charts */}
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaBolt className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Consommation Électrique</h3>
            </div>
            <PowerUsageChart data={powerData.slice(-4)} />
          </div>

          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationTriangle className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Tendances des Alertes</h3>
            </div>
            <AlertTrendChart data={alertData.slice(-4)} />
          </div>

          {/* Temperature Heatmap */}
          <div className="lg:col-span-2 bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaThermometerHalf className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-semibold text-white">Carte Thermique des Zones</h3>
            </div>
            <div className="flex justify-center">
              <TemperatureHeatmap data={temperatureData} />
            </div>
          </div>
        </div>

        {/* Metrics Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Puissance Moyenne</p>
                <p className="text-2xl font-bold text-blue-400">58.7 kW</p>
              </div>
              <FaBolt className="w-8 h-8 text-blue-400" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <span className="text-xs text-gray-400">75%</span>
            </div>
          </div>

          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Température Moyenne</p>
                <p className="text-2xl font-bold text-red-400">24.8°C</p>
              </div>
              <FaThermometerHalf className="w-8 h-8 text-red-400" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <span className="text-xs text-gray-400">Optimal</span>
            </div>
          </div>

          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Alertes Actives</p>
                <p className="text-2xl font-bold text-yellow-400">12</p>
              </div>
              <FaExclamationTriangle className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
              <span className="text-xs text-gray-400">Faible</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
