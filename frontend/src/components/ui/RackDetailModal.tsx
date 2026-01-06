import React, { useState } from 'react';
import { Server, Zap, Network, Wrench, Activity, Thermometer, Database, Shield, X } from 'lucide-react';

interface RackData {
  rackId: string;
  rackType: string;
  position?: string;
  servers?: number;
  powerConsumption?: number;
  temperature?: number;
  status?: string;
}

interface RackDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  rackData: RackData | null;
}

const RackDetailModal: React.FC<RackDetailModalProps> = ({ isOpen, onClose, rackData }) => {
  const [activeTab, setActiveTab] = useState('specifications');

  if (!isOpen || !rackData) return null;

  const tabs = [
    { id: 'specifications', label: 'Spécifications', icon: Server },
    { id: 'network', label: 'Réseau', icon: Network },
    { id: 'electricity', label: 'Électricité', icon: Zap },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'specifications':
        return (
          <div className="space-y-6">
            {/* Digital Rack Visualization */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 p-8 rounded-2xl border border-cyan-500/30 backdrop-blur-sm">
              <h4 className="text-cyan-400 font-bold text-lg mb-6 flex items-center gap-3">
                <Database size={20} />
                Visualisation Rack Digital
              </h4>
              <div className="flex gap-8">
                {/* Rack 3D representation */}
                <div className="flex-1">
                  <div className="bg-gray-900/60 rounded-xl p-6 border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
                    <div className="space-y-2">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const isOccupied = i < (rackData.servers || 8);
                        return (
                          <div 
                            key={i}
                            className={`h-8 rounded-lg border-2 transition-all duration-300 ${
                              isOccupied 
                                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                                : 'bg-gray-800/30 border-gray-700/30'
                            }`}
                          >
                            {isOccupied && (
                              <div className="h-full flex items-center justify-between px-3">
                                <span className="text-sm font-semibold text-cyan-300">U{12-i}</span>
                                <div className="flex gap-2">
                                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" style={{animationDelay: '0.3s'}}></div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="text-center mt-4 text-sm font-medium text-cyan-400">
                    Unités Rack: {rackData.servers || 8}/12 occupées
                  </div>
                </div>

                {/* Stats */}
                <div className="flex-1 space-y-4">
                  <div className="bg-gray-900/60 p-5 rounded-xl border border-cyan-500/20 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-300">Charge CPU</span>
                      <span className="text-cyan-400 font-bold text-lg">67%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 h-3 rounded-full shadow-lg shadow-cyan-500/50 transition-all duration-500" style={{width: '67%'}}></div>
                    </div>
                  </div>
                  <div className="bg-gray-900/60 p-5 rounded-xl border border-purple-500/20 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-300">Mémoire</span>
                      <span className="text-purple-400 font-bold text-lg">45%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 via-purple-400 to-pink-500 h-3 rounded-full shadow-lg shadow-purple-500/50 transition-all duration-500" style={{width: '45%'}}></div>
                    </div>
                  </div>
                  <div className="bg-gray-900/60 p-5 rounded-xl border border-orange-500/20 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-300">Stockage</span>
                      <span className="text-orange-400 font-bold text-lg">82%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 h-3 rounded-full shadow-lg shadow-orange-500/50 transition-all duration-500" style={{width: '82%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 p-6 rounded-2xl border border-cyan-500/30 backdrop-blur-sm">
                <h4 className="text-cyan-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <Activity size={18} />
                  Informations Générales
                </h4>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                    <span className="text-gray-400 font-medium">ID Rack:</span>
                    <span className="text-white font-bold text-base">{rackData.rackId}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                    <span className="text-gray-400 font-medium">Type:</span>
                    <span className="text-white font-bold text-base">{rackData.rackType}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                    <span className="text-gray-400 font-medium">Position:</span>
                    <span className="text-white font-bold text-base">{rackData.position || 'Salle A - Rangée 1'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-400 font-medium">Statut:</span>
                    <span className={`px-4 py-1.5 rounded-lg text-sm font-bold ${
                      rackData.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-lg shadow-emerald-500/20' :
                      rackData.status === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-lg shadow-amber-500/20' :
                      'bg-red-500/20 text-red-400 border border-red-500/50 shadow-lg shadow-red-500/20'
                    }`}>
                      {rackData.status || 'active'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 p-6 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
                <h4 className="text-purple-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <Shield size={18} />
                  Capacité & Dimensions
                </h4>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                    <span className="text-gray-400 font-medium">Serveurs:</span>
                    <span className="text-white font-bold text-base">{rackData.servers || 8}/12 U</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                    <span className="text-gray-400 font-medium">Puissance max:</span>
                    <span className="text-white font-bold text-base">6 kW</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                    <span className="text-gray-400 font-medium">Poids max:</span>
                    <span className="text-white font-bold text-base">800 kg</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-400 font-medium">Dimensions:</span>
                    <span className="text-white font-bold text-base">600x1000x2000mm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'network':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 p-8 rounded-2xl border border-cyan-500/30 backdrop-blur-sm">
              <h4 className="text-cyan-400 font-bold text-lg mb-6 flex items-center gap-3">
                <Network size={20} />
                Configuration Réseau
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-gray-900/60 rounded-xl border border-cyan-500/20 shadow-lg hover:shadow-cyan-500/20 transition-all">
                  <div>
                    <div className="text-white font-bold text-base flex items-center gap-3 mb-1">
                      <Database size={18} className="text-cyan-400" />
                      Switch Core
                    </div>
                    <div className="text-gray-400 text-sm">Cisco Catalyst 9500</div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></span>
                      Active
                    </div>
                    <div className="text-gray-400 text-sm font-mono">192.168.1.1</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-6 bg-gray-900/60 rounded-xl border border-cyan-500/20 shadow-lg hover:shadow-cyan-500/20 transition-all">
                  <div>
                    <div className="text-white font-bold text-base flex items-center gap-3 mb-1">
                      <Database size={18} className="text-cyan-400" />
                      Switch ToR
                    </div>
                    <div className="text-gray-400 text-sm">Arista 7280R</div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></span>
                      Active
                    </div>
                    <div className="text-gray-400 text-sm font-mono">192.168.1.10</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 mt-6">
                  <div className="text-center p-8 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                    <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">10G</div>
                    <div className="text-gray-400 text-sm font-medium">Vitesse uplink</div>
                  </div>
                  <div className="text-center p-8 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                    <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-2">95%</div>
                    <div className="text-gray-400 text-sm font-medium">Utilisation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'electricity':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 p-6 rounded-2xl border border-orange-500/30 backdrop-blur-sm">
                <h4 className="text-orange-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <Zap size={18} />
                  Consommation
                </h4>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                    <span className="text-gray-400 font-medium">Puissance actuelle:</span>
                    <span className="text-white font-bold text-base">{rackData.powerConsumption || 2.5} kW</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                    <span className="text-gray-400 font-medium">Tension:</span>
                    <span className="text-white font-bold text-base">220V</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                    <span className="text-gray-400 font-medium">Courant:</span>
                    <span className="text-white font-bold text-base">11.4A</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-400 font-medium">Facteur de puissance:</span>
                    <span className="text-white font-bold text-base">0.95</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 p-6 rounded-2xl border border-emerald-500/30 backdrop-blur-sm">
                <h4 className="text-emerald-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <Shield size={18} />
                  Alimentation
                </h4>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                    <span className="text-gray-400 font-medium">PDU A:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"></span>
                      Normal
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                    <span className="text-gray-400 font-medium">PDU B:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"></span>
                      Normal
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                    <span className="text-gray-400 font-medium">UPS:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"></span>
                      Chargé
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-400 font-medium">Redondance:</span>
                    <span className="text-cyan-400 font-bold text-lg">2N</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 p-8 rounded-2xl border border-cyan-500/30 backdrop-blur-sm">
              <h4 className="text-cyan-400 font-bold text-lg mb-6 flex items-center gap-3">
                <Activity size={18} />
                Historique de Consommation (24h)
              </h4>
              <div className="h-48 bg-gray-950/60 rounded-xl flex items-end justify-between px-3 gap-1.5 border border-cyan-500/20 p-4">
                {Array.from({ length: 24 }, (_, i) => {
                  const height = 30 + Math.random() * 70;
                  return (
                    <div
                      key={i}
                      className="bg-gradient-to-t from-cyan-500 via-cyan-400 to-blue-500 flex-1 rounded-t-lg transition-all hover:from-cyan-400 hover:to-blue-400 cursor-pointer shadow-lg shadow-cyan-500/30"
                      style={{ height: `${height}%` }}
                      title={`${i}:00 - ${height.toFixed(1)}%`}
                    ></div>
                  );
                })}
              </div>
              <div className="flex justify-between text-sm text-gray-400 font-medium mt-3 px-2">
                <span>00:00</span>
                <span>12:00</span>
                <span>23:59</span>
              </div>
            </div>
          </div>
        );
      case 'maintenance':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 p-6 rounded-2xl border border-cyan-500/30 backdrop-blur-sm">
              <h4 className="text-cyan-400 font-bold text-lg mb-4 flex items-center gap-2">
                <Wrench size={18} />
                Dernière Maintenance
              </h4>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                  <span className="text-gray-400 font-medium">Date:</span>
                  <span className="text-white font-bold text-base">2024-01-15</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                  <span className="text-gray-400 font-medium">Technicien:</span>
                  <span className="text-white font-bold text-base">Jean Dupont</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                  <span className="text-gray-400 font-medium">Type:</span>
                  <span className="text-white font-bold text-base">Maintenance préventive</span>
                </div>
                <div className="mt-4">
                  <span className="text-gray-400 text-sm font-medium">Actions réalisées:</span>
                  <ul className="text-white mt-3 space-y-3">
                    <li className="flex items-start gap-3 p-3 bg-gray-900/60 rounded-lg border border-cyan-500/10">
                      <span className="text-cyan-400 mt-1 text-lg">•</span>
                      <span className="text-sm">Vérification câblage électrique</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 bg-gray-900/60 rounded-lg border border-cyan-500/10">
                      <span className="text-cyan-400 mt-1 text-lg">•</span>
                      <span className="text-sm">Nettoyage filtres ventilation</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 bg-gray-900/60 rounded-lg border border-cyan-500/10">
                      <span className="text-cyan-400 mt-1 text-lg">•</span>
                      <span className="text-sm">Test redondance alimentation</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 bg-gray-900/60 rounded-lg border border-cyan-500/10">
                      <span className="text-cyan-400 mt-1 text-lg">•</span>
                      <span className="text-sm">Mise à jour firmware switch</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 p-6 rounded-2xl border border-emerald-500/30 backdrop-blur-sm">
              <h4 className="text-emerald-400 font-bold text-lg mb-4 flex items-center gap-2">
                <Activity size={18} />
                Prochaine Maintenance
              </h4>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                  <span className="text-gray-400 font-medium">Planifiée:</span>
                  <span className="text-white font-bold text-base">2024-04-15</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                  <span className="text-gray-400 font-medium">Type:</span>
                  <span className="text-white font-bold text-base">Maintenance préventive</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-400 font-medium">Durée estimée:</span>
                  <span className="text-white font-bold text-base">4h</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[9999] animate-fadeIn p-4">
      <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 rounded-3xl max-w-6xl w-full max-h-[95vh] flex flex-col border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-8 border-b border-cyan-500/30 bg-gradient-to-r from-gray-900/80 to-gray-950/80 shrink-0 rounded-t-3xl">
          <div>
            <h2 className="text-white text-3xl font-bold flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/30">
                <Server className="text-white" size={32} />
              </div>
              Rack: {rackData.rackId}
            </h2>
            <p className="text-gray-400 text-base mt-2 ml-16">Détails et monitoring en temps réel</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-800 border border-gray-700 hover:border-cyan-500/50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs - Fixed */}
        <div className="flex border-b border-cyan-500/30 bg-gray-900/50 shrink-0 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-5 text-base font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-cyan-400 border-b-4 border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {renderTabContent()}
        </div>

        {/* Footer - Fixed */}
        <div className="flex justify-end gap-4 p-8 border-t border-cyan-500/30 bg-gradient-to-r from-gray-900/80 to-gray-950/80 shrink-0 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all border border-gray-700 hover:border-gray-600"
          >
            Fermer
          </button>
          <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50">
            Planifier Maintenance
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 5px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #06b6d4 0%, #3b82f6 100%);
          border-radius: 5px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #22d3ee 0%, #60a5fa 100%);
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #06b6d4 #1f2937;
        }
      `}</style>
    </div>
  );
};

export default RackDetailModal;