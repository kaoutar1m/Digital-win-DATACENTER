import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Alert, AlertSeverity, AlertStatus } from '../../hooks/useAlertSystem';
import { FaDownload, FaClock, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaBell, FaFilter, FaSearch, FaCog, FaPlay, FaPause, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';

/* ------------------------------------------------------------------ */
/*  ENHANCED ALERT PANEL – Advanced features with bulk actions, trends, export */
/* ------------------------------------------------------------------ */

export interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => Promise<void>;
}

const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, onAcknowledge }) => {
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AlertStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBySeverity, setGroupBySeverity] = useState(true);
  const [showAcknowledged, setShowAcknowledged] = useState(true);
  const [prevCriticalCount, setPrevCriticalCount] = useState(0);
  const [timeFilter, setTimeFilter] = useState<'all' | '1h' | '24h' | '7d' | '30d'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showTrends, setShowTrends] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  /* ---- Sound notification for critical alerts ---- */
  useEffect(() => {
    const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length;
    if (criticalCount > prevCriticalCount) {
      audioRef.current = new Audio('/sounds/beep-short.mp3');
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {});
    }
    setPrevCriticalCount(criticalCount);
  }, [alerts, prevCriticalCount]);

  /* ---- Advanced filtering and search ---- */
  const filteredAndSearchedAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Severity filter
      if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;

      // Status filter
      if (filterStatus !== 'all' && alert.status !== filterStatus) return false;

      // Acknowledged filter
      if (!showAcknowledged && alert.acknowledged) return false;

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          alert.title.toLowerCase().includes(searchLower) ||
          alert.description?.toLowerCase().includes(searchLower) ||
          alert.type.toLowerCase().includes(searchLower) ||
          alert.source?.toLowerCase().includes(searchLower) ||
          alert.zone_name?.toLowerCase().includes(searchLower) ||
          alert.equipment_type?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [alerts, filterSeverity, filterStatus, showAcknowledged, searchTerm]);

  /* ---- Group alerts by severity ---- */
  const groupedAlerts = useMemo(() => {
    if (!groupBySeverity) return { all: filteredAndSearchedAlerts };

    const groups: Record<AlertSeverity | 'all', Alert[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      all: filteredAndSearchedAlerts
    };

    filteredAndSearchedAlerts.forEach((alert) => {
      groups[alert.severity].push(alert);
    });

    return groups;
  }, [filteredAndSearchedAlerts, groupBySeverity]);

  /* ---- Colors and icons for severity ---- */
  const severityMeta = {
    critical: { color: '#FF6B6B', bgColor: 'from-red-900/20 to-red-800/20', icon: '🚨', sound: true },
    high: { color: '#FF8C42', bgColor: 'from-orange-900/20 to-orange-800/20', icon: '⚠️' },
    medium: { color: '#FFD166', bgColor: 'from-yellow-900/20 to-yellow-800/20', icon: '⚡' },
    low: { color: '#4A90E2', bgColor: 'from-blue-900/20 to-blue-800/20', icon: 'ℹ️' },
  };

  /* ---- Status colors ---- */
  const statusMeta = {
    active: { color: '#FF6B6B', label: 'Active' },
    acknowledged: { color: '#FFD166', label: 'Acknowledged' },
    resolved: { color: '#00FF88', label: 'Resolved' },
    escalated: { color: '#FF8C42', label: 'Escalated' },
  };

  /* ---- Live statistics ---- */
  const stats = useMemo(() => {
    const total = alerts.length;
    const active = alerts.filter(a => a.status === 'active').length;
    const critical = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;
    const acknowledged = alerts.filter(a => a.acknowledged).length;
    const resolved = alerts.filter(a => a.status === 'resolved').length;

    return { total, active, critical, acknowledged, resolved };
  }, [alerts]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-[#0a0a0f] via-[#111827] to-[#1e1e2e] text-gray-200 rounded-2xl p-6 shadow-2xl border border-gray-700/50">
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold tracking-wide flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
          Centre d'Alertes Avancé
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGroupBySeverity(!groupBySeverity)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              groupBySeverity ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Grouper par Sévérité
          </button>
          <button
            onClick={() => setShowAcknowledged(!showAcknowledged)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              showAcknowledged ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Acquittées
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-5 space-y-3">
        <input
          type="text"
          placeholder="Rechercher des alertes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />

        <div className="flex flex-wrap gap-2">
          {/* Severity filters */}
          <div className="flex gap-1">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filterSeverity === 'all' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Toutes ({groupedAlerts.all.length})
            </button>
            {(['critical', 'high', 'medium', 'low'] as AlertSeverity[]).map((severity) => (
              <button
                key={severity}
                onClick={() => setFilterSeverity(severity)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filterSeverity === severity ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
                style={{ backgroundColor: filterSeverity === severity ? severityMeta[severity].color : undefined }}
              >
                {severityMeta[severity].icon} {severity} ({groupedAlerts[severity].length})
              </button>
            ))}
          </div>

          {/* Status filters */}
          <div className="flex gap-1">
            {(['active', 'acknowledged', 'resolved', 'escalated'] as AlertStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filterStatus === status ? 'text-white' : 'bg-gray-700 text-gray-300'
                }`}
                style={{ backgroundColor: filterStatus === status ? statusMeta[status].color : undefined }}
              >
                {statusMeta[status].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {groupBySeverity ? (
          // Grouped by severity
          Object.entries(severityMeta).map(([severity, meta]) => {
            const severityAlerts = groupedAlerts[severity as AlertSeverity];
            if (severityAlerts.length === 0) return null;

            return (
              <div key={severity} className={`bg-gradient-to-r ${meta.bgColor} rounded-lg p-4 border-l-4`} style={{ borderLeftColor: meta.color }}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">{meta.icon}</span>
                  {severity.charAt(0).toUpperCase() + severity.slice(1)} ({severityAlerts.length})
                </h3>
                <div className="space-y-2">
                  {severityAlerts.map((alert, idx) => (
                    <AlertItem key={alert.id} alert={alert} severityMeta={severityMeta} statusMeta={statusMeta} acknowledgeAlert={onAcknowledge} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          // Flat list
          groupedAlerts.all.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <div className="text-4xl mb-2">✅</div>
              <div>Aucune alerte trouvée</div>
            </div>
          ) : (
            groupedAlerts.all.map((alert) => (
              <AlertItem key={alert.id} alert={alert} severityMeta={severityMeta} statusMeta={statusMeta} acknowledgeAlert={onAcknowledge} />
            ))
          )
        )}
      </div>

      {/* Live Statistics */}
      <div className="mt-6 pt-4 border-t border-gray-700/50 grid grid-cols-5 gap-3 text-center text-xs">
        <div>
          <div className="text-lg font-bold text-cyan-400">{stats.total}</div>
          <div className="text-gray-400">Total</div>
        </div>
        <div>
          <div className="text-lg font-bold text-red-400">{stats.active}</div>
          <div className="text-gray-400">Actives</div>
        </div>
        <div>
          <div className="text-lg font-bold text-orange-400">{stats.critical}</div>
          <div className="text-gray-400">Critiques</div>
        </div>
        <div>
          <div className="text-lg font-bold text-yellow-400">{stats.acknowledged}</div>
          <div className="text-gray-400">Acquittées</div>
        </div>
        <div>
          <div className="text-lg font-bold text-green-400">{stats.resolved}</div>
          <div className="text-gray-400">Résolues</div>
        </div>
      </div>
    </div>
  );
};

export default AlertPanel;

// Alert Item Component
const AlertItem: React.FC<{
  alert: Alert;
  severityMeta: any;
  statusMeta: any;
  acknowledgeAlert: (id: string) => void;
}> = ({ alert, severityMeta, statusMeta, acknowledgeAlert }) => {
  return (
    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-xl">{severityMeta[alert.severity].icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-bold px-2 py-1 rounded text-black"
                style={{ backgroundColor: severityMeta[alert.severity].color }}
              >
                {alert.severity.toUpperCase()}
              </span>
              <span
                className="text-xs font-medium px-2 py-1 rounded text-white"
                style={{ backgroundColor: statusMeta[alert.status].color }}
              >
                {statusMeta[alert.status].label}
              </span>
              {alert.zone_name && (
                <span className="text-xs text-cyan-300">Zone: {alert.zone_name}</span>
              )}
              {alert.equipment_type && (
                <span className="text-xs text-purple-300">Équipement: {alert.equipment_type}</span>
              )}
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">{alert.title}</h4>
            {alert.description && (
              <p className="text-xs text-gray-300 mb-2">{alert.description}</p>
            )}
            <div className="text-xs text-gray-400">
              {new Date(alert.created_at).toLocaleString('fr-FR')}
              {alert.source && ` • Source: ${alert.source}`}
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          {!alert.acknowledged && alert.status === 'active' && (
            <button
              onClick={() => acknowledgeAlert(alert.id)}
              className="bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-green-500 transition-colors"
            >
              Acquitter
            </button>
          )}
          <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-blue-500 transition-colors">
            Détails
          </button>
        </div>
      </div>
    </div>
  );
};
