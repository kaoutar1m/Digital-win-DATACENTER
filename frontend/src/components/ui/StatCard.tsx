import React from 'react';

interface StatCardProps {
  title: string;
  value?: string | number;
  icon?: React.ReactNode;
  trend?: string;
  color?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          {value && <p className="text-2xl font-bold text-gray-900">{value}</p>}
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      {children}
    </div>
  );
};

export default StatCard;
