import React, { useState } from 'react';

interface CameraData {
  cameraId?: string;
  cameraType: string;
  position?: string;
  status?: string;
  zone?: string;
  lastMotion?: string;
}

interface CameraDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cameraData: CameraData | null;
}

const CameraDetailModal: React.FC<CameraDetailModalProps> = ({ isOpen, onClose, cameraData }) => {
  const [activeTab, setActiveTab] = useState('specifications');

  if (!isOpen || !cameraData) return null;

  const tabs = [
    { id: 'specifications', label: 'Spécifications', icon: '📹' },
    { id: 'security', label: 'Sécurité', icon: '🔒' },
    { id: 'monitoring', label: 'Monitoring', icon: '📊' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'specifications':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1E1E1E] p-4 rounded-lg">
                <h4 className="text-[#00FF88] font-semibold mb-2">Informations Générales</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID Caméra:</span>
                    <span className="text-white">{cameraData.cameraId || 'CAM-001'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">{cameraData.cameraType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Position:</span>
                    <span className="text-white">{cameraData.position || 'Plafond - Salle A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Statut:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      cameraData.status === 'active' ? 'bg-[#00FF88] text-black' :
                      cameraData.status === 'warning' ? 'bg-[#FFD166] text-black' :
                      'bg-[#FF6B6B] text-white'
                    }`}>
                      {cameraData.status || 'active'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-[#1E1E1E] p-4 rounded-lg">
                <h4 className="text-[#4A90E2] font-semibold mb-2">Capacités Techniques</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Résolution:</span>
                    <span className="text-white">4K UHD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Champ de vision:</span>
                    <span className="text-white">120°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vision nocturne:</span>
                    <span className="text-white">IR 30m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Compression:</span>
                    <span className="text-white">H.265</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-4">
            <div className="bg-[#1E1E1E] p-4 rounded-lg">
              <h4 className="text-[#FF6B6B] font-semibold mb-3">Fonctionnalités de Sécurité</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#2D2D2D] rounded">
                  <div>
                    <div className="text-white font-medium">Détection de mouvement</div>
                    <div className="text-gray-400 text-sm">Algorithme IA avancé</div>
                  </div>
                  <div className="text-[#00FF88]">● Activé</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#2D2D2D] rounded">
                  <div>
                    <div className="text-white font-medium">Reconnaissance faciale</div>
                    <div className="text-gray-400 text-sm">Base de données 5000 visages</div>
                  </div>
                  <div className="text-[#00FF88]">● Activé</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#2D2D2D] rounded">
                  <div>
                    <div className="text-white font-medium">Détection d'intrusion</div>
                    <div className="text-gray-400 text-sm">Zone sensible définie</div>
                  </div>
                  <div className="text-[#FFD166]">● En alerte</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#2D2D2D] rounded">
                  <div>
                    <div className="text-white font-medium">Enregistrement cloud</div>
                    <div className="text-gray-400 text-sm">30 jours de rétention</div>
                  </div>
                  <div className="text-[#00FF88]">● Activé</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1E1E1E] p-4 rounded-lg">
                <h4 className="text-[#FFD166] font-semibold mb-3">Alertes Récentes</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[#FFD166]">
                    <span>Mouvement détecté</span>
                    <span>14:32</span>
                  </div>
                  <div className="flex justify-between text-[#FF6B6B]">
                    <span>Intrusion zone critique</span>
                    <span>13:45</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Accès autorisé</span>
                    <span>12:18</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#1E1E1E] p-4 rounded-lg">
                <h4 className="text-[#4A90E2] font-semibold mb-3">Statistiques</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Événements/heure:</span>
                    <span className="text-white">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Taux de fausses alertes:</span>
                    <span className="text-white">2.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Uptime:</span>
                    <span className="text-[#00FF88]">99.97%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'monitoring':
        return (
          <div className="space-y-4">
            <div className="bg-[#1E1E1E] p-4 rounded-lg">
              <h4 className="text-[#00FF88] font-semibold mb-3">Flux en Direct</h4>
              <div className="aspect-video bg-[#2D2D2D] rounded flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📹</div>
                  <div className="text-gray-400">Flux vidéo en direct</div>
                  <div className="text-[#00FF88] text-sm mt-1">● Connecté</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1E1E1E] p-4 rounded-lg">
                <h4 className="text-[#4A90E2] font-semibold mb-3">Métriques de Performance</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Latence réseau:</span>
                    <span className="text-[#00FF88]">23ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Qualité image:</span>
                    <span className="text-[#00FF88]">4K 60fps</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Bande passante:</span>
                    <span className="text-white">45 Mbps</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Stockage utilisé:</span>
                    <span className="text-[#FFD166]">67%</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#1E1E1E] p-4 rounded-lg">
                <h4 className="text-[#FFD166] font-semibold mb-3">Historique d'Activité</h4>
                <div className="space-y-2 text-sm max-h-32 overflow-y-auto">
                  <div className="flex justify-between">
                    <span className="text-gray-400">15:42</span>
                    <span className="text-white">Mouvement détecté</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">15:38</span>
                    <span className="text-white">Personne identifiée</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">15:22</span>
                    <span className="text-white">Accès autorisé</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">15:15</span>
                    <span className="text-white">Maintenance effectuée</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">14:58</span>
                    <span className="text-white">Test système OK</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#1E1E1E] p-4 rounded-lg">
              <h4 className="text-[#FF6B6B] font-semibold mb-3">Actions Disponibles</h4>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-[#4A90E2] hover:bg-[#357ABD] text-white px-4 py-2 rounded transition-colors">
                  Test Caméra
                </button>
                <button className="bg-[#FFD166] hover:bg-[#E6B800] text-black px-4 py-2 rounded transition-colors">
                  Calibration
                </button>
                <button className="bg-[#00FF88] hover:bg-[#00DD77] text-black px-4 py-2 rounded transition-colors">
                  Redémarrer
                </button>
                <button className="bg-[#FF6B6B] hover:bg-[#E63946] text-white px-4 py-2 rounded transition-colors">
                  Maintenance
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#121212] rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden border border-[#1E1E1E]">
        <div className="flex justify-between items-center p-6 border-b border-[#1E1E1E]">
          <h2 className="text-white text-xl font-bold">Détails de la Caméra: {cameraData.cameraId || 'CAM-001'}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex border-b border-[#1E1E1E]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[#00FF88] border-b-2 border-[#00FF88] bg-[#1E1E1E]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderTabContent()}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-[#1E1E1E]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2D2D2D] text-white rounded hover:bg-[#3D3D3D] transition-colors"
          >
            Fermer
          </button>
          <button className="px-4 py-2 bg-[#00FF88] text-black rounded hover:bg-[#00DD77] transition-colors">
            Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraDetailModal;
