import React, { useState } from 'react';
import { FaServer, FaDatabase, FaSync, FaHistory, FaPlay, FaRedo } from 'react-icons/fa';

interface BackupStatus {
  lastBackup: string | null;
  nextBackup: string | null;
  status: 'healthy' | 'backing_up' | 'failed' | 'warning';
  size: string;
  replication: 'active' | 'inactive' | 'syncing';
}

interface FailoverStatus {
  primary: 'active' | 'failed_over' | 'failed';
  secondary: 'standby' | 'active' | 'failed';
  latency: string;
  sync: string;
}

const BackupStatus: React.FC<BackupStatus> = ({ lastBackup, nextBackup, status, size, replication }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'backing_up': return 'text-blue-500';
      case 'failed': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <FaDatabase className="mr-2" />
        Statut des Sauvegardes
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-400">Dernière sauvegarde</p>
          <p className="text-white">{lastBackup ? new Date(lastBackup).toLocaleString() : 'Aucune'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Prochaine sauvegarde</p>
          <p className="text-white">{nextBackup ? new Date(nextBackup).toLocaleString() : 'Non planifiée'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Taille</p>
          <p className="text-white">{size}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Statut</p>
          <p className={`font-semibold ${getStatusColor(status)}`}>
            {status === 'healthy' ? 'Sain' :
             status === 'backing_up' ? 'Sauvegarde en cours...' :
             status === 'failed' ? 'Échec' : 'Avertissement'}
          </p>
        </div>
      </div>
    </div>
  );
};

const ReplicationDiagram: React.FC<FailoverStatus> = ({ primary, secondary, latency, sync }) => {
  const getSiteStatus = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'standby': return 'bg-blue-500';
      case 'failed_over': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <FaSync className="mr-2" />
        Diagramme de Réplication
      </h3>
      <div className="flex items-center justify-between">
        <div className={`site p-4 rounded-lg text-center ${getSiteStatus(primary)}`}>
          <FaServer className="text-2xl mb-2" />
          <div className="text-white font-semibold">Site Principal</div>
          <div className="text-sm text-gray-200">{primary}</div>
        </div>

        <div className="connection flex-1 mx-4">
          <div className="text-center mb-2">
            <div className="text-sm text-gray-400">Latence</div>
            <div className="text-white font-semibold">{latency}</div>
          </div>
          <div className="sync-bar bg-gray-700 rounded-full h-2">
            <div
              className="sync-fill bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: sync }}
            />
          </div>
          <div className="text-center mt-2">
            <div className="text-sm text-gray-400">Synchronisation</div>
            <div className="text-white font-semibold">{sync}</div>
          </div>
        </div>

        <div className={`site p-4 rounded-lg text-center ${getSiteStatus(secondary)}`}>
          <FaServer className="text-2xl mb-2" />
          <div className="text-white font-semibold">Site Secondaire</div>
          <div className="text-sm text-gray-200">{secondary}</div>
        </div>
      </div>
    </div>
  );
};

const BackupHistory: React.FC = () => {
  const mockHistory = [
    { id: 1, date: '2024-01-15 14:30', status: 'success', size: '2.4TB', duration: '45min' },
    { id: 2, date: '2024-01-14 14:30', status: 'success', size: '2.3TB', duration: '42min' },
    { id: 3, date: '2024-01-13 14:30', status: 'warning', size: '2.2TB', duration: '50min' },
  ];

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <FaHistory className="mr-2" />
        Historique des Sauvegardes
      </h3>
      <div className="space-y-2">
        {mockHistory.map((backup) => (
          <div key={backup.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                backup.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <div>
                <div className="text-white text-sm">{backup.date}</div>
                <div className="text-gray-400 text-xs">{backup.size} • {backup.duration}</div>
              </div>
            </div>
            <div className={`text-sm font-semibold ${
              backup.status === 'success' ? 'text-green-500' : 'text-yellow-500'
            }`}>
              {backup.status === 'success' ? 'Succès' : 'Avertissement'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BCMPanel: React.FC = () => {
  const [backupStatus, setBackupStatus] = useState<BackupStatus>({
    lastBackup: '2024-01-15T14:30:00Z',
    nextBackup: '2024-01-16T14:30:00Z',
    status: 'healthy',
    size: '2.4TB',
    replication: 'active'
  });

  const [failoverStatus, setFailoverStatus] = useState<FailoverStatus>({
    primary: 'active',
    secondary: 'standby',
    latency: '12ms',
    sync: '99.99%'
  });

  const triggerBackup = async () => {
    setBackupStatus(prev => ({ ...prev, status: 'backing_up' }));

    setTimeout(() => {
      setBackupStatus(prev => ({
        ...prev,
        status: 'healthy',
        lastBackup: new Date().toISOString()
      }));
    }, 3000);
  };

  const activateFailover = () => {
    setFailoverStatus({
      primary: 'failed_over',
      secondary: 'active',
      latency: '45ms',
      sync: 'syncing'
    });
  };

  return (
    <div className="bcm-panel p-6 bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold text-white mb-6">Tableau de Bord PCA/DRP</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <BackupStatus {...backupStatus} />
        <ReplicationDiagram {...failoverStatus} />
      </div>

      <div className="mb-6">
        <BackupHistory />
      </div>

      <div className="flex gap-4">
        <button
          onClick={triggerBackup}
          disabled={backupStatus.status === 'backing_up'}
          className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <FaPlay className="mr-2" />
          {backupStatus.status === 'backing_up' ? 'Sauvegarde en cours...' : 'Lancer Sauvegarde'}
        </button>

        <button
          onClick={activateFailover}
          className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <FaRedo className="mr-2" />
          Activer Site Secondaire
        </button>
      </div>
    </div>
  );
};

export default BCMPanel;
