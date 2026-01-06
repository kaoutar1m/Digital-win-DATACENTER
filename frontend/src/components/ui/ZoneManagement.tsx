import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../providers/SocketProvider';
import { FaBuilding, FaShieldAlt, FaBell, FaCog, FaSearch, FaPlus, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes, FaSpinner } from 'react-icons/fa';

interface Zone {
  id: string;
  name: string;
  type: 'public' | 'restricted' | 'critical' | 'sensitive';
  securityLevel: 1 | 2 | 3 | 4 | 5;
  location: string;
  accessPoints: number;
  authorizedUsers: number;
  sensors: number;
  status: 'active' | 'maintenance' | 'inactive';
  lastActivity: Date;
}

interface ZoneAlert {
  id: string;
  zoneId: string;
  zoneName: string;
  type: 'intrusion' | 'sensor' | 'access' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

const ZoneManagement: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const [zones, setZones] = useState<Zone[]>([]);
  const [alerts, setAlerts] = useState<ZoneAlert[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'zones' | 'alerts' | 'config'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newZone, setNewZone] = useState({
    name: '',
    type: 'public' as Zone['type'],
    securityLevel: 1,
    location: '',
    accessPoints: 1,
    authorizedUsers: 1,
    sensors: 1
  });

  // Sample zones for demonstration
  const getSampleZones = (): Zone[] => [
    {
      id: 'sample-1',
      name: 'Data Center Core',
      type: 'critical',
      securityLevel: 5,
      location: 'Floor 1, Central Area',
      accessPoints: 4,
      authorizedUsers: 12,
      sensors: 8,
      status: 'active',
      lastActivity: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      id: 'sample-2',
      name: 'Network Operations',
      type: 'sensitive',
      securityLevel: 4,
      location: 'Floor 2, East Wing',
      accessPoints: 3,
      authorizedUsers: 8,
      sensors: 6,
      status: 'active',
      lastActivity: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
    },
    {
      id: 'sample-3',
      name: 'Backup Systems',
      type: 'restricted',
      securityLevel: 3,
      location: 'Basement, Server Room B',
      accessPoints: 2,
      authorizedUsers: 5,
      sensors: 4,
      status: 'active',
      lastActivity: new Date(Date.now() - 1000 * 60 * 45) // 45 minutes ago
    },
    {
      id: 'sample-4',
      name: 'Public Access Area',
      type: 'public',
      securityLevel: 1,
      location: 'Ground Floor, Lobby',
      accessPoints: 6,
      authorizedUsers: 50,
      sensors: 3,
      status: 'active',
      lastActivity: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
    },
    {
      id: 'sample-5',
      name: 'Maintenance Zone',
      type: 'restricted',
      securityLevel: 2,
      location: 'Floor 3, Utility Room',
      accessPoints: 1,
      authorizedUsers: 3,
      sensors: 2,
      status: 'maintenance',
      lastActivity: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
    }
  ];

