import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../providers/SocketProvider';
import { FaUser, FaVideo, FaBell, FaExclamationTriangle, FaFingerprint, FaIdCard, FaLock, FaCheckCircle, FaTimesCircle, FaClock, FaPlay, FaStop, FaExpand, FaFilter, FaSearch } from 'react-icons/fa';

interface BiometricAccess {
  id: string;
  userId: string;
  userName: string;
  timestamp: Date;
  location: string;
  method: 'fingerprint' | 'face' | 'card' | 'pin';
  status: 'granted' | 'denied' | 'pending';
  confidence?: number;
}

interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'recording';
  thumbnail: string;
  lastMotion: Date;
  zone: string;
  resolution: string;
  fps: number;
}

interface IntrusionAlert {
  id: string;
  type: 'motion' | 'breach' | 'unauthorized' | 'tamper';
  location: string;
  zone: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  description: string;
  acknowledged: boolean;
}

interface Violation {
  id: string;
  userId?: string;
  userName?: string;
  type: 'access_denied' | 'forced_entry' | 'tamper' | 'timeout';
  location: string;
  timestamp: Date;
  details: string;
}

const SecurityPanel: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const [biometricAccess, setBiometricAccess] = useState<BiometricAccess[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [intrusionAlerts, setIntrusionAlerts] = useState<IntrusionAlert[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'access' | 'cameras' | 'alerts' | 'violations'>('access');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'zone'>('name');

  // Mock data with enhanced camera details
  useEffect(() => {
    const mockBiometricAccess: BiometricAccess[] = [
      {
        id: '1',
        userId: 'user001',
        userName: 'John Smith',
        timestamp: new Date(Date.now() - 300000),
        location: 'Main Entrance',
        method: 'fingerprint',
        status: 'granted',
        confidence: 98.5
      },
      {
        id: '2',
        userId: 'user002',
        userName: 'Sarah Johnson',
        timestamp: new Date(Date.now() - 600000),
        location: 'Server Room A',
        method: 'face',
        status: 'granted',
        confidence: 95.2
      },
      {
        id: '3',
        userId: 'unknown',
        userName: 'Unknown User',
        timestamp: new Date(Date.now() - 900000),
        location: 'Network Room',
        method: 'card',
        status: 'denied'
      },
      {
        id: '4',
        userId: 'user003',
        userName: 'Mike Davis',
        timestamp: new Date(Date.now() - 1200000),
        location: 'Loading Dock',
        method: 'pin',
        status: 'granted',
        confidence: 100
      }
    ];

    const mockCameras: Camera[] = [
      {
        id: 'cam001',
        name: 'Main Entrance',
        location: 'Front Door',
        status: 'online',
        thumbnail: '/api/placeholder/160/90',
        lastMotion: new Date(Date.now() - 120000),
        zone: 'entrance',
        resolution: '1920x1080',
        fps: 30
      },
      {
        id: 'cam002',
        name: 'Server Room A',
        location: 'Server Room A - North',
        status: 'recording',
        thumbnail: '/api/placeholder/160/90',
        lastMotion: new Date(Date.now() - 300000),
        zone: 'server-rooms',
        resolution: '2560x1440',
        fps: 60
      },
      {
        id: 'cam003',
        name: 'Loading Dock',
        location: 'Rear Entrance',
        status: 'online',
        thumbnail: '/api/placeholder/160/90',
        lastMotion: new Date(Date.now() - 1800000),
        zone: 'perimeter',
        resolution: '1920x1080',
        fps: 30
      },
      {
        id: 'cam004',
        name: 'Parking Lot',
        location: 'Exterior West',
        status: 'offline',
        thumbnail: '/api/placeholder/160/90',
        lastMotion: new Date(Date.now() - 3600000),
        zone: 'perimeter',
        resolution: '1280x720',
        fps: 25
      },
      {
        id: 'cam005',
        name: 'Network Room',
        location: 'Floor 2 - East Wing',
        status: 'online',
        thumbnail: '/api/placeholder/160/90',
        lastMotion: new Date(Date.now() - 600000),
        zone: 'network',
        resolution: '1920x1080',
        fps: 30
      },
      {
        id: 'cam006',
        name: 'Emergency Exit',
        location: 'Floor 1 - South',
        status: 'recording',
        thumbnail: '/api/placeholder/160/90',
        lastMotion: new Date(Date.now() - 180000),
        zone: 'entrance',
        resolution: '1920x1080',
        fps: 30
      }
    ];

    const mockAlerts: IntrusionAlert[] = [
      {
        id: 'alert001',
        type: 'motion',
        location: 'Perimeter Zone 3',
        zone: 'perimeter',
        severity: 'medium',
        timestamp: new Date(Date.now() - 300000),
        description: 'Motion detected near fence line',
        acknowledged: false
      },
      {
        id: 'alert002',
        type: 'unauthorized',
        location: 'Server Room B',
        zone: 'server-rooms',
        severity: 'high',
        timestamp: new Date(Date.now() - 600000),
        description: 'Unauthorized access attempt',
        acknowledged: true
      },
      {
        id: 'alert003',
        type: 'breach',
        location: 'Emergency Exit',
        zone: 'entrance',
        severity: 'critical',
        timestamp: new Date(Date.now() - 900000),
        description: 'Door breach detected',
        acknowledged: false
      }
    ];

    const mockViolations: Violation[] = [
      {
        id: 'viol001',
        userId: 'user003',
        userName: 'Mike Davis',
        type: 'access_denied',
        location: 'Network Room',
        timestamp: new Date(Date.now() - 3600000),
        details: 'Invalid credentials - 3 attempts'
      },
      {
        id: 'viol002',
        type: 'forced_entry',
        location: 'Emergency Exit',
        timestamp: new Date(Date.now() - 7200000),
        details: 'Door forced open without authorization'
      },
      {
        id: 'viol003',
        userId: 'user004',
        userName: 'Lisa Brown',
        type: 'timeout',
        location: 'Server Room A',
        timestamp: new Date(Date.now() - 10800000),
        details: 'Access timeout - Door left open'
      }
    ];

    setBiometricAccess(mockBiometricAccess);
    setCameras(mockCameras);
    setIntrusionAlerts(mockAlerts);
    setViolations(mockViolations);
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleBiometricAccess = (data: BiometricAccess) => {
      setBiometricAccess(prev => [data, ...prev.slice(0, 19)]);
    };

    const handleCameraUpdate = (data: Camera) => {
      setCameras(prev => prev.map(cam => cam.id === data.id ? data : cam));
    };

    const handleIntrusionAlert = (data: IntrusionAlert) => {
      setIntrusionAlerts(prev => [data, ...prev.slice(0, 19)]);
    };

    const handleViolation = (data: Violation) => {
      setViolations(prev => [data, ...prev.slice(0, 19)]);
    };

    socket.on('security:biometric-access', handleBiometricAccess);
    socket.on('security:camera-update', handleCameraUpdate);
    socket.on('security:intrusion-alert', handleIntrusionAlert);
    socket.on('security:violation', handleViolation);

    return () => {
      socket.off('security:biometric-access', handleBiometricAccess);
      socket.off('security:camera-update', handleCameraUpdate);
      socket.off('security:intrusion-alert', handleIntrusionAlert);
      socket.off('security:violation', handleViolation);
    };
  }, [socket, isConnected]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setIntrusionAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  }, []);

  // Filtrage et tri des caméras
  const filteredAndSortedCameras = cameras
    .filter(camera => {
      const matchesZone = selectedZone === 'all' || camera.zone === selectedZone;
      const matchesStatus = statusFilter === 'all' || camera.status === statusFilter;
      const matchesSearch = camera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           camera.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesZone && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'zone':
          return a.zone.localeCompare(b.zone);
        default:
          return 0;
      }
    });

  const filteredAlerts = intrusionAlerts.filter(alert =>
    selectedZone === 'all' || alert.zone === selectedZone
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return { bg: 'bg-[#00FF88]/10', text: 'text-[#00FF88]', dot: 'bg-[#00FF88]' };
      case 'recording': return { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' };
      case 'offline': return { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-500' };
      default: return { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-500' };
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

  const translateStatus = (status: string) => {
    switch (status) {
      case 'granted': return 'ACCORDÉ';
      case 'denied': return 'REFUSÉ';
      case 'pending': return 'EN ATTENTE';
      case 'online': return 'EN LIGNE';
      case 'recording': return 'ENREGISTREMENT';
      case 'offline': return 'HORS LIGNE';
      default: return status.toUpperCase();
    }
  };

  const translateSeverity = (severity: string) => {
    switch (severity) {
      case 'critical': return 'CRITIQUE';
      case 'high': return 'ÉLEVÉ';
      case 'medium': return 'MOYEN';
      case 'low': return 'FAIBLE';
      default: return severity.toUpperCase();
    }
  };

  const translateViolationType = (type: string) => {
    switch (type) {
      case 'access_denied': return 'ACCÈS REFUSÉ';
      case 'forced_entry': return 'ENTRÉE FORCÉE';
      case 'tamper': return 'ALTÉRATION';
      case 'timeout': return 'DÉLAI EXPIRÉ';
      default: return type.replace(/_/g, ' ').toUpperCase();
    }
  };

  const translateMethod = (method: string) => {
    switch (method) {
      case 'fingerprint': return 'Empreinte Digitale';
      case 'face': return 'Reconnaissance Faciale';
      case 'card': return 'Carte';
      case 'pin': return 'Code PIN';
      default: return method;
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#1A1F2E] to-[#0F1419] border border-gray-800/50 rounded-xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800/50">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Centre de Contrôle de Sécurité</h2>
          <p className="text-gray-500 text-sm">Surveillance de sécurité en temps réel et contrôle d'accès</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900/30 border border-gray-800/50">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#00FF88] animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-400 font-medium">
            {isConnected ? 'En Direct' : 'Déconnecté'}
          </span>
        </div>
      </div>

      {/* Zone Filter & Stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaFilter className="text-gray-500" />
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
          >
            <option value="all">Toutes les Zones</option>
            <option value="perimeter">Périmètre</option>
            <option value="entrance">Entrée</option>
            <option value="server-rooms">Salles Serveurs</option>
            <option value="network">Salle Réseau</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/30">
            <FaCheckCircle className="text-[#00FF88]" />
            <span className="text-xs text-[#00FF88] font-bold">
              {biometricAccess.filter(a => a.status === 'granted').length} Accordé
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30">
            <FaBell className="text-red-400" />
            <span className="text-xs text-red-400 font-bold">
              {intrusionAlerts.filter(a => !a.acknowledged).length} Actif
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'access' as const, label: 'Accès Biométrique', icon: FaFingerprint },
          { id: 'cameras' as const, label: 'Caméras', icon: FaVideo },
          { id: 'alerts' as const, label: 'Alertes d\'Intrusion', icon: FaBell },
          { id: 'violations' as const, label: 'Violations', icon: FaExclamationTriangle }
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
        {/* Biometric Access Tab */}
        {activeTab === 'access' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FaUser className="text-[#00FF88]" />
                Événements d'Accès Récents
              </h3>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00FF88]/10">
                <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse"></div>
                <span className="text-xs text-[#00FF88] font-bold">En Direct</span>
              </div>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
              {biometricAccess.map((access) => (
                <div key={access.id} className="flex items-center justify-between p-4 bg-gray-900/30 rounded-xl border border-gray-800/50 hover:border-gray-700/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      access.status === 'granted' ? 'bg-[#00FF88]/10' :
                      access.status === 'denied' ? 'bg-red-500/10' :
                      'bg-amber-500/10'
                    }`}>
                      {access.method === 'fingerprint' && <FaFingerprint className={
                        access.status === 'granted' ? 'text-[#00FF88]' : 'text-red-400'
                      } size={20} />}
                      {access.method === 'face' && <FaUser className={
                        access.status === 'granted' ? 'text-[#00FF88]' : 'text-red-400'
                      } size={20} />}
                      {access.method === 'card' && <FaIdCard className={
                        access.status === 'granted' ? 'text-[#00FF88]' : 'text-red-400'
                      } size={20} />}
                      {access.method === 'pin' && <FaLock className={
                        access.status === 'granted' ? 'text-[#00FF88]' : 'text-red-400'
                      } size={20} />}
                    </div>
                    <div>
                      <div className="text-white font-bold text-base mb-1">{access.userName}</div>
                      <div className="text-gray-500 text-sm">
                        {access.location} • {translateMethod(access.method)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold mb-1 ${
                      access.status === 'granted' ? 'text-[#00FF88]' :
                      access.status === 'denied' ? 'text-red-400' :
                      'text-amber-400'
                    }`}>
                      {access.status === 'granted' && <FaCheckCircle className="inline mr-1" />}
                      {access.status === 'denied' && <FaTimesCircle className="inline mr-1" />}
                      {access.status === 'pending' && <FaClock className="inline mr-1" />}
                      {translateStatus(access.status)}
                    </div>
                    <div className="text-gray-500 text-xs mb-1">
                      {access.timestamp.toLocaleTimeString('fr-FR')}
                    </div>
                    {access.confidence && (
                      <div className="text-[#00FF88] text-xs font-medium">
                        {access.confidence}% match
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cameras Tab */}
        {activeTab === 'cameras' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FaVideo className="text-[#00FF88]" />
                Caméras Actives
              </h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                  <input
                    type="text"
                    placeholder="Rechercher des caméras..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-900/50 border border-gray-800/50 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#00FF88]/50 transition-all w-48"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-900/50 border border-gray-800/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00FF88]/50"
                >
                  <option value="all">Tous les Statuts</option>
                  <option value="online">En Ligne</option>
                  <option value="recording">Enregistrement</option>
                  <option value="offline">Hors Ligne</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-gray-900/50 border border-gray-800/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00FF88]/50"
                >
                  <option value="name">Trier par Nom</option>
                  <option value="status">Trier par Statut</option>
                  <option value="zone">Trier par Zone</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-400">
                Affichage de {filteredAndSortedCameras.length} sur {cameras.length} caméras
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00FF88]"></div>
                  <span className="text-gray-400 text-xs">
                    {cameras.filter(c => c.status === 'online').length} En Ligne
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-gray-400 text-xs">
                    {cameras.filter(c => c.status === 'recording').length} Enregistrement
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                  <span className="text-gray-400 text-xs">
                    {cameras.filter(c => c.status === 'offline').length} Hors Ligne
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar">
              {filteredAndSortedCameras.map((camera) => {
                const statusColors = getStatusColor(camera.status);
                return (
                  <div key={camera.id} className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-4 hover:border-gray-700/50 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-white font-bold text-sm">{camera.name}</div>
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${statusColors.bg}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${statusColors.dot} ${camera.status === 'offline' ? '' : 'animate-pulse'}`}></div>
                        <span className={`text-xs font-bold ${statusColors.text}`}>
                          {translateStatus(camera.status)}
                        </span>
                      </div>
                    </div>

                    <div className="aspect-video bg-gray-800/50 rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-gray-700/30">
                      <div className="text-center">
                        <FaVideo className="text-gray-600 text-3xl mb-2 mx-auto" />
                        <span className="text-gray-500 text-xs">Flux Caméra</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Emplacement</span>
                        <span className="text-gray-300 font-medium">{camera.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Résolution</span>
                        <span className="text-[#00FF88] font-bold">{camera.resolution}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">FPS</span>
                        <span className="text-[#00FF88] font-bold">{camera.fps}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Dernier Mouvement</span>
                        <span className="text-gray-300 font-medium">
                          {camera.lastMotion.toLocaleTimeString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button className="flex items-center justify-center gap-1.5 bg-gray-800/50 text-gray-300 py-2 rounded-lg text-xs font-medium hover:bg-gray-700/50 transition-all border border-gray-700/30">
                        <FaExpand className="w-3 h-3" />
                        Voir
                      </button>
                      <button className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                        camera.status === 'recording'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                          : 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/30 hover:bg-[#00FF88]/20'
                      }`}>
                        {camera.status === 'recording' ? (
                          <>
                            <FaStop className="w-3 h-3" />
                            Arrêter
                          </>
                        ) : (
                          <>
                            <FaPlay className="w-3 h-3" />
                            Enregistrer
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Intrusion Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FaBell className="text-red-400" />
                Alertes d'Intrusion
              </h3>
              <div className="text-sm text-gray-400">
                {filteredAlerts.filter(a => !a.acknowledged).length} non reconnues
              </div>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-xl border transition-all ${
                  alert.acknowledged 
                    ? 'bg-gray-900/30 border-gray-800/50' 
                    : 'bg-red-500/5 border-red-500/30 hover:border-red-500/50'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        alert.severity === 'critical' ? 'bg-red-500/10' :
                        alert.severity === 'high' ? 'bg-amber-500/10' :
                        alert.severity === 'medium' ? 'bg-blue-500/10' :
                        'bg-gray-500/10'
                      }`}>
                        <FaExclamationTriangle className={
                          alert.severity === 'critical' ? 'text-red-400' :
                          alert.severity === 'high' ? 'text-amber-400' :
                          alert.severity === 'medium' ? 'text-blue-400' :
                          'text-gray-400'
                        } size={20} />
                      </div>
                      <div>
                        <div className="text-white font-bold text-base mb-1">{alert.location}</div>
                        <div className="text-gray-500 text-sm">{alert.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-bold px-3 py-1 rounded-lg mb-1 border ${getSeverityColor(alert.severity)}`}>
                        {translateSeverity(alert.severity)}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {alert.timestamp.toLocaleTimeString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="bg-[#00FF88] text-black px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-[#00DD77] transition-all"
                      >
                        Reconnaître
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Violations Tab */}
        {activeTab === 'violations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FaExclamationTriangle className="text-amber-400" />
                Violations de Sécurité
              </h3>
              <div className="text-sm text-gray-400">
                {violations.length} violations totales
              </div>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
              {violations.map((violation) => (
                <div key={violation.id} className="flex items-center justify-between p-4 bg-gray-900/30 rounded-xl border border-gray-800/50 hover:border-gray-700/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <FaTimesCircle className="text-red-400" size={20} />
                    </div>
                    <div>
                      <div className="text-white font-bold text-base mb-1">
                        {violation.userName || 'Utilisateur Inconnu'}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {violation.location} • {violation.details}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-400 text-sm font-bold mb-1">
                      {translateViolationType(violation.type)}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {violation.timestamp.toLocaleString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

export default SecurityPanel