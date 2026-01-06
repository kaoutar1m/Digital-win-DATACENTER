import React, { useState, useEffect } from 'react';
import { FaTools, FaServer, FaNetworkWired, FaBatteryHalf, FaFan, FaThermometerHalf, FaSearch, FaTimes, FaChartLine, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

// Données d'exemple améliorées
const mockEquipment = [
  { id: 1, model: 'Dell PowerEdge R750', vendor: 'Dell', serial_number: 'SRV-001', type: 'server', status: 'online', zone: 'Zone A', rack: 'A1', position: 'U1-U4', metrics: { power_consumption: 850, temperature: 32, cpu_usage: 75, memory_usage: 60 }, updated_at: new Date(Date.now() - 300000), location: { x: 20, y: 30 } },
  { id: 2, model: 'Cisco Catalyst 9300', vendor: 'Cisco', serial_number: 'SW-001', type: 'switch', status: 'online', zone: 'Zone A', rack: 'A2', position: 'U5-U6', metrics: { power_consumption: 450, temperature: 28, cpu_usage: 45, memory_usage: 40 }, updated_at: new Date(Date.now() - 150000), location: { x: 45, y: 30 } },
  { id: 3, model: 'NetApp A300', vendor: 'NetApp', serial_number: 'STO-001', type: 'storage', status: 'warning', zone: 'Zone B', rack: 'B1', position: 'U1-U3', metrics: { power_consumption: 1200, temperature: 38, cpu_usage: 85, memory_usage: 92 }, updated_at: new Date(Date.now() - 600000), location: { x: 70, y: 60 } },
  { id: 4, model: 'HP UPS R8000', vendor: 'HP', serial_number: 'UPS-001', type: 'ups', status: 'online', zone: 'Zone A', rack: 'A3', position: 'U10-U12', metrics: { power_consumption: 200, temperature: 22, cpu_usage: 20, memory_usage: 30 }, updated_at: new Date(Date.now() - 100000), location: { x: 70, y: 30 } },
  { id: 5, model: 'Vertiv Liebert PDX', vendor: 'Vertiv', serial_number: 'COOL-001', type: 'cooling', status: 'online', zone: 'Zone B', rack: 'B2', position: 'Floor', metrics: { power_consumption: 3500, temperature: 18, cpu_usage: 60, memory_usage: 50 }, updated_at: new Date(Date.now() - 250000), location: { x: 50, y: 70 } },
  { id: 6, model: 'Juniper EX4400', vendor: 'Juniper', serial_number: 'ROU-001', type: 'router', status: 'critical', zone: 'Zone C', rack: 'C1', position: 'U7-U8', metrics: { power_consumption: 400, temperature: 45, cpu_usage: 95, memory_usage: 88 }, updated_at: new Date(Date.now() - 400000), location: { x: 30, y: 80 } },
  { id: 7, model: 'APC Smart-UPS XL', vendor: 'APC', serial_number: 'UPS-002', type: 'ups', status: 'online', zone: 'Zone C', rack: 'C2', position: 'U13-U15', metrics: { power_consumption: 250, temperature: 24, cpu_usage: 25, memory_usage: 35 }, updated_at: new Date(Date.now() - 180000), location: { x: 55, y: 80 } },
  { id: 8, model: 'Dell PowerEdge R760', vendor: 'Dell', serial_number: 'SRV-002', type: 'server', status: 'online', zone: 'Zone B', rack: 'B3', position: 'U4-U7', metrics: { power_consumption: 920, temperature: 35, cpu_usage: 68, memory_usage: 72 }, updated_at: new Date(Date.now() - 50000), location: { x: 80, y: 60 } },
];

const EquipmentManagement = () => {
  const [equipment, setEquipment] = useState(mockEquipment);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  const equipmentTypes = [
    { value: 'all', label: 'Tous les types' },
    { value: 'server', label: 'Serveurs' },
    { value: 'switch', label: 'Commutateurs' },
    { value: 'router', label: 'Routeurs' },
    { value: 'storage', label: 'Stockage' },
    { value: 'ups', label: 'Onduleurs' },
    { value: 'cooling', label: 'Refroidissement' },
  ];

  const statusColors = {
    online: '#00FF88',
    offline: '#6B7280',
    warning: '#F59E0B',
    critical: '#EF4444',
  };

  const getEquipmentIcon = (type) => {
    switch (type) {
      case 'server': return FaServer;
      case 'switch': return FaNetworkWired;
      case 'router': return FaNetworkWired;
      case 'storage': return FaServer;
      case 'ups': return FaBatteryHalf;
      case 'cooling': return FaFan;
      default: return FaTools;
    }
  };

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const EquipmentCard = ({ item }) => {
    const IconComponent = getEquipmentIcon(item.type);
    return (
      <div
        onClick={() => setSelectedEquipment(item)}
        className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/50 hover:border-[#00FF88]/50 transition-all duration-300 cursor-pointer group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${statusColors[item.status]}20` }}>
              <IconComponent className="w-5 h-5" style={{ color: statusColors[item.status] }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-[#00FF88] transition-colors">{item.model}</h3>
              <p className="text-xs text-gray-400">{item.zone} - {item.rack}</p>
            </div>
          </div>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors[item.status] }} />
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Puissance</span>
            <span className="text-white font-medium">{item.metrics.power_consumption}W</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Température</span>
            <span className="text-white font-medium">{item.metrics.temperature}°C</span>
          </div>
          <div className="w-full bg-gray-700/30 rounded-full h-2 mt-2">
            <div className="h-full bg-[#00FF88] rounded-full" style={{ width: `${item.metrics.cpu_usage}%` }} />
          </div>
          <div className="text-xs text-gray-400 text-center">CPU: {item.metrics.cpu_usage}%</div>
        </div>
      </div>
    );
  };

  const ZoneVisualization = () => {
    const zones = [...new Set(equipment.map(e => e.zone))];
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {zones.map(zone => (
          <div key={zone} className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{zone}</h3>
            <svg width="100%" height="250" className="border border-gray-700/50 rounded-lg mb-4 bg-gray-900/50">
              <defs>
                <linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00FF88" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#00FF88" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#gridGrad)" />
              {equipment.filter(e => e.zone === zone).map(item => {
                const Icon = getEquipmentIcon(item.type);
                return (
                  <g key={item.id} onClick={() => setSelectedEquipment(item)} style={{ cursor: 'pointer' }}>
                    <circle cx={item.location.x} cy={item.location.y} r="20" fill={statusColors[item.status]} opacity="0.3" />
                    <circle cx={item.location.x} cy={item.location.y} r="15" fill={statusColors[item.status]} opacity="0.6" stroke={statusColors[item.status]} strokeWidth="2" />
                    <text x={item.location.x} y={item.location.y + 30} textAnchor="middle" fill="white" fontSize="11" className="pointer-events-none">{item.rack}</text>
                  </g>
                );
              })}
            </svg>
            <div className="text-sm">
              <p className="text-gray-400">Total: <span className="text-[#00FF88] font-semibold">{equipment.filter(e => e.zone === zone).length}</span></p>
              <p className="text-gray-400">En ligne: <span className="text-green-400 font-semibold">{equipment.filter(e => e.zone === zone && e.status === 'online').length}</span></p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const DetailModal = ({ item, onClose }) => {
    if (!item) return null;
    const IconComponent = getEquipmentIcon(item.type);

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 border border-gray-700/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gray-900 border-b border-gray-700/50 p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${statusColors[item.status]}20` }}>
                <IconComponent className="w-6 h-6" style={{ color: statusColors[item.status] }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{item.model}</h2>
                <p className="text-gray-400">{item.vendor}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Numéro de série</p>
                <p className="text-white font-semibold">{item.serial_number}</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Statut</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors[item.status] }} />
                  <p className="text-white font-semibold capitalize">{item.status}</p>
                </div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1 flex items-center gap-2"><FaMapMarkerAlt className="w-3 h-3" /> Localisation</p>
                <p className="text-white font-semibold">{item.zone} - {item.rack} {item.position}</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1 flex items-center gap-2"><FaClock className="w-3 h-3" /> Dernière mise à jour</p>
                <p className="text-white font-semibold">{item.updated_at.toLocaleString('fr-FR')}</p>
              </div>
            </div>

            {/* Métriques en temps réel */}
            <div className="border-t border-gray-700/50 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><FaChartLine /> Métriques</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Consommation électrique</p>
                  <p className="text-2xl font-bold text-[#00FF88]">{item.metrics.power_consumption}W</p>
                  <div className="w-full bg-gray-700/30 rounded-full h-2 mt-3">
                    <div className="h-full bg-[#00FF88] rounded-full" style={{ width: `${Math.min(item.metrics.power_consumption / 50, 100)}%` }} />
                  </div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Température</p>
                  <p className="text-2xl font-bold text-[#F59E0B]">{item.metrics.temperature}°C</p>
                  <div className="w-full bg-gray-700/30 rounded-full h-2 mt-3">
                    <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: `${(item.metrics.temperature / 50) * 100}%` }} />
                  </div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Utilisation CPU</p>
                  <p className="text-2xl font-bold text-[#3B82F6]">{item.metrics.cpu_usage}%</p>
                  <div className="w-full bg-gray-700/30 rounded-full h-2 mt-3">
                    <div className="h-full bg-[#3B82F6] rounded-full" style={{ width: `${item.metrics.cpu_usage}%` }} />
                  </div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Utilisation Mémoire</p>
                  <p className="text-2xl font-bold text-[#8B5CF6]">{item.metrics.memory_usage}%</p>
                  <div className="w-full bg-gray-700/30 rounded-full h-2 mt-3">
                    <div className="h-full bg-[#8B5CF6] rounded-full" style={{ width: `${item.metrics.memory_usage}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-700/50 pt-6 flex gap-3">
              <button className="flex-1 bg-[#00FF88]/10 hover:bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30 rounded-lg py-2 transition-all">
                Configurer
              </button>
              <button className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-400/30 rounded-lg py-2 transition-all">
                Maintenance
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-950">
      {/* Header */}
      <div className="p-6 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00FF88] to-[#00CC6F] flex items-center justify-center">
              <FaTools className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Gestion des Équipements</h1>
              <p className="text-gray-400">Surveillance et maintenance de l'infrastructure</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#00FF88] text-black' : 'bg-gray-800 text-gray-400'}`}>
              Grille
            </button>
            <button onClick={() => setViewMode('map')} className={`px-4 py-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-[#00FF88] text-black' : 'bg-gray-800 text-gray-400'}`}>
              Carte
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un équipement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00FF88]/50 focus:ring-1 focus:ring-[#00FF88]/50"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-[#00FF88]/50"
          >
            {equipmentTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-[#00FF88]/50"
          >
            <option value="all">Tous les statuts</option>
            <option value="online">En ligne</option>
            <option value="warning">Avertissement</option>
            <option value="critical">Critique</option>
            <option value="offline">Hors ligne</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.length > 0 ? (
              filteredEquipment.map((item) => <EquipmentCard key={item.id} item={item} />)
            ) : (
              <div className="col-span-full text-center py-16">
                <FaTools className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Aucun équipement trouvé</h3>
                <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
              </div>
            )}
          </div>
        ) : (
          <ZoneVisualization />
        )}
      </div>

      {/* Summary Stats */}
      <div className="p-6 border-t border-gray-800/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[#00FF88]">{equipment.length}</div>
            <div className="text-sm text-gray-400">Total</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{equipment.filter(e => e.status === 'online').length}</div>
            <div className="text-sm text-gray-400">En ligne</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{equipment.filter(e => e.status === 'warning').length}</div>
            <div className="text-sm text-gray-400">Avertissements</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{equipment.filter(e => e.status === 'critical').length}</div>
            <div className="text-sm text-gray-400">Critiques</div>
          </div>
        </div>
      </div>

      <DetailModal item={selectedEquipment} onClose={() => setSelectedEquipment(null)} />
    </div>
  );
};

export default EquipmentManagement;