  // Sample alerts for demonstration
  const getSampleAlerts = (): ZoneAlert[] => [
    {
      id: 'alert-1',
      zoneId: 'sample-1',
      zoneName: 'Data Center Core',
      type: 'intrusion',
      severity: 'critical',
      message: 'Unauthorized access detected in critical zone',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      acknowledged: false
    },
    {
      id: 'alert-2',
      zoneId: 'sample-2',
      zoneName: 'Network Operations',
      type: 'sensor',
      severity: 'high',
      message: 'Temperature sensor failure detected',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      acknowledged: true
    },
    {
      id: 'alert-3',
      zoneId: 'sample-3',
      zoneName: 'Backup Systems',
      type: 'access',
      severity: 'medium',
      message: 'Multiple failed access attempts',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      acknowledged: false
    },
    {
      id: 'alert-4',
      zoneId: 'sample-1',
      zoneName: 'Data Center Core',
      type: 'system',
      severity: 'high',
      message: 'Power fluctuation detected in critical systems',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      acknowledged: true
    },
    {
      id: 'alert-5',
      zoneId: 'sample-4',
      zoneName: 'Public Access Area',
      type: 'access',
      severity: 'low',
      message: 'Visitor badge expired',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      acknowledged: true
    },
    {
      id: 'alert-6',
      zoneId: 'sample-2',
      zoneName: 'Network Operations',
      type: 'sensor',
      severity: 'medium',
      message: 'Humidity levels above threshold',
      timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
      acknowledged: false
    },
    {
      id: 'alert-7',
      zoneId: 'sample-5',
      zoneName: 'Maintenance Zone',
      type: 'intrusion',
      severity: 'high',
      message: 'Motion detected during off-hours',
      timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      acknowledged: true
    },
    {
      id: 'alert-8',
      zoneId: 'sample-3',
      zoneName: 'Backup Systems',
      type: 'system',
      severity: 'critical',
      message: 'Backup generator offline',
      timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
      acknowledged: true
    },
    {
      id: 'alert-9',
      zoneId: 'sample-1',
      zoneName: 'Data Center Core',
      type: 'sensor',
      severity: 'medium',
      message: 'Cooling system efficiency decreased',
      timestamp: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
      acknowledged: true
    },
    {
      id: 'alert-10',
      zoneId: 'sample-4',
      zoneName: 'Public Access Area',
      type: 'access',
      severity: 'low',
      message: 'Door left unlocked',
      timestamp: new Date(Date.now() - 1000 * 60 * 300), // 5 hours ago
      acknowledged: true
    }
  ];

  // Fetch zones from backend API
  const fetchZones = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3001/api/zones');
      if (!response.ok) {
        throw new Error('Failed to fetch zones');
      }
      const data = await response.json();

      // Transform backend data to frontend format
      const transformedZones: Zone[] = data.map((zone: any) => ({
        id: zone.id.toString(),
        name: zone.name,
        type: zone.security_level >= 5 ? 'critical' : zone.security_level >= 4 ? 'sensitive' : zone.security_level >= 3 ? 'restricted' : 'public',
        securityLevel: zone.security_level,
        location: zone.position || 'Unknown Location',
        accessPoints: 1, // Default values since backend doesn't have these
        authorizedUsers: 1,
        sensors: 1,
        status: 'active',
        lastActivity: new Date(zone.created_at || Date.now())
      }));

      // If no zones from API, use sample zones for demonstration
      const finalZones = transformedZones.length > 0 ? transformedZones : getSampleZones();

