import React from 'react';
import { useDataCenterStats } from '../hooks/useDataCenterStats';
import { useAlertSystem } from '../hooks/useAlertSystem';
import StatCard from './ui/StatCard';

const DataCenterDashboard: React.FC = () => {
  const { stats, loading: statsLoading, error: statsError } = useDataCenterStats();
  const { alerts, loading: alertsLoading, error: alertsError } = useAlertSystem();

  // Afficher un indicateur de chargement
  if (statsLoading || alertsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (statsError || alertsError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Erreur</p>
          <p>{statsError || alertsError}</p>
          <p className="text-sm mt-2">Vérifiez que le backend est démarré sur le port 3001</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord du centre de données</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Armoires" value={stats.totalRacks} icon="server" />
        <StatCard title="Serveurs actifs" value={stats.activeServers} icon="power" />
        <StatCard title="Consommation (kW)" value={stats.powerConsumption} icon="bolt" />
        <StatCard title="Température (°C)" value={stats.temperature} icon="thermometer" />
      </div>

      {/* Autres composants du dashboard */}
    </div>
  );
};

export default DataCenterDashboard;