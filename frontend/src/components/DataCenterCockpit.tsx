import React, { useState } from 'react';
import {
  Shield, Lock, Thermometer, Network, ChevronRight,
  Bell, User, Settings, Menu, X, Home, Monitor,
  Building, Server, BarChart3
} from 'lucide-react';
import NetworkFlowChart from './charts/NetworkFlowChart';
import NetworkTopology from './charts/NetworkTopology';

const DataCenterSecurityDashboard = () => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [activeMenu, setActiveMenu] = useState('cockpit');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'overview', icon: Home, label: 'Overview', subtitle: 'Vue générale' },
    { id: 'cockpit', icon: Monitor, label: 'Cockpit', subtitle: 'Centre de contrôle' },
    { id: 'equipment', icon: Settings, label: 'Equipment', subtitle: 'Gestion équipements' },
    { id: 'zones', icon: Building, label: 'Zones', subtitle: 'Gestion des zones' },
    { id: 'racks', icon: Server, label: 'Racks', subtitle: 'Infrastructure serveurs' },
    { id: 'monitoring', icon: BarChart3, label: 'Monitoring', subtitle: 'Surveillance temps réel' },
    { id: 'security', icon: Shield, label: 'Security', subtitle: 'Sécurité & accès' }
  ];

  const sections = [
    {
      id: 'physical',
      title: 'Sécurité Physique Interne',
      icon: Shield,
      details: {
        zones: [
          { name: 'Zone Réception', level: 'Public', access: 'Libre', personnel: '12/20', status: 'normal' },
          { name: 'Zone Technique', level: 'Restreint', access: 'Badge requis', personnel: '8/15', status: 'normal' },
          { name: 'Salle Serveurs', level: 'Sensible', access: 'Biométrie + Badge', personnel: '3/10', status: 'secure' },
          { name: 'Zone Critique', level: 'Critique', access: 'Double authentification', personnel: '2/5', status: 'secure' }
        ],
        systems: [
          { name: 'Contrôle d\'accès', status: 'active', lastCheck: '2 min ago' },
          { name: 'Surveillance vidéo', status: 'active', cameras: '24/24 actives' },
          { name: 'Détection intrusion', status: 'active', sensors: '48/48 opérationnels' },
          { name: 'Système anti-incendie', status: 'active', lastTest: 'Il y a 3 jours' }
        ]
      }
    },
    {
      id: 'policy',
      title: 'Politique de Sécurité',
      icon: Lock,
      details: {
        policies: [
          { name: 'Contrôle d\'accès physique', compliance: '100%', lastUpdate: '2024-01-15' },
          { name: 'Gestion des identités', compliance: '98%', lastUpdate: '2024-01-10' },
          { name: 'Chiffrement des données', compliance: '100%', lastUpdate: '2024-01-20' },
          { name: 'Audit et traçabilité', compliance: '95%', lastUpdate: '2024-01-18' }
        ],
        certifications: [
          { name: 'ISO 27001:2022', status: 'Certifié', validity: '2025-12-31' },
          { name: 'SOC 2 Type II', status: 'Certifié', validity: '2025-06-30' },
          { name: 'Tier III', status: 'Certifié', validity: 'Permanent' },
          { name: 'PCI DSS', status: 'Conforme', validity: '2025-09-15' }
        ]
      }
    },
    {
      id: 'climate',
      title: 'Climatisation & Environnement',
      icon: Thermometer,
      details: {
        temperature: { current: '21.5°C', target: '22°C', min: '20°C', max: '24°C', status: 'optimal' },
        humidity: { current: '45%', target: '45-55%', status: 'optimal' },
        cooling: [
          { unit: 'CRAC-01', status: 'active', load: '67%', temp: '21.2°C' },
          { unit: 'CRAC-02', status: 'active', load: '72%', temp: '21.8°C' },
          { unit: 'CRAC-03', status: 'standby', load: '0%', temp: '-' },
          { unit: 'CRAC-04', status: 'active', load: '58%', temp: '21.5°C' }
        ],
        airflow: { current: '15,200 CFM', efficiency: '92%', pressure: 'Positive' }
      }
    },
    {
      id: 'network',
      title: 'Flux Réseau & Connectivité',
      icon: Network,
      details: {
        bandwidth: { total: '10 Gb/s', used: '6.8 Gb/s', available: '3.2 Gb/s', utilization: '68%' },
        connections: [
          { type: 'Core Switch', status: 'active', throughput: '8.5 Gb/s', latency: '0.2ms' },
          { type: 'Distribution', status: 'active', throughput: '5.2 Gb/s', latency: '0.3ms' },
          { type: 'Access Layer', status: 'active', throughput: '3.1 Gb/s', latency: '0.5ms' },
          { type: 'WAN Links', status: 'active', throughput: '2.8 Gb/s', latency: '2.1ms' }
        ],
        security: [
          { name: 'Firewall Principal', status: 'active', blocked: '1,247 menaces/h' },
          { name: 'IDS/IPS', status: 'active', alerts: '23 alertes/h' },
          { name: 'DDoS Protection', status: 'active', attacks: '0 en cours' },
          { name: 'VPN Gateway', status: 'active', tunnels: '156 actifs' }
        ]
      }
    }
  ];

  const renderDetails = () => {
    const section = sections.find(s => s.id === selectedSection);
    if (!section) return null;

    switch (selectedSection) {
      case 'physical':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Zones de Sécurité</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.details.zones.map((zone, index) => (
                  <div key={index} className="bg-black/40 p-4 rounded-lg border border-emerald-500/30">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white">{zone.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        zone.status === 'secure' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {zone.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div>Niveau: {zone.level}</div>
                      <div>Accès: {zone.access}</div>
                      <div>Personnel: {zone.personnel}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Systèmes de Sécurité</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.details.systems.map((system, index) => (
                  <div key={index} className="bg-black/40 p-4 rounded-lg border border-emerald-500/30">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white">{system.name}</h4>
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-medium">
                        {system.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-400">
                      {system.lastCheck && <div>Dernière vérification: {system.lastCheck}</div>}
                      {system.cameras && <div>Caméras: {system.cameras}</div>}
                      {system.sensors && <div>Capteurs: {system.sensors}</div>}
                      {system.lastTest && <div>Dernier test: {system.lastTest}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'policy':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Politiques de Sécurité</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.details.policies.map((policy, index) => (
                  <div key={index} className="bg-black/40 p-4 rounded-lg border border-emerald-500/30">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white">{policy.name}</h4>
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-medium">
                        {policy.compliance}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Dernière mise à jour: {policy.lastUpdate}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Certifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.details.certifications.map((cert, index) => (
                  <div key={index} className="bg-black/40 p-4 rounded-lg border border-emerald-500/30">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white">{cert.name}</h4>
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-medium">
                        {cert.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Validité: {cert.validity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'climate':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/40 p-6 rounded-lg border border-emerald-500/30">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4">Température</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Actuelle:</span>
                    <span className="text-white font-medium">{section.details.temperature.current}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cible:</span>
                    <span className="text-white font-medium">{section.details.temperature.target}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plage:</span>
                    <span className="text-white font-medium">{section.details.temperature.min} - {section.details.temperature.max}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Statut:</span>
                    <span className="text-emerald-400 font-medium">{section.details.temperature.status}</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 p-6 rounded-lg border border-emerald-500/30">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4">Humidité</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Actuelle:</span>
                    <span className="text-white font-medium">{section.details.humidity.current}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cible:</span>
                    <span className="text-white font-medium">{section.details.humidity.target}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Statut:</span>
                    <span className="text-emerald-400 font-medium">{section.details.humidity.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Unités de Climatisation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.details.cooling.map((unit, index) => (
                  <div key={index} className="bg-black/40 p-4 rounded-lg border border-emerald-500/30">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white">{unit.unit}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        unit.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {unit.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div>Charge: {unit.load}</div>
                      <div>Température: {unit.temp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black/40 p-6 rounded-lg border border-emerald-500/30">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Flux d'Air</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Débit</div>
                  <div className="text-white font-medium">{section.details.airflow.current}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Efficacité</div>
                  <div className="text-emerald-400 font-medium">{section.details.airflow.efficiency}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Pression</div>
                  <div className="text-emerald-400 font-medium">{section.details.airflow.pressure}</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'network':
        const networkFlowData = [
          { time: '00:00', inbound: 4.2, outbound: 3.1 },
          { time: '04:00', inbound: 3.8, outbound: 2.9 },
          { time: '08:00', inbound: 6.5, outbound: 5.2 },
          { time: '12:00', inbound: 8.1, outbound: 6.8 },
          { time: '16:00', inbound: 7.3, outbound: 5.9 },
          { time: '20:00', inbound: 5.7, outbound: 4.4 },
        ];

        return (
          <div className="space-y-8">
            <div className="bg-black/40 p-6 rounded-lg border border-emerald-500/30">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Bande Passante</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Total</div>
                  <div className="text-white font-medium">{section.details.bandwidth.total}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Utilisé</div>
                  <div className="text-emerald-400 font-medium">{section.details.bandwidth.used}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Disponible</div>
                  <div className="text-emerald-400 font-medium">{section.details.bandwidth.available}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Utilisation</div>
                  <div className="text-emerald-400 font-medium">{section.details.bandwidth.utilization}</div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 p-6 rounded-lg border border-emerald-500/30">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Flux Réseau (24h)</h3>
              <NetworkFlowChart data={networkFlowData} />
            </div>

            <NetworkTopology />

            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Connexions Réseau</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.details.connections.map((conn, index) => (
                  <div key={index} className="bg-black/40 p-4 rounded-lg border border-emerald-500/30">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white">{conn.type}</h4>
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-medium">
                        {conn.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div>Débit: {conn.throughput}</div>
                      <div>Latence: {conn.latency}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Sécurité Réseau</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.details.security.map((sec, index) => (
                  <div key={index} className="bg-black/40 p-4 rounded-lg border border-emerald-500/30">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white">{sec.name}</h4>
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-medium">
                        {sec.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-400">
                      {sec.blocked && <div>Menaces bloquées: {sec.blocked}</div>}
                      {sec.alerts && <div>Alertes: {sec.alerts}</div>}
                      {sec.attacks && <div>Attaques: {sec.attacks}</div>}
                      {sec.tunnels && <div>Tunnels: {sec.tunnels}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black overflow-hidden">
      {/* Main Content */}
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 lg:p-8 border-b border-emerald-500/30 bg-black/40">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              Centre de Contrôle
            </h1>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          <p className="text-slate-400 text-sm lg:text-base">Surveillance et contrôle en temps réel</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {selectedSection ? (
            <div className="space-y-6 max-w-6xl mx-auto">
              <button
                onClick={() => setSelectedSection(null)}
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-4 transition-colors"
              >
                <X size={20} />
                Fermer
              </button>
              <div className="bg-black/40 border border-emerald-500/30 rounded-xl p-6 lg:p-8">
                {renderDetails()}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 max-w-6xl mx-auto">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    className="group relative p-6 lg:p-8 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-slate-900/40 to-black/40 hover:border-emerald-500/60 hover:bg-slate-900/60 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 group-hover:border-emerald-500/60 transition-colors">
                        <Icon size={28} className="text-emerald-400" />
                      </div>
                      <ChevronRight size={24} className="text-slate-600 group-hover:text-emerald-400 transition-all group-hover:translate-x-1" />
                    </div>
                    
                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                      {section.title}
                    </h3>
                    
                    <p className="text-slate-400 text-sm">
                      Cliquer pour voir les détails
                    </p>

                    <div className="absolute top-4 right-4 w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute inset-0 lg:hidden bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-emerald-950/40 to-slate-950 border-r border-emerald-500/30 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-emerald-500/30 border border-emerald-500 text-emerald-400'
                      : 'text-slate-400 hover:bg-emerald-500/10 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <div className="text-left flex-1">
                    <div className={`font-medium text-sm ${isActive ? 'text-emerald-400' : 'text-white'}`}>{item.label}</div>
                    <div className="text-xs text-slate-500">{item.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataCenterSecurityDashboard;