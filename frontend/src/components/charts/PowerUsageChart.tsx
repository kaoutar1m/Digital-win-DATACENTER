import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PowerData {
  time: string;
  value: number;
}

interface PowerUsageChartProps {
  data: PowerData[];
}

const PowerUsageChart: React.FC<PowerUsageChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.time),
    datasets: [
      {
        label: 'Puissance (kW)',
        data: data.map(item => item.value),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
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
        text: 'Historique de Consommation Électrique (24h)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Puissance (kW)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Heure',
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default PowerUsageChart;