      setZones(finalZones);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch zones');
      // On error, show sample zones for demonstration
      setZones(getSampleZones());
      console.error('Error fetching zones:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load zones and alerts on component mount
  useEffect(() => {
    fetchZones();
    // Initialize with sample alerts for demonstration
    setAlerts(getSampleAlerts());
  }, [fetchZones]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleZoneUpdate = (data: Zone) => {
      setZones(prev => prev.map(zone => zone.id === data.id ? data : zone));
    };

    const handleZoneAlert = (data: ZoneAlert) => {
      setAlerts(prev => [data, ...prev.slice(0, 49)]);
    };

    socket.on('zone:update', handleZoneUpdate);
    socket.on('zone:alert', handleZoneAlert);

    return () => {
      socket.off('zone:update', handleZoneUpdate);
      socket.off('zone:alert', handleZoneAlert);
    };
  }, [socket, isConnected]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  const handleAddZone = useCallback(async () => {
    if (!newZone.name.trim() || !newZone.location.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      const zoneData = {
        name: newZone.name,
        security_level: newZone.securityLevel,
        position: newZone.location
      };

      const response = await fetch('http://localhost:3001/api/zones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(zoneData),
      });

      if (!response.ok) {
        throw new Error('Failed to create zone');
      }

      const createdZone = await response.json();

      // Transform backend response to frontend format
      const transformedZone: Zone = {
        id: createdZone.id.toString(),
        name: createdZone.name,
        type: createdZone.security_level >= 5 ? 'critical' : createdZone.security_level >= 4 ? 'sensitive' : createdZone.security_level >= 3 ? 'restricted' : 'public',
        securityLevel: createdZone.security_level,
        location: createdZone.position || 'Unknown Location',
        accessPoints: 1,
        authorizedUsers: 1,
        sensors: 1,
        status: 'active',
        lastActivity: new Date(createdZone.created_at || Date.now())
      };

      setZones(prev => [...prev, transformedZone]);
      setShowAddZoneModal(false);
      setNewZone({
        name: '',
        type: 'public' as Zone['type'],
        securityLevel: 1,
        location: '',
        accessPoints: 1,
        authorizedUsers: 1,
        sensors: 1
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create zone');
      console.error('Error creating zone:', err);
    } finally {
      setIsLoading(false);
    }
  }, [newZone]);

  const filteredZones = zones.filter(zone =>
    (filterType === 'all' || zone.type === filterType) &&
    (searchTerm === '' || zone.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredAlerts = alerts.filter(alert =>
    searchTerm === '' || alert.zoneName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getZoneTypeColor = (type: Zone['type']) => {
    switch (type) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'sensitive': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'restricted': return 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30';
      case 'public': return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'high': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'low': return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#1A1F2E] to-[#0F1419] border border-gray-800/50 rounded-xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800/50">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Gestion des Zones</h2>
          <p className="text-gray-500 text-sm">
            Surveillance des zones en temps réel et gestion de la sécurité
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900/30 border border-gray-800/50">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#00FF88] animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-400 font-medium">
            {isConnected ? 'Connecté' : 'Déconnecté'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'overview' as const, label: 'Aperçu', icon: FaShieldAlt },
          { id: 'zones' as const, label: 'Zones', icon: FaBuilding },
          { id: 'alerts' as const, label: 'Alertes', icon: FaBell },
          { id: 'config' as const, label: 'Configuration', icon: FaCog }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/30 border border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-5 hover:border-[#00FF88]/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00FF88]/10 flex items-center justify-center">
                    <FaBuilding className="text-[#00FF88]" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{zones.length}</div>
                <div className="text-gray-500 text-sm">Total des Zones</div>
              </div>

              <div className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-5 hover:border-[#00FF88]/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00FF88]/10 flex items-center justify-center">
                    <FaCheckCircle className="text-[#00FF88]" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {zones.filter(z => z.status === 'active').length}
                </div>
                <div className="text-gray-500 text-sm">Zones Actives</div>
              </div>

              <div className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-5 hover:border-red-500/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <FaShieldAlt className="text-red-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {zones.filter(z => z.type === 'critical').length}
                </div>
                <div className="text-gray-500 text-sm">Zones Critiques</div>
              </div>

              <div className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-5 hover:border-amber-500/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <FaBell className="text-amber-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {alerts.filter(a => !a.acknowledged).length}
                </div>
                <div className="text-gray-500 text-sm">Alertes Actives</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-[#00FF88]" />
                Activité Récente
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        alert.severity === 'critical' ? 'bg-red-500/10' :
                        alert.severity === 'high' ? 'bg-amber-500/10' :
                        alert.severity === 'medium' ? 'bg-blue-500/10' :
                        'bg-gray-500/10'
                      }`}>
                        {alert.type === 'intrusion' && <FaShieldAlt className={
                          alert.severity === 'critical' ? 'text-red-400' :
                          alert.severity === 'high' ? 'text-amber-400' :
                          'text-blue-400'
                        } />}
                        {alert.type === 'sensor' && <FaInfoCircle className={
                          alert.severity === 'critical' ? 'text-red-400' :
                          alert.severity === 'high' ? 'text-amber-400' :
                          'text-blue-400'
                        } />}
                        {alert.type === 'access' && <FaCheckCircle className={
                          alert.severity === 'critical' ? 'text-red-400' :
                          alert.severity === 'high' ? 'text-amber-400' :
                          'text-blue-400'
                        } />}
                        {alert.type === 'system' && <FaCog className={
                          alert.severity === 'critical' ? 'text-red-400' :
                          alert.severity === 'high' ? 'text-amber-400' :
                          'text-blue-400'
                        } />}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm mb-1">{alert.message}</div>
                        <div className="text-gray-500 text-xs">
                          {alert.zoneName} • {alert.timestamp.toLocaleString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <div className={`text-xs font-bold px-3 py-1 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Zones Tab */}
        {activeTab === 'zones' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h3 className="text-lg font-bold text-white">Gestion des Zones</h3>
              <div className="flex items-center gap-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
                >
                  <option value="all">Tous les Types</option>
                  <option value="critical">Critique</option>
                  <option value="sensitive">Sensible</option>
                  <option value="restricted">Restreint</option>
                  <option value="public">Public</option>
                </select>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Rechercher des zones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-900/50 border border-gray-800/50 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
                  />
                </div>
                <button
                  onClick={() => setShowAddZoneModal(true)}
                  className="bg-[#00FF88] text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#00DD77] transition-all flex items-center gap-2"
                >
                  <FaPlus className="w-3 h-3" />
                  Ajouter une Zone
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
              {filteredZones.map((zone) => (
                <div key={zone.id} className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-5 hover:border-gray-700/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        zone.status === 'active' ? 'bg-[#00FF88] shadow-lg shadow-[#00FF88]/50' :
                        zone.status === 'maintenance' ? 'bg-amber-400' :
                        'bg-gray-500'
                      }`}></div>
                      <div>
                        <div className="text-white font-bold text-base mb-1">{zone.name}</div>
                        <div className="text-gray-500 text-sm">{zone.location}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-bold px-3 py-1 rounded-lg mb-2 border ${getZoneTypeColor(zone.type)}`}>
                        {zone.type.toUpperCase()}
                      </div>
                      <div className="text-gray-500 text-xs">
                        Niveau de Sécurité: <span className="text-[#00FF88] font-bold">{zone.securityLevel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                      <div className="text-[#00FF88] font-bold text-xl mb-1">{zone.accessPoints}</div>
                      <div className="text-gray-500 text-xs">Points d'Accès</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                      <div className="text-[#00FF88] font-bold text-xl mb-1">{zone.authorizedUsers}</div>
                      <div className="text-gray-500 text-xs">Utilisateurs</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                      <div className="text-[#00FF88] font-bold text-xl mb-1">{zone.sensors}</div>
                      <div className="text-gray-500 text-xs">Capteurs</div>
                    </div>
               teis     <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                      <div className="text-gray-500 text-xs mb-1">Dernière Activité</div>
                      <div className="text-white text-xs font-medium">{zone.lastActivity.toLocaleTimeString('fr-FR')}</div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedZone(zone)}
                      className="text-[#00FF88] text-sm font-medium hover:underline"
                    >
                      View Details
                    </button>
                    <button className="text-gray-400 text-sm font-medium hover:text-white">
                      Configure
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Alertes de Zone</h3>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher des alertes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-900/50 border border-gray-800/50 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-900/30 border border-gray-800/50 rounded-xl hover:border-gray-700/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      alert.severity === 'critical' ? 'bg-red-500/10' :
                      alert.severity === 'high' ? 'bg-amber-500/10' :
                      alert.severity === 'medium' ? 'bg-blue-500/10' :
                      'bg-gray-500/10'
                    }`}>
                      {alert.type === 'intrusion' && <FaShieldAlt className={
                        alert.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                      } />}
                      {alert.type === 'sensor' && <FaInfoCircle className="text-blue-400" />}
                      {alert.type === 'access' && <FaCheckCircle className="text-[#00FF88]" />}
                      {alert.type === 'system' && <FaCog className="text-gray-400" />}
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm mb-1">{alert.message}</div>
                      <div className="text-gray-500 text-xs">
                        {alert.zoneName} • {alert.type} • {alert.timestamp.toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`text-xs font-bold px-3 py-1 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </div>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="bg-[#00FF88] text-black px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-[#00DD77] transition-all"
                      >
                        Acquitter
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Configuration des Zones</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-5">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                  <FaShieldAlt className="text-[#00FF88]" />
                  Paramètres de Sécurité
                </h4>
                <div className="space-y-4">
                  {[
                    { label: 'Verrouillage Automatique des Zones Critiques', checked: true },
                    { label: 'Détection d\'Intrusion', checked: true },
                    { label: 'Surveillance en Temps Réel', checked: true }
                  ].map((setting, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <span className="text-gray-300 text-sm">{setting.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={setting.checked} />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00FF88]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-5">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                  <FaBell className="text-[#00FF88]" />
                  Paramètres d'Alerte
                </h4>
                <div className="space-y-4">
                  {[
                    { label: 'Notifications par Email', checked: false },
                    { label: 'Alertes SMS', checked: true },
                    { label: 'Escalade des Alertes Critiques', checked: true }
                  ].map((setting, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <span className="text-gray-300 text-sm">{setting.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={setting.checked} />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00FF88]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button className="bg-gray-800/50 text-gray-300 px-6 py-2.5 rounded-lg hover:bg-gray-700/50 transition-all font-medium border border-gray-700/50">
                Réinitialiser aux Valeurs par Défaut
              </button>
              <button className="bg-[#00FF88] text-black px-6 py-2.5 rounded-lg hover:bg-[#00DD77] transition-all font-bold">
                Sauvegarder la Configuration
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Zone Modal */}
      {showAddZoneModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1A1F2E] to-[#0F1419] border border-gray-800/50 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Ajouter une Nouvelle Zone</h3>
              <button
                onClick={() => setShowAddZoneModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom de la Zone</label>
                <input
                  type="text"
                  value={newZone.name}
                  onChange={(e) => setNewZone(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
                  placeholder="Entrez le nom de la zone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select
                  value={newZone.type}
                  onChange={(e) => setNewZone(prev => ({ ...prev, type: e.target.value as Zone['type'] }))}
                  className="w-full bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
                >
                  <option value="public">Public</option>
                  <option value="restricted">Restreint</option>
                  <option value="sensitive">Sensible</option>
                  <option value="critical">Critique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Niveau de Sécurité</label>
                <select
                  value={newZone.securityLevel}
                  onChange={(e) => setNewZone(prev => ({ ...prev, securityLevel: parseInt(e.target.value) }))}
                  className="w-full bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
                >
                  <option value={1}>1 - Faible</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5 - Élevé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Emplacement</label>
                <input
                  type="text"
                  value={newZone.location}
                  onChange={(e) => setNewZone(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
                  placeholder="Entrez l'emplacement"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Points d'Accès</label>
                  <input
                    type="number"
                    min="1"
                    value={newZone.accessPoints}
                    onChange={(e) => setNewZone(prev => ({ ...prev, accessPoints: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Utilisateurs</label>
                  <input
                    type="number"
                    min="1"
                    value={newZone.authorizedUsers}
                    onChange={(e) => setNewZone(prev => ({ ...prev, authorizedUsers: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Capteurs</label>
                  <input
                    type="number"
                    min="1"
                    value={newZone.sensors}
                    onChange={(e) => setNewZone(prev => ({ ...prev, sensors: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddZoneModal(false)}
                className="flex-1 bg-gray-800/50 text-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-700/50 transition-all font-medium border border-gray-700/50"
              >
                Annuler
              </button>
              <button
                onClick={handleAddZone}
                className="flex-1 bg-[#00FF88] text-black px-4 py-2.5 rounded-lg hover:bg-[#00DD77] transition-all font-bold"
              >
                Ajouter la Zone
              </button>
            </div>
          </div>
        </div>
      )}

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

export default ZoneManagement;