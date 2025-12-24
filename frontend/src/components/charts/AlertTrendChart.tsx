import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AlertData {
  date: string;
  count: number;
  level: string;
}

interface AlertTrendChartProps {
  data: AlertData[];
}

const AlertTrendChart: React.FC<AlertTrendChartProps> = ({ data }) => {
  const getColorByLevel = (level: string) => {
    switch (level) {
      case 'info': return 'rgba(59, 130, 246, 0.8)';
      case 'warning': return 'rgba(245, 158, 11, 0.8)';
      case 'error': return 'rgba(239, 68, 68, 0.8)';
      default: return 'rgba(156, 163, 175, 0.8)';
    }
  };

  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Nombre d\'alertes',
        data: data.map(item => item.count),
        backgroundColor: data.map(item => getColorByLevel(item.level)),
        borderColor: data.map(item => getColorByLevel(item.level).replace('0.8', '1')),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Tendances des Alertes (7 derniers jours)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nombre d\'alertes',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default AlertTrendChart;
