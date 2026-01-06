import React, { useState } from 'react';
import { FaServer, FaDatabase, FaSync, FaHistory, FaPlay, FaRedo, FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

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
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'healthy': return { color: 'text-[#00FF88]', bg: 'bg-[#00FF88]/10 border-[#00FF88]/30', label: 'Sain' };
      case 'backing_up': return { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', label: 'En cours' };
      case 'failed': return { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', label: 'Échec' };
      case 'warning': return { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', label: 'Avertissement' };
      default: return { color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/30', label: 'Inconnu' };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <div className="bg-gradient-to-br from-[#1A1F2E] to-[#0F1419] backdrop-blur-sm p-6 rounded-xl border border-gray-800/50 shadow-xl hover:border-[#00FF88]/20 transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#00FF88]/10 flex items-center justify-center">
            <FaDatabase className="text-[#00FF88]" />
          </div>
          Statut des Sauvegardes
        </h3>
        <div className={`px-3 py-1.5 rounded-lg border ${statusInfo.bg}`}>
          <span className={`text-xs font-bold ${statusInfo.color}`}>
            ● {statusInfo.label}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-800/30">
          <p className="text-xs text-gray-500 mb-2 font-medium">Dernière sauvegarde</p>
          <p className="text-white font-semibold text-sm">{lastBackup ? new Date(lastBackup).toLocaleString('fr-FR') : 'Aucune'}</p>
        </div>
        <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-800/30">
          <p className="text-xs text-gray-500 mb-2 font-medium">Prochaine sauvegarde</p>
          <p className="text-white font-semibold text-sm">{nextBackup ? new Date(nextBackup).toLocaleString('fr-FR') : 'Non planifiée'}</p>
        </div>
        <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-800/30">
          <p className="text-xs text-gray-500 mb-2 font-medium">Taille totale</p>
          <p className="text-[#00FF88] font-bold text-xl">{size}</p>
        </div>
        <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-800/30">
          <p className="text-xs text-gray-500 mb-2 font-medium">Réplication</p>
          <p className={`font-bold text-xl ${replication === 'active' ? 'text-[#00FF88]' : 'text-gray-500'}`}>
            {replication === 'active' ? '● Active' : replication === 'syncing' ? '● Sync...' : '● Inactive'}
          </p>
        </div>
      </div>
    </div>
  );
};

const ReplicationDiagram: React.FC<FailoverStatus> = ({ primary, secondary, latency, sync }) => {
  const getSiteStatus = (status: string) => {
    switch (status) {
      case 'active': return { bg: 'bg-[#00FF88]', shadow: 'shadow-[#00FF88]/30', border: 'border-[#00FF88]/30' };
      case 'standby': return { bg: 'bg-blue-500', shadow: 'shadow-blue-500/30', border: 'border-blue-500/30' };
      case 'failed_over': return { bg: 'bg-amber-500', shadow: 'shadow-amber-500/30', border: 'border-amber-500/30' };
      case 'failed': return { bg: 'bg-red-500', shadow: 'shadow-red-500/30', border: 'border-red-500/30' };
      default: return { bg: 'bg-gray-500', shadow: 'shadow-gray-500/30', border: 'border-gray-500/30' };
    }
  };

  const syncPercent = parseFloat(sync.replace('%', ''));
  const primaryStyle = getSiteStatus(primary);
  const secondaryStyle = getSiteStatus(secondary);

  return (
    <div className="bg-gradient-to-br from-[#1A1F2E] to-[#0F1419] backdrop-blur-sm p-6 rounded-xl border border-gray-800/50 shadow-xl">
      <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-[#00FF88]/10 flex items-center justify-center">
          <FaSync className="text-[#00FF88] animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        Réplication Haute Disponibilité
      </h3>
      <div className="flex items-center justify-between gap-6">
        {/* Site Principal */}
        <div className={`flex-1 p-5 rounded-xl text-center transform hover:scale-105 transition-all duration-300 border ${primaryStyle.border} bg-gradient-to-br from-gray-900/50 to-gray-800/50 shadow-lg ${primaryStyle.shadow}`}>
          <div className={`w-12 h-12 rounded-xl ${primaryStyle.bg} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
            <FaServer className="text-2xl text-white" />
          </div>
          <div className="text-white font-bold text-base mb-1">Site Principal</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{primary}</div>
        </div>

        {/* Connexion */}
        <div className="flex-1">
          <div className="text-center mb-3">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">Latence Réseau</div>
            <div className="text-[#00FF88] font-bold text-lg">{latency}</div>
          </div>
          <div className="relative">
            <div className="bg-gray-800/50 rounded-full h-2.5 border border-gray-700/50">
              <div
                className="bg-gradient-to-r from-[#00FF88] to-[#00CC6F] h-2.5 rounded-full transition-all duration-500 shadow-lg shadow-[#00FF88]/30"
                style={{ width: sync }}
              />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00FF88] rounded-full animate-pulse shadow-lg shadow-[#00FF88]/50"></div>
          </div>
          <div className="text-center mt-3">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">Synchronisation</div>
            <div className="flex items-center justify-center gap-2">
              <div className="text-[#00FF88] font-bold text-lg">{sync}</div>
              {syncPercent >= 99 && <FaCheck className="text-[#00FF88] text-xs" />}
            </div>
          </div>
        </div>

        {/* Site Secondaire */}
        <div className={`flex-1 p-5 rounded-xl text-center transform hover:scale-105 transition-all duration-300 border ${secondaryStyle.border} bg-gradient-to-br from-gray-900/50 to-gray-800/50 shadow-lg ${secondaryStyle.shadow}`}>
          <div className={`w-12 h-12 rounded-xl ${secondaryStyle.bg} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
            <FaServer className="text-2xl text-white" />
          </div>
          <div className="text-white font-bold text-base mb-1">Site Secondaire</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{secondary}</div>
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
    <div className="bg-gradient-to-br from-[#1A1F2E] to-[#0F1419] backdrop-blur-sm p-6 rounded-xl border border-gray-800/50 shadow-xl">
      <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-[#00FF88]/10 flex items-center justify-center">
          <FaHistory className="text-[#00FF88]" />
        </div>
        Historique des Sauvegardes
      </h3>
      <div className="space-y-3">
        {mockHistory.map((backup) => (
          <div key={backup.id} className="group flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-800/30 hover:border-gray-700/50 hover:bg-gray-900/50 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${
                backup.status === 'success' ? 'bg-[#00FF88] shadow-lg shadow-[#00FF88]/50' : 'bg-amber-400 shadow-lg shadow-amber-400/50'
              }`} />
              <div>
                <div className="text-white font-semibold text-sm mb-1">{backup.date}</div>
                <div className="flex items-center gap-3 text-gray-500 text-xs">
                  <span className="flex items-center gap-1">
                    <FaDatabase /> {backup.size}
                  </span>
                  <span>•</span>
                  <span>{backup.duration}</span>
                </div>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${
              backup.status === 'success' ? 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {backup.status === 'success' ? <><FaCheck className="inline mr-1" /> Succès</> : <><FaExclamationTriangle className="inline mr-1" /> Avertissement</>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface BCMPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: any;
}

const BCMPanel: React.FC<BCMPanelProps> = ({ isOpen, onClose, selectedItem }) => {
  if (!isOpen) return null;
  
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
      sync: '98.5%'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#1A1F2E] to-[#0F1419] rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden border border-gray-800/50 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800/50">
          <div>
            <h2 className="text-white text-2xl font-bold mb-1">
              Tableau de Bord BCM/DRP
            </h2>
            <p className="text-gray-500 text-sm">
              {selectedItem?.rackId || selectedItem?.cameraId || 'Système'} • Gestion de Continuité et Reprise
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-800/50 transition-all duration-200"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-180px)] custom-scrollbar">
          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-[#00FF88]/10 to-[#00CC6F]/10 border border-[#00FF88]/20 p-5 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#00FF88] text-xs uppercase tracking-wider font-bold">Disponibilité</span>
                <div className="w-8 h-8 rounded-lg bg-[#00FF88]/20 flex items-center justify-center">
                  <FaServer className="text-[#00FF88]" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">99.99%</div>
              <div className="text-xs text-[#00FF88]">+0.02% ce mois</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 p-5 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-blue-400 text-xs uppercase tracking-wider font-bold">RTO</span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <FaSync className="text-blue-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">15 min</div>
              <div className="text-xs text-blue-400">Objectif: 30 min</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 p-5 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-purple-400 text-xs uppercase tracking-wider font-bold">RPO</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <FaDatabase className="text-purple-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">5 min</div>
              <div className="text-xs text-purple-400">Perte max données</div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 p-5 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-amber-400 text-xs uppercase tracking-wider font-bold">Tests DRP</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <FaHistory className="text-amber-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">12/12</div>
              <div className="text-xs text-amber-400">100% réussite</div>
            </div>
          </div>

          {/* Backup Status et Réplication */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <BackupStatus {...backupStatus} />
            <ReplicationDiagram {...failoverStatus} />
          </div>

          {/* Historique */}
          <div className="mb-6">
            <BackupHistory />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={triggerBackup}
              disabled={backupStatus.status === 'backing_up'}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-[#00FF88] hover:bg-[#00DD77] disabled:bg-gray-600 disabled:cursor-not-allowed text-black rounded-xl transition-all duration-300 shadow-lg shadow-[#00FF88]/20 hover:shadow-[#00FF88]/40 transform hover:scale-105 disabled:scale-100 font-bold"
            >
              <FaPlay />
              {backupStatus.status === 'backing_up' ? 'Sauvegarde en cours...' : 'Lancer Sauvegarde Manuelle'}
            </button>

            <button
              onClick={activateFailover}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transform hover:scale-105 font-bold"
            >
              <FaRedo />
              Basculer sur Site Secondaire
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-800/50">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-800/50 text-white rounded-xl hover:bg-gray-700/50 transition-all duration-200 font-semibold border border-gray-700/50"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { 
          width: 6px; 
        }
        .custom-scrollbar::-webkit-scrollbar-track { 
          background: rgba(17, 24, 39, 0.3); 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(0, 255, 136, 0.3); 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: rgba(0, 255, 136, 0.5); 
        }
      `}</style>
    </div>
  );
};

export default BCMPanel;