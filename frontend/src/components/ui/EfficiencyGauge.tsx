import React from 'react';

interface EfficiencyGaugeProps {
  title: string;
  value?: number;
  max?: number;
  target?: number;
  color?: string;
}

const EfficiencyGauge: React.FC<EfficiencyGaugeProps> = ({
  title,
  value = 0,
  max = 100,
  color = '#3b82f6'
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-4">{title}</h3>
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="h-4 rounded-full transition-all duration-300"
            style={{
              width: `${percentage}%`,
              backgroundColor: color
            }}
          />
        </div>
        <div className="text-center mt-2">
          <span className="text-lg font-semibold text-gray-900">
            {value.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default EfficiencyGauge;
