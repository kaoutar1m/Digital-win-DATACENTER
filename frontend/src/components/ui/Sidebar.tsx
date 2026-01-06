import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBuilding, FaServer, FaShieldAlt, FaHome, FaChartLine, FaCog, FaChevronLeft, FaChevronRight, FaBell, FaTimes, FaUser, FaDesktop, FaTools, FaSearch, FaSun, FaMoon, FaLanguage, FaHistory, FaStar, FaMapMarkerAlt, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaChevronDown, FaChevronUp, FaExternalLinkAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAlertSystem } from '../../hooks/useAlertSystem';
import { useDataCenter } from '../../contexts/DataCenterContext';
import { useDebounce } from '../../hooks/useDebounce';

/* ------------------------------------------------------------------ */
/*  SIDEBAR – Design unifié avec le dashboard                         */
/* ------------------------------------------------------------------ */

const menuItems = [
  {
    path: '/',
    label: 'Overview',
    icon: FaHome,
    color: '#00FF88',
    description: 'Dashboard principal',
    category: 'main'
  },
 
  {
    path: '/cockpit',
    label: 'Cockpit',
    icon: FaDesktop,
    color: '#00FF88',
    description: 'Centre de contrôle',
    category: 'operations',
    highlight: true
  },
  {
    path: '/equipment',
    label: 'Equipment',
    icon: FaTools,
    color: '#00FF88',
    description: 'Gestion équipements',
    category: 'operations',
    highlight: true
  },
  {
    path: '/zones',
    label: 'Zones',
    icon: FaBuilding,
    color: '#00FF88',
    description: 'Gestion des zones',
    category: 'infrastructure'
  },
  {
    path: '/racks',
    label: 'Racks',
    icon: FaServer,
    color: '#00FF88',
    description: 'Infrastructure serveurs',
    category: 'infrastructure'
  },
  {
    path: '/security',
    label: 'Security',
    icon: FaShieldAlt,
    color: '#00FF88',
    description: 'Sécurité & accès',
    category: 'security'
  },
  {
    path: '/monitoring',
    label: 'Monitoring',
    icon: FaChartLine,
    color: '#00FF88',
    description: 'Surveillance temps réel',
    category: 'monitoring'
  },
  {
    path: '/bcm',
    label: 'BCM',
    icon: FaCog,
    color: '#00FF88',
    description: 'Business continuity',
    category: 'management'
  },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { alerts, acknowledgeAlert } = useAlertSystem();
  const { state: dataCenterState } = useDataCenter();

  // Enhanced state
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showAlertList, setShowAlertList] = useState(false);
  const [showAlertDetail, setShowAlertDetail] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentItems, setRecentItems] = useState<string[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState('fr');
  const [notificationSettings, setNotificationSettings] = useState({
    sound: true,
    visual: true,
    criticalOnly: false
  });

  const latestAlert = useMemo(() => {
    const active = alerts.filter(a => !a.acknowledged);
    return active.length > 0 ? active[active.length - 1] : null;
  }, [alerts]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevLatestRef = useRef(latestAlert);

  useEffect(() => {
    if (latestAlert && latestAlert.id !== prevLatestRef.current?.id) {
      audioRef.current = new Audio('/sounds/beep-short.mp3');
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {});
    }
    prevLatestRef.current = latestAlert;
  }, [latestAlert]);

  const activeAlertCount = alerts.filter(a => !a.acknowledged).length;

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Search functionality
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      const results: any[] = [];

      // Search in zones
      dataCenterState.zones.forEach(zone => {
        if (zone.name.toLowerCase().includes(query) || zone.description?.toLowerCase().includes(query)) {
          results.push({
            type: 'zone',
            item: zone,
            label: zone.name,
            description: zone.description || 'Zone de sécurité',
            path: `/zones/${zone.id}`,
            icon: FaBuilding
          });
        }
      });

      // Search in equipment
      dataCenterState.equipment.forEach(equipment => {
        if (equipment.name.toLowerCase().includes(query) || equipment.type.toLowerCase().includes(query)) {
          results.push({
            type: 'equipment',
            item: equipment,
            label: equipment.name,
            description: `Type: ${equipment.type}`,
            path: `/equipment/${equipment.id}`,
            icon: FaTools
          });
        }
      });

      // Search in alerts
      alerts.forEach(alert => {
        if (alert.title?.toLowerCase().includes(query) || alert.description?.toLowerCase().includes(query)) {
          results.push({
            type: 'alert',
            item: alert,
            label: alert.title || alert.message || 'Alerte',
            description: alert.description || alert.message || '',
            path: '#',
            icon: FaBell
          });
        }
      });

      setSearchResults(results.slice(0, 10)); // Limit to 10 results
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery, dataCenterState.zones, dataCenterState.equipment, alerts]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowAlertList(false);
        setShowAlertDetail(null);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add to recent items
  const addToRecent = useCallback((path: string) => {
    setRecentItems(prev => {
      const filtered = prev.filter(item => item !== path);
      return [path, ...filtered].slice(0, 5);
    });
  }, []);

  // Handle alert acknowledgment
  const handleAcknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  }, [acknowledgeAlert]);

  // Get alert severity color
  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Get alert icon
  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return FaExclamationTriangle;
      case 'high': return FaExclamationTriangle;
      case 'medium': return FaInfoCircle;
      case 'low': return FaCheckCircle;
      default: return FaBell;
    }
  };

  return (
    <>
      <aside 
        className={`
          h-screen flex flex-col relative
          transition-all duration-500 ease-in-out
          ${collapsed ? 'w-20' : 'w-72'}
        `}
        style={{
          background: 'linear-gradient(180deg, #0F1419 0%, #1A1F2E 100%)',
          borderRight: '1px solid rgba(0, 255, 136, 0.1)',
        }}
      >
        {/* Bordure lumineuse effet néon */}
        <div 
          className="absolute top-0 right-0 w-[1px] h-full opacity-30"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, #00FF88 50%, transparent 100%)',
            boxShadow: '0 0 10px rgba(0, 255, 136, 0.3)',
          }}
        />

        {/* Header */}
        <div className="relative px-6 py-6 border-b border-gray-800/50">
          <div className="relative flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #00FF88 0%, #00CC6F 100%)',
                  boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)',
                }}
              >
                <div className="w-5 h-5 rounded-full bg-white/90" />
              </div>
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Data Center 3D
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">Premium Dashboard</p>
              </div>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-800/50 border border-gray-700/50 flex items-center justify-center text-gray-400 hover:text-[#00FF88] hover:border-[#00FF88]/30 transition-all duration-300"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isHovered = hoveredItem === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                aria-label={item.label}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-300 group
                  ${collapsed ? 'justify-center' : ''}
                  ${isActive 
                    ? 'bg-[#00FF88]/10 text-white border border-[#00FF88]/20' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                  }
                `}
              >
                {/* Bordure gauche active */}
                {isActive && (
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full"
                    style={{ 
                      background: '#00FF88',
                      boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
                    }}
                  />
                )}

                {/* Icône */}
                <div className="relative flex-shrink-0">
                  <item.icon 
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive ? 'text-[#00FF88]' : 'text-gray-400 group-hover:text-gray-200'
                    }`} 
                  />
                </div>

                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                    } transition-colors duration-300`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300 truncate">
                      {item.description}
                    </div>
                  </div>
                )}

                {/* Tooltip en mode collapsed */}
                {collapsed && isHovered && (
                  <div 
                    className="fixed left-20 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 shadow-2xl whitespace-nowrap z-50"
                    style={{ 
                      marginTop: '-40px',
                      boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)' 
                    }}
                  >
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Section Alertes */}
        <div className={`border-t border-gray-800/50 transition-all duration-500 ${collapsed ? 'px-2 py-3' : 'px-3 py-3'}`}>
          <button
            onClick={() => setShowAlertList(true)}
            className={`
              w-full relative flex items-center gap-3 rounded-lg
              transition-all duration-300 group
              ${collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'}
              ${activeAlertCount > 0 
                ? 'bg-red-500/10 border border-red-500/30 hover:bg-red-500/20' 
                : 'bg-gray-800/30 border border-gray-700/30 hover:bg-gray-800/50'
              }
            `}
          >
            <div className="relative flex-shrink-0">
              <FaBell className={`w-5 h-5 ${activeAlertCount > 0 ? 'text-red-400' : 'text-gray-400'}`} />
              {activeAlertCount > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>

            {!collapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-white">Alertes</div>
                  {latestAlert ? (
                    <div className="text-xs text-gray-300 truncate">
                      {latestAlert.message}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">Aucune alerte</div>
                  )}
                </div>

                {activeAlertCount > 0 && (
                  <div className="flex-shrink-0 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                    {activeAlertCount}
                  </div>
                )}
              </>
            )}
          </button>
        </div>

        {/* Footer - Profil utilisateur */}
        {!collapsed && (
          <div className="px-3 py-3 border-t border-gray-800/50">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800/30 border border-gray-700/30">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00FF88] to-[#00CC6F] flex items-center justify-center text-black font-bold flex-shrink-0">
                <FaUser className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">Admin User</div>
                <div className="text-xs text-gray-500 truncate">admin@datacenter.io</div>
              </div>
              <button 
                className="flex-shrink-0 w-7 h-7 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
                aria-label="Settings"
              >
                <FaCog className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Modale Liste des Alertes */}
        {showAlertList && (
          <div className="fixed inset-0 bg-black/90 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
            <div 
              className="w-full max-w-3xl max-h-[85vh] rounded-xl overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(180deg, #0F1419 0%, #1A1F2E 100%)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800/50">
                <h2 className="text-2xl font-bold text-[#00FF88]">Centre d'Alertes</h2>
                <button 
                  onClick={() => setShowAlertList(false)} 
                  className="w-8 h-8 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {/* Liste des alertes */}
              <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {activeAlertCount === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <div className="text-5xl mb-3">✅</div>
                    <div className="text-lg">Aucune alerte active</div>
                    <div className="text-sm text-gray-600 mt-2">Tous les systèmes fonctionnent normalement</div>
                  </div>
                ) : (
                  alerts.filter(a => !a.acknowledged).map((alert, idx) => (
                    <div
                      key={alert.id}
                      className="rounded-lg p-4 border-l-4 animate-fadeIn"
                      style={{ 
                        background: 'rgba(30, 35, 45, 0.5)',
                        borderLeftColor: alert.level === 'critical' ? '#ef4444' : alert.level === 'warning' ? '#f59e0b' : '#4A90E2',
                        animationDelay: `${idx * 50}ms` 
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="text-2xl flex-shrink-0">
                            {alert.level === 'critical' ? '🚨' : alert.level === 'warning' ? '⚠️' : 'ℹ️'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span 
                                className="text-xs font-bold px-2 py-1 rounded text-black"
                                style={{ 
                                  backgroundColor: alert.level === 'critical' ? '#ef4444' : alert.level === 'warning' ? '#f59e0b' : '#4A90E2' 
                                }}
                              >
                                {alert.level.toUpperCase()}
                              </span>
                              {alert.rack_id && (
                                <span className="text-xs text-[#00FF88] font-medium">
                                  Rack {alert.rack_id}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-white mb-2">{alert.message}</p>
                            <div className="text-xs text-gray-500">
                              {new Date(alert.timestamp).toLocaleString('fr-FR')}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button className="bg-[#00FF88] text-black px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#00DD77] transition-colors">
                            Acquitter
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Statistiques */}
              <div className="px-6 py-4 border-t border-gray-800/50">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-[#00FF88]">{alerts.length}</div>
                    <div className="text-xs text-gray-500 mt-1">Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">
                      {alerts.filter(a => a.level === 'critical').length}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Critiques</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {alerts.filter(a => a.level === 'warning').length}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Avertissements</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">
                      {alerts.filter(a => a.level === 'info').length}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Info</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Modal */}
        {showSearch && (
          <div className="fixed inset-0 bg-black/90 z-50 flex justify-center items-start pt-20 backdrop-blur-sm">
            <div
              className="w-full max-w-2xl mx-4 rounded-xl overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(180deg, #0F1419 0%, #1A1F2E 100%)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
              }}
            >
              {/* Search Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800/50">
                <FaSearch className="w-5 h-5 text-[#00FF88]" />
                <input
                  type="text"
                  placeholder="Rechercher zones, équipements, alertes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
                  autoFocus
                />
                <button
                  onClick={() => setShowSearch(false)}
                  className="w-8 h-8 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {searchResults.length > 0 ? (
                  <div className="p-4 space-y-2">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (result.type === 'alert') {
                            setShowAlertDetail(result.item.id);
                          } else {
                            navigate(result.path);
                            addToRecent(result.path);
                          }
                          setShowSearch(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800/30 transition-colors text-left"
                      >
                        <result.icon className="w-5 h-5 text-[#00FF88] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            {result.label}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {result.description}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 capitalize flex-shrink-0">
                          {result.type}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="p-8 text-center text-gray-500">
                    <FaSearch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <div className="text-lg">Aucun résultat trouvé</div>
                    <div className="text-sm mt-2">Essayez avec d'autres termes</div>
                  </div>
                ) : (
                  <div className="p-4">
                    {/* Recent Items */}
                    {recentItems.length > 0 && (
                      <div className="mb-6">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-3 px-4">
                          Récents
                        </div>
                        <div className="space-y-1">
                          {recentItems.map((path, idx) => {
                            const menuItem = menuItems.find(item => item.path === path);
                            if (!menuItem) return null;
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  navigate(path);
                                  setShowSearch(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800/30 transition-colors text-left"
                              >
                                <menuItem.icon className="w-4 h-4 text-[#00FF88]" />
                                <div className="text-sm text-gray-300">{menuItem.label}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="mb-6">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-3 px-4">
                        Actions rapides
                      </div>
                      <div className="grid grid-cols-2 gap-2 px-4">
                        <button
                          onClick={() => {
                            navigate('/cockpit');
                            setShowSearch(false);
                          }}
                          className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors text-left"
                        >
                          <FaDesktop className="w-4 h-4 text-[#00FF88]" />
                          <div className="text-sm text-gray-300">Cockpit</div>
                        </button>
                        <button
                          onClick={() => {
                            navigate('/monitoring');
                            setShowSearch(false);
                          }}
                          className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors text-left"
                        >
                          <FaChartLine className="w-4 h-4 text-[#00FF88]" />
                          <div className="text-sm text-gray-300">Monitoring</div>
                        </button>
                        <button
                          onClick={() => {
                            navigate('/security');
                            setShowSearch(false);
                          }}
                          className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors text-left"
                        >
                          <FaShieldAlt className="w-4 h-4 text-[#00FF88]" />
                          <div className="text-sm text-gray-300">Sécurité</div>
                        </button>
                        <button
                          onClick={() => {
                            navigate('/bcm');
                            setShowSearch(false);
                          }}
                          className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors text-left"
                        >
                          <FaCog className="w-4 h-4 text-[#00FF88]" />
                          <div className="text-sm text-gray-300">BCM</div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-gray-800/50">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div>Appuyez sur Échap pour fermer</div>
                  <div>Ctrl+K pour ouvrir la recherche</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alert Detail Modal */}
        {showAlertDetail && (
          <div className="fixed inset-0 bg-black/90 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
            <div
              className="w-full max-w-lg rounded-xl overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(180deg, #0F1419 0%, #1A1F2E 100%)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
              }}
            >
              {(() => {
                const alert = alerts.find(a => a.id === showAlertDetail);
                if (!alert) return null;

                return (
                  <>
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800/50">
                      <h2 className="text-xl font-bold text-[#00FF88]">Détail de l'alerte</h2>
                      <button
                        onClick={() => setShowAlertDetail(null)}
                        className="w-8 h-8 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getAlertColor(alert.level)}`} />
                        <span className="text-sm font-bold text-white uppercase">
                          {alert.level}
                        </span>
                        {alert.rack_id && (
                          <span className="text-sm text-[#00FF88]">
                            Rack {alert.rack_id}
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {alert.title || alert.message}
                        </h3>
                        <p className="text-gray-300">
                          {alert.description || alert.message}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Timestamp</div>
                          <div className="text-white">
                            {new Date(alert.timestamp).toLocaleString('fr-FR')}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Type</div>
                          <div className="text-white capitalize">{alert.type || 'Système'}</div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => {
                            handleAcknowledgeAlert(alert.id);
                            setShowAlertDetail(null);
                          }}
                          className="flex-1 bg-[#00FF88] text-black px-4 py-2 rounded-lg font-bold hover:bg-[#00DD77] transition-colors"
                        >
                          Acquitter
                        </button>
                        <button
                          onClick={() => setShowAlertDetail(null)}
                          className="px-4 py-2 rounded-lg bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 transition-colors"
                        >
                          Fermer
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* User Menu Modal */}
        {showUserMenu && (
          <div className="fixed inset-0 bg-black/90 z-50 flex justify-center items-start pt-20 backdrop-blur-sm">
            <div
              className="w-80 rounded-xl overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(180deg, #0F1419 0%, #1A1F2E 100%)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
              }}
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00FF88] to-[#00CC6F] flex items-center justify-center text-black font-bold">
                    <FaUser className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">Admin User</div>
                    <div className="text-sm text-gray-400">admin@datacenter.io</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800/30 transition-colors text-left">
                    <FaUser className="w-4 h-4 text-gray-400" />
                    <div className="text-sm text-gray-300">Profil</div>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800/30 transition-colors text-left">
                    <FaCog className="w-4 h-4 text-gray-400" />
                    <div className="text-sm text-gray-300">Paramètres</div>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800/30 transition-colors text-left">
                    <FaBell className="w-4 h-4 text-gray-400" />
                    <div className="text-sm text-gray-300">Notifications</div>
                  </button>
                  <div className="border-t border-gray-800/50 my-4" />
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/20 transition-colors text-left">
                    <FaExternalLinkAlt className="w-4 h-4 text-red-400" />
                    <div className="text-sm text-red-400">Déconnexion</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Styles CSS */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
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
      </aside>
    </>
  );
};

export default Sidebar;