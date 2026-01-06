import React from 'react';

interface TemperatureData {
  x: number;
  y: number;
  temperature: number;
}

interface TemperatureHeatmapProps {
  data: TemperatureData[];
}

const TemperatureHeatmap: React.FC<TemperatureHeatmapProps> = ({ data }) => {
  const getColor = (temp: number) => {
    if (temp < 20) return 'bg-blue-200';
    if (temp < 25) return 'bg-green-200';
    if (temp < 30) return 'bg-yellow-200';
    return 'bg-red-200';
  };

  return (
    <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#2D2D2D]">
      <div className="grid grid-cols-10 gap-1">
        {data.map((point, index) => (
          <div
            key={index}
            className={`w-8 h-8 rounded ${getColor(point.temperature)} flex items-center justify-center text-xs font-medium text-white`}
            title={`${point.temperature}°C`}
          >
            {point.temperature}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between text-sm text-gray-400">
        <span>Froid</span>
        <span>Optimal</span>
        <span>Chaud</span>
        <span>Critique</span>
      </div>
    </div>
  );
};

export default TemperatureHeatmap;
