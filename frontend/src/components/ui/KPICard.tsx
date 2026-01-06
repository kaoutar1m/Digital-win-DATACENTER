import React from 'react';

interface KPICardProps {
  title: string;
  value: string;
  status: 'success' | 'warning' | 'error' | 'info';
  icon: React.ReactNode;
  subtitle: string;
  trend: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, status, icon, subtitle, trend }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return '#00FF88';
      case 'warning': return '#FFD166';
      case 'error': return '#FF6B6B';
      case 'info': return '#4A90E2';
      default: return '#00FF88';
    }
  };

  const getIcon = () => {
    switch (icon) {
      case 'shield': return '🛡️';
      case 'alert-triangle': return '⚠️';
      case 'camera': return '📹';
      case 'lock': return '🔒';
      case 'thermometer': return '🌡️';
      case 'zap': return '⚡';
      case 'wifi': return '📶';
      case 'users': return '👥';
      default: return '📊';
    }
  };

  const getTrendColor = () => {
    if (trend.includes('↑')) return '#FF6B6B';
    if (trend.includes('↓')) return '#00FF88';
    return '#4A90E2';
  };

  return (
    <div className="bg-[#121212] border border-[#1E1E1E] rounded-lg p-6 hover:border-[#2D2D2D] transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">{getIcon()}</div>
        <div
          className="text-sm font-semibold px-2 py-1 rounded"
          style={{ color: getTrendColor() }}
        >
          {trend}
        </div>
      </div>

      <div className="mb-2">
        <div className="text-gray-400 text-sm font-medium">{title}</div>
        <div
          className="text-3xl font-bold mt-1"
          style={{ color: getStatusColor() }}
        >
          {value}
        </div>
      </div>

      <div className="text-gray-500 text-xs">{subtitle}</div>

      {/* Status indicator bar */}
      <div className="mt-4 h-1 bg-[#1E1E1E] rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-1000"
          style={{
            width: status === 'success' ? '95%' : status === 'warning' ? '75%' : '60%',
            backgroundColor: getStatusColor()
          }}
        ></div>
      </div>
    </div>
  );
};

export default KPICard;